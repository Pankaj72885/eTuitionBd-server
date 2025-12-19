import mongoose from "mongoose";

const tuitionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    classLevel: {
      type: String,
      required: [true, "Class level is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: [500, "Budget must be at least 500 BDT"],
    },
    schedule: {
      type: String,
      required: [true, "Schedule is required"],
      trim: true,
    },
    mode: {
      type: String,
      enum: ["online", "offline", "hybrid"],
      required: [true, "Mode is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Open",
        "Ongoing",
        "Completed",
        "Closed",
      ],
      default: "Pending",
    },
    applicationCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for studentId
tuitionSchema.index({ studentId: 1 });

// Create index for status
tuitionSchema.index({ status: 1 });

// Create index for subject
tuitionSchema.index({ subject: 1 });

// Create index for location
tuitionSchema.index({ location: 1 });

// Create index for classLevel
tuitionSchema.index({ classLevel: 1 });

// Create compound index for search
tuitionSchema.index({ subject: "text", location: "text", description: "text" });

export default mongoose.model("Tuition", tuitionSchema);
