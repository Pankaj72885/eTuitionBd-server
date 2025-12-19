import express from "express";
import {
  createReview,
  getTutorReviews,
} from "../controllers/review.controller.js";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.post("/", role("student"), createReview);
router.get("/tutor/:tutorId", getTutorReviews);

export default router;
