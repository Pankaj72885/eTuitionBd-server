
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tuitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tuition",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxlength: [500, "Comment cannot be more than 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Create index for tutorId
reviewSchema.index({ tutorId: 1 });

// Create index for studentId
reviewSchema.index({ studentId: 1 });

// Create index for tuitionId
reviewSchema.index({ tuitionId: 1 });

// Create unique compound index to prevent duplicate reviews
reviewSchema.index(
  { tutorId: 1, studentId: 1, tuitionId: 1 },
  { unique: true }
);

export default mongoose.model("Review", reviewSchema);
