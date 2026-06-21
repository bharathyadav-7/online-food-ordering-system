import { Router } from "express";
import {
  adminSummary,
  createRestaurant,
  listRestaurants,
  listUsers,
  updateUserRole
} from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(requireAuth, authorizeRoles("admin"));
router.get("/summary", adminSummary);
router.get("/users", listUsers);
router.put("/users/:id/role", updateUserRole);
router.get("/restaurants", listRestaurants);
router.post("/restaurants", createRestaurant);

export default router;
