import { Router } from "express";
import { createReview, myReviews, orderReviews, restaurantReviews } from "../controllers/reviewController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, createReview);
router.get("/mine", requireAuth, myReviews);
router.get("/order/:orderId", requireAuth, orderReviews);
router.get("/restaurant/:restaurantId", restaurantReviews);

export default router;
