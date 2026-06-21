import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },

    type: {
      type: String,
      enum: [
        "order",
        "order_placed",
        "order_update",
        "delivery_assignment",
        "review",
        "system"
      ],
      default: "system"
    },

    title: { type: String, default: "", trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
