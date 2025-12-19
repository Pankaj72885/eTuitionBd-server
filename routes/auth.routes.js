const express = await import("express");
const { body } = await import("express-validator");
const { auth } = await import("../middleware/auth");
const {
  register,
  login,
  getCurrentUser,
} = await import("../controllers/auth.controller");

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
