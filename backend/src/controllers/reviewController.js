import asyncHandler from "express-async-handler";
import { Order } from "../models/Order.js";
import { Review } from "../models/Review.js";

export const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, title, comment } = req.body || {};
  const order = await Order.findOne({ _id: orderId, userId: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Delivered order not found");
  }
  if (order.status !== "delivered") {
    res.status(400);
    throw new Error("Reviews can be added after delivery");
  }
  const review = await Review.findOneAndUpdate(
    { userId: req.user._id, orderId: order._id },
    {
      userId: req.user._id,
      orderId: order._id,
      restaurantId: order.restaurantId,
      rating: Number(rating),
      title: title ? String(title).trim() : "",
      comment: comment ? String(comment).trim() : ""
    },
    { new: true, upsert: true, runValidators: true }
  );
  res.status(201).json({ review });
});

export const myReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ reviews });
});

export const orderReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ orderId: req.params.orderId })
    .populate("userId", "name")
    .sort({ createdAt: -1 });
  res.json({ reviews });
});

export const restaurantReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ restaurantId: req.params.restaurantId })
    .populate("userId", "name")
    .sort({ createdAt: -1 });
  const avg = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  res.json({ reviews, rating: avg, count: reviews.length });
});
