import express from "express";
import { getMessages, sendMessage } from "../controllers/message.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.post("/", sendMessage);
router.get("/:conversationId", getMessages);

export default router;
