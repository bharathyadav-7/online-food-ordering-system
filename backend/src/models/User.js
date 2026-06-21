import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    foodItem: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem", required: true },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin", "restaurant", "delivery"], default: "customer" },
    cart: { type: [cartItemSchema], default: [] }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

