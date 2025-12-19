import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    tuitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tuition",
      required: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    qualifications: {
      type: String,
      required: [true, "Qualifications are required"],
      trim: true,
    },
    experience: {
      type: String,
      required: [true, "Experience is required"],
      trim: true,
    },
    expectedSalary: {
      type: Number,
      required: [true, "Expected salary is required"],
      min: [500, "Expected salary must be at least 500 BDT"],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Create index for tuitionId
applicationSchema.index({ tuitionId: 1 });

// Create index for tutorId
applicationSchema.index({ tutorId: 1 });

// Create index for status
applicationSchema.index({ status: 1 });

// Create unique compound index to prevent duplicate applications
applicationSchema.index({ tuitionId: 1, tutorId: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
