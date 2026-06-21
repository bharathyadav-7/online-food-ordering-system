import asyncHandler from "express-async-handler";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { Restaurant } from "../models/Restaurant.js";
import { Notification } from "../models/Notification.js";
import { Review } from "../models/Review.js";

const ROLES = ["customer", "admin", "restaurant", "delivery"];

export const adminSummary = asyncHandler(async (req, res) => {
  const [users, orders, restaurants, reviews, notifications, recentNotifications] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Restaurant.countDocuments(),
    Review.countDocuments(),
    Notification.countDocuments(),
    Notification.find({}).populate("userId", "name email role").sort({ createdAt: -1 }).limit(12)
  ]);
  res.json({ summary: { users, orders, restaurants, reviews, notifications }, activity: recentNotifications });
});

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-passwordHash -cart").sort({ createdAt: -1 });
  res.json({ users });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body || {};
  if (!ROLES.includes(role)) {
    res.status(400);
    throw new Error(`role must be one of: ${ROLES.join(", ")}`);
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.role = role;
  await user.save();
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

export const listRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({}).populate("ownerId", "name email role").sort({ createdAt: -1 });
  res.json({ restaurants });
});

export const createRestaurant = asyncHandler(async (req, res) => {
  const { name, ownerId, location, description } = req.body || {};
  if (!name || !ownerId) {
    res.status(400);
    throw new Error("name and ownerId are required");
  }
  const owner = await User.findById(ownerId);
  if (!owner) {
    res.status(404);
    throw new Error("Owner user not found");
  }
  owner.role = "restaurant";
  await owner.save();
  const restaurant = await Restaurant.create({
    name: String(name).trim(),
    ownerId: owner._id,
    location: location ? String(location).trim() : "",
    description: description ? String(description).trim() : ""
  });
  res.status(201).json({ restaurant });
});
