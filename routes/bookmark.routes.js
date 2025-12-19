import express from "express";
import {
  addBookmark,
  getBookmarks,
  removeBookmark,
} from "../controllers/bookmark.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.post("/", addBookmark);
router.get("/", getBookmarks);
router.delete("/:id", removeBookmark);

export default router;
