import asyncHandler from "express-async-handler";
import { Notification } from "../models/Notification.js";
import { Order } from "../models/Order.js";

export const myNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30);
  const assignmentNotifications = notifications.filter((n) => n.type === "delivery_assignment");

  if (assignmentNotifications.length === 0) {
    res.json({ notifications });
    return;
  }

  const orderIds = assignmentNotifications.map((n) => n.orderId).filter(Boolean);
  const orders = await Order.find({ _id: { $in: orderIds } }, "deliveryStaffId deliveryStatus status").lean();
  const activeOrderIds = new Set(
    orders
      .filter(
        (order) =>
          String(order.deliveryStaffId) === String(req.user._id) &&
          order.deliveryStatus === "pending" &&
          !["delivered", "cancelled"].includes(order.status)
      )
      .map((order) => String(order._id))
  );

  const staleAssignmentIds = assignmentNotifications
    .filter((n) => !activeOrderIds.has(String(n.orderId)))
    .map((n) => n._id);

  if (staleAssignmentIds.length > 0) {
    await Notification.deleteMany({ _id: { $in: staleAssignmentIds }, userId: req.user._id });
  }

  res.json({
    notifications: notifications.filter(
      (n) => n.type !== "delivery_assignment" || activeOrderIds.has(String(n.orderId))
    )
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }
  notification.read = true;
  await notification.save();
  res.json({ notification });
});
