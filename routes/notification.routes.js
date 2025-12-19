import express from "express";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notification.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);

export default router;
