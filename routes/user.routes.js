import express from "express";
import {
  changeUserRole,
  deleteUser,
  getAllUsers,
  getUserById,
  toggleUserVerification,
  updateUserProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

// Routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUserProfile);
router.patch("/:id/role", changeUserRole);
router.delete("/:id", deleteUser);
router.patch("/:id/verify", toggleUserVerification);

export default router;
