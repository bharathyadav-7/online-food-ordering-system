import { Router } from "express";
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem
} from "../controllers/cartController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getCart);
router.post("/add", requireAuth, addToCart);
router.put("/:foodItemId", requireAuth, updateCartItem);
router.delete("/:foodItemId", requireAuth, removeCartItem);
router.post("/clear", requireAuth, clearCart);

export default router;

