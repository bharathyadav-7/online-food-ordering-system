import { Router } from "express";
import {
  createFood,
  deleteFood,
  getFood,
  listFood,
  updateFood
} from "../controllers/foodController.js";
import { requireAuth } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/", listFood);
router.get("/:id", getFood);

router.post("/", requireAuth, authorizeRoles("admin", "restaurant"), createFood);
router.put("/:id", requireAuth, authorizeRoles("admin", "restaurant"), updateFood);
router.delete("/:id", requireAuth, authorizeRoles("admin", "restaurant"), deleteFood);

export default router;

