import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tuitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tuition",
      required: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Succeeded", "Failed", "Pending"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer", "mobile_banking"],
      default: "card",
    },
  },
  {
    timestamps: true,
  }
);

// Create index for studentId
paymentSchema.index({ studentId: 1 });

// Create index for tutorId
paymentSchema.index({ tutorId: 1 });

// Create index for tuitionId
paymentSchema.index({ tuitionId: 1 });

// Create index for status
paymentSchema.index({ status: 1 });

// Create index for createdAt
paymentSchema.index({ createdAt: -1 });

export default mongoose.model("Payment", paymentSchema);
