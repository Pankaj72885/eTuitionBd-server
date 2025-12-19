import express from "express";
import {
  approveTuition,
  createTuition,
  deleteTuition,
  getAllTuitions,
  getStudentTuitions,
  getTuitionById,
  getTuitions,
  rejectTuition,
  updateTuition,
} from "../controllers/tuition.controller.js";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

const router = express.Router();

// Public routes
router.get("/", getTuitions);
router.get("/:id", getTuitionById);

// All routes below require authentication
router.use(auth);

// Student routes
router.post("/", role("student"), createTuition);
router.put("/:id", updateTuition);
router.delete("/:id", deleteTuition);
router.get("/student/my-tuitions", role("student"), getStudentTuitions);

// Admin routes
router.patch("/:id/approve", role("admin"), approveTuition);
router.patch("/:id/reject", role("admin"), rejectTuition);
router.get("/admin/all", role("admin"), getAllTuitions);

export default router;
