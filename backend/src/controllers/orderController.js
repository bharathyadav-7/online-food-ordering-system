import asyncHandler from "express-async-handler";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { Restaurant } from "../models/Restaurant.js";
import { Notification } from "../models/Notification.js";

function calcTotal(items) {
  return items.reduce((sum, it) => sum + it.price * it.quantity, 0);
}

export const placeOrderFromCart = asyncHandler(async (req, res) => {
  const { paymentMethod = "cod", address = {} } = req.body || {};

  const user = await User.findById(req.user._id).populate("cart.foodItem");
  if (!user.cart.length) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  // Simulate payment failure for non-COD
  if (paymentMethod !== "cod" && Math.random() < 0.1) {
    res.status(400);
    throw new Error("Payment failed due to simulated bank error. Please try again.");
  }

  const items = user.cart.map((ci) => ({
    foodItem: ci.foodItem._id,
    name: ci.foodItem.name,
    price: ci.foodItem.price,
    quantity: ci.quantity,
    image: ci.foodItem.image
  }));

  const totalAmount = calcTotal(items);
  const restaurantId = user.cart.find((ci) => ci.foodItem?.restaurantId)?.foodItem.restaurantId;
  const order = await Order.create({
    userId: user._id,
    restaurantId,
    items,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === "cod" ? "pending" : "completed",
    deliveryAddress: address,
    status: "pending"
  });

  await Notification.create({
    userId: user._id,
    orderId: order._id,
    type: "order",
    title: "Order placed",
    message: `Your order #${String(order._id).slice(-6)} has been placed.`
  });

  if (restaurantId) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant?.ownerId) {
      await Notification.create({
        userId: restaurant.ownerId,
        orderId: order._id,
        type: "order_placed",
        title: "New customer order",
        message: `Order #${String(order._id).slice(-6)} has been placed by ${user.name}.`
      });
    }
  }

  user.cart = [];
  await user.save();

  res.status(201).json({ order });
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

export const restaurantOrders = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!restaurant) return res.json({ restaurant: null, orders: [] });
  const orders = await Order.find({ restaurantId: restaurant._id })
    .populate("userId", "name email role")
    .populate("deliveryStaffId", "name email")
    .sort({ createdAt: -1 });
  res.json({ restaurant, orders });
});

export const deliveryOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ deliveryStaffId: req.user._id })
    .populate("userId", "name email role")
    .populate("restaurantId", "name location")
    .sort({ updatedAt: -1 });
  res.json({ orders });
});

export const allOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("userId", "name email role")
    .populate("restaurantId", "name location")
    .populate("deliveryStaffId", "name email")
    .sort({ createdAt: -1 });
  res.json({ orders });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  const allowed = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`status must be one of: ${allowed.join(", ")}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (req.user.role === "restaurant") {
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
    if (!restaurant || String(order.restaurantId) !== String(restaurant._id)) {
      res.status(403);
      throw new Error("Forbidden");
    }
  }
  if (req.user.role === "delivery" && String(order.deliveryStaffId) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Forbidden");
  }

  order.status = status;
  await order.save();
  await Notification.create({
    userId: order.userId,
    orderId: order._id,
    type: "order",
    title: "Order status updated",
    message: `Your order #${String(order._id).slice(-6)} is now ${String(status).replaceAll("_", " ")}.`
  });
  res.json({ order });
});

export const assignDelivery = asyncHandler(async (req, res) => {
  const { deliveryStaffId } = req.body || {};
  const deliveryUser = await User.findOne({ _id: deliveryStaffId, role: "delivery" });
  if (!deliveryUser) {
    res.status(400);
    throw new Error("Valid delivery staff account is required");
  }
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  order.deliveryStaffId = deliveryUser._id;
  order.deliveryStatus = "pending";
  await order.save();
  await Notification.deleteMany({
    orderId: order._id,
    type: "delivery_assignment"
  });
  await Notification.create({
    userId: deliveryUser._id,
    orderId: order._id,
    type: "delivery_assignment",
    title: "New Delivery Assigned",
    message: `Order #${String(order._id).slice(-6)} has been assigned to you. Please accept or reject.`
  });
  res.json({ order });
});

export const acceptDelivery = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (req.user.role === "delivery" && String(order.deliveryStaffId) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Forbidden");
  }
  order.deliveryStatus = "accepted";
  await order.save();
  await Notification.deleteMany({
    userId: req.user._id,
    orderId: order._id,
    type: "delivery_assignment"
  });
  
  // Clean up assignment notification for this delivery staff if we want
  // Or just notify the restaurant
  const restaurant = await Restaurant.findById(order.restaurantId);
  if (restaurant) {
    await Notification.create({
      userId: restaurant.ownerId,
      orderId: order._id,
      type: "order",
      title: "Delivery Accepted",
      message: `Delivery for Order #${String(order._id).slice(-6)} has been accepted by ${req.user.name}.`
    });
  }
  res.json({ order });
});

export const rejectDelivery = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (req.user.role === "delivery" && String(order.deliveryStaffId) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Forbidden");
  }
  order.deliveryStatus = "rejected";
  order.deliveryStaffId = null; // Free it up
  await order.save();
  await Notification.deleteMany({
    userId: req.user._id,
    orderId: order._id,
    type: "delivery_assignment"
  });

  const restaurant = await Restaurant.findById(order.restaurantId);
  if (restaurant) {
    await Notification.create({
      userId: restaurant.ownerId,
      orderId: order._id,
      type: "order",
      title: "Delivery Rejected",
      message: `Delivery for Order #${String(order._id).slice(-6)} was rejected. Please assign a new delivery staff.`
    });
  }
  res.json({ order });
});

