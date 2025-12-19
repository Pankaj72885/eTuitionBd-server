import express from "express";
import { body } from "express-validator";
import {
  getCurrentUser,
  login,
  register,
} from "../controllers/auth.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Validation middleware
const validateRegister = [
  body("idToken").notEmpty().withMessage("Firebase ID token is required"),
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("role").isIn(["student", "tutor"]).withMessage("Valid role is required"),
  body("city").notEmpty().withMessage("City is required"),
];

const validateLogin = [
  body("idToken").notEmpty().withMessage("Firebase ID token is required"),
];

// Routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", auth, getCurrentUser);

export default router;
