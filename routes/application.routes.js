import express from "express";
import {
  applyToTuition,
  deleteApplication,
  getStudentApplications,
  getTutorApplications,
  updateApplication,
  updateApplicationStatus,
} from "../controllers/application.controller.js";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.post("/", role("tutor"), applyToTuition);
router.get("/student", role("student"), getStudentApplications);
router.get("/tutor", role("tutor"), getTutorApplications);
router.patch("/:id", updateApplicationStatus);
router.put("/:id", role("tutor"), updateApplication);
router.delete("/:id", role("tutor"), deleteApplication);

export default router;
