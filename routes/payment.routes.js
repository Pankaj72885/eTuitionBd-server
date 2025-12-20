import express from "express";
import {
  approvePayment,
  createManualPayment,
  createPaymentIntent,
  getAllPayments,
  getStudentPayments,
  getTutorPayments,
  stripeWebhook,
} from "../controllers/payment.controller.js";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.post("/create-intent", role("student"), createPaymentIntent);
router.post("/manual", role("student"), createManualPayment);
router.post("/webhook", stripeWebhook);
router.put("/:id/approve", role("admin"), approvePayment);
router.get("/student", role("student"), getStudentPayments);
router.get("/tutor", role("tutor"), getTutorPayments);
router.get("/admin", role("admin"), getAllPayments);

export default router;
