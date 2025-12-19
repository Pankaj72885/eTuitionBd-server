import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "application_received",
        "application_approved",
        "application_rejected",
        "payment_success",
        "tuition_approved",
        "tuition_rejected",
        "message_received",
        "review_received",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for userId
notificationSchema.index({ userId: 1 });

// Create index for read
notificationSchema.index({ read: 1 });

// Create index for createdAt
notificationSchema.index({ createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
