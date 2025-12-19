import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["tutor", "tuition"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "type",
    },
  },
  {
    timestamps: true,
  }
);

// Create index for userId
bookmarkSchema.index({ userId: 1 });

// Create index for type
bookmarkSchema.index({ type: 1 });

// Create index for targetId
bookmarkSchema.index({ targetId: 1 });

// Create unique compound index to prevent duplicate bookmarks
bookmarkSchema.index({ userId: 1, type: 1, targetId: 1 }, { unique: true });

export default mongoose.model("Bookmark", bookmarkSchema);
