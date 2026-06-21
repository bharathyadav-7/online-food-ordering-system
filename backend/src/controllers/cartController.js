import asyncHandler from "express-async-handler";
import { FoodItem } from "../models/FoodItem.js";
import { User } from "../models/User.js";

export const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("cart.foodItem");
  res.json({ cart: user.cart });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { foodItemId, quantity } = req.body || {};
  if (!foodItemId) {
    res.status(400);
    throw new Error("foodItemId is required");
  }
  const qty = Math.max(1, Number(quantity || 1));

  const item = await FoodItem.findById(foodItemId);
  if (!item) {
    res.status(404);
    throw new Error("Food item not found");
  }
  if (item.available === false) {
    res.status(400);
    throw new Error("Food item is currently unavailable");
  }

  const user = await User.findById(req.user._id);
  const existing = user.cart.find((ci) => String(ci.foodItem) === String(foodItemId));
  if (existing) existing.quantity += qty;
  else user.cart.push({ foodItem: foodItemId, quantity: qty });

  await user.save();
  const hydrated = await User.findById(req.user._id).populate("cart.foodItem");
  res.status(201).json({ cart: hydrated.cart });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body || {};
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty < 1) {
    res.status(400);
    throw new Error("quantity must be a number >= 1");
  }

  const user = await User.findById(req.user._id);
  const existing = user.cart.find((ci) => String(ci.foodItem) === String(req.params.foodItemId));
  if (!existing) {
    res.status(404);
    throw new Error("Cart item not found");
  }
  existing.quantity = qty;
  await user.save();
  const hydrated = await User.findById(req.user._id).populate("cart.foodItem");
  res.json({ cart: hydrated.cart });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter((ci) => String(ci.foodItem) !== String(req.params.foodItemId));
  await user.save();
  const hydrated = await User.findById(req.user._id).populate("cart.foodItem");
  res.json({ cart: hydrated.cart });
});

export const clearCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save();
  res.json({ cart: [] });
});

