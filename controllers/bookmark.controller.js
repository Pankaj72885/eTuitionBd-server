import Bookmark from "../models/Bookmark.model.js";
import Tuition from "../models/Tuition.model.js";
import User from "../models/User.model.js";

// Add bookmark
export const addBookmark = async (req, res) => {
  try {
    const { type, targetId } = req.body;

    if (!["tutor", "tuition"].includes(type)) {
      return res.status(400).json({ message: "Invalid bookmark type" });
    }

    // Check if target exists
    let target;
    if (type === "tutor") {
      target = await User.findById(targetId);
    } else {
      target = await Tuition.findById(targetId);
    }

    if (!target) {
      return res.status(404).json({ message: `${type} not found` });
    }

    // Create new bookmark
    const bookmark = new Bookmark({
      userId: req.user._id,
      type,
      targetId,
    });

    await bookmark.save();

    res.status(201).json({
      success: true,
      message: "Bookmark added successfully",
      data: bookmark,
    });
  } catch (error) {
    console.error("Add bookmark error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user bookmarks
export const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .populate({
        path: "targetId",
        model: function () {
          return this.type === "tutor" ? "User" : "Tuition";
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookmarks,
    });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove bookmark
export const removeBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    // Check if user owns the bookmark
    if (bookmark.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this bookmark" });
    }

    await Bookmark.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
