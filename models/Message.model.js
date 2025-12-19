import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    tuitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tuition",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [1000, "Message cannot be more than 1000 characters"],
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

// Create index for senderId
messageSchema.index({ senderId: 1 });

// Create index for receiverId
messageSchema.index({ receiverId: 1 });

// Create index for createdAt
messageSchema.index({ createdAt: -1 });

export default mongoose.model("Message", messageSchema);
