import { Router } from "express";
import {
  allOrders,
  assignDelivery,
  acceptDelivery,
  rejectDelivery,
  deliveryOrders,
  myOrders,
  placeOrderFromCart,
  restaurantOrders,
  updateOrderStatus
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/place", requireAuth, placeOrderFromCart);
router.get("/mine", requireAuth, myOrders);
router.get("/restaurant", requireAuth, authorizeRoles("restaurant"), restaurantOrders);
router.get("/delivery", requireAuth, authorizeRoles("delivery"), deliveryOrders);

router.get("/", requireAuth, authorizeRoles("admin"), allOrders);
router.get("/delivery-staff", requireAuth, authorizeRoles("admin", "restaurant"), async (req, res) => {
  const { User } = await import("../models/User.js");
  const staff = await User.find({ role: "delivery" }, "name email");
  res.json({ staff });
});
router.put("/:id/status", requireAuth, authorizeRoles("admin", "restaurant", "delivery"), updateOrderStatus);
router.put("/:id/assign-delivery", requireAuth, authorizeRoles("admin", "restaurant"), assignDelivery);
router.put("/:id/accept-delivery", requireAuth, authorizeRoles("delivery"), acceptDelivery);
router.put("/:id/reject-delivery", requireAuth, authorizeRoles("delivery"), rejectDelivery);

export default router;
