import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { FoodItem } from "../models/FoodItem.js";
import { Restaurant } from "../models/Restaurant.js";
import { Review } from "../models/Review.js";

function normalizeImageUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^(data:|blob:)/i.test(raw)) return raw;

  let url = raw.startsWith("//") ? `https:${raw}` : raw;
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname === "drive.google.com") {
      const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      const id = fileMatch?.[1] || parsed.searchParams.get("id");
      if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
    }
    return parsed.href;
  } catch {
    return url.replace(/\s/g, "%20");
  }
}

async function attachRatings(items) {
  const restaurantIds = [
    ...new Set(items.map((item) => String(item.restaurantId || "")).filter((id) => mongoose.isValidObjectId(id)))
  ];
  if (!restaurantIds.length) return items;

  const ratings = await Review.aggregate([
    { $match: { restaurantId: { $in: restaurantIds.map((id) => new mongoose.Types.ObjectId(id)) } } },
    { $group: { _id: "$restaurantId", rating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } }
  ]);
  const byRestaurant = new Map(ratings.map((r) => [String(r._id), r]));
  return items.map((item) => {
    const obj = item.toObject();
    const rating = byRestaurant.get(String(item.restaurantId || ""));
    return rating ? { ...obj, rating: rating.rating, reviewCount: rating.reviewCount } : obj;
  });
}

export const listFood = asyncHandler(async (req, res) => {
  const { category, restaurantId } = req.query;
  const filter = category ? { category } : {};
  if (restaurantId) filter.restaurantId = restaurantId;
  const items = await FoodItem.find(filter).sort({ createdAt: -1 });
  res.json({ items: await attachRatings(items) });
});

export const getFood = asyncHandler(async (req, res) => {
  const item = await FoodItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Food item not found");
  }
  res.json({ item });
});

export const createFood = asyncHandler(async (req, res) => {
  const { name, price, category, image, description, restaurantId, available } = req.body || {};
  if (!name || price == null || !category || !image) {
    res.status(400);
    throw new Error("name, price, category, image are required");
  }
  let ownerRestaurantId = restaurantId;
  if (req.user?.role === "restaurant") {
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
    if (!restaurant) {
      res.status(400);
      throw new Error("Restaurant profile is required before adding menu items");
    }
    ownerRestaurantId = restaurant._id;
  }

  const item = await FoodItem.create({
    name: String(name).trim(),
    price: Number(price),
    category: String(category).trim(),
    image: normalizeImageUrl(image),
    description: description ? String(description).trim() : "",
    available: available == null ? true : Boolean(available),
    restaurantId: ownerRestaurantId || undefined
  });
  res.status(201).json({ item });
});

export const updateFood = asyncHandler(async (req, res) => {
  const item = await FoodItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Food item not found");
  }
  if (req.user?.role === "restaurant") {
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
    if (!restaurant || String(item.restaurantId) !== String(restaurant._id)) {
      res.status(403);
      throw new Error("Forbidden");
    }
  }
  const { name, price, category, image, description, available } = req.body || {};
  if (name != null) item.name = String(name).trim();
  if (price != null) item.price = Number(price);
  if (category != null) item.category = String(category).trim();
  if (image != null) item.image = normalizeImageUrl(image);
  if (description != null) item.description = String(description).trim();
  if (available != null) item.available = Boolean(available);

  await item.save();
  res.json({ item });
});

export const deleteFood = asyncHandler(async (req, res) => {
  const item = await FoodItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Food item not found");
  }
  if (req.user?.role === "restaurant") {
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
    if (!restaurant || String(item.restaurantId) !== String(restaurant._id)) {
      res.status(403);
      throw new Error("Forbidden");
    }
  }
  await item.deleteOne();
  res.json({ ok: true });
});
