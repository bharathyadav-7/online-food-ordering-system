import { Router } from "express";
import { markNotificationRead, myNotifications } from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, myNotifications);
router.put("/:id/read", requireAuth, markNotificationRead);

export default router;
