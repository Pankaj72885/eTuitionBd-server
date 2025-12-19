import Application from "../models/Application.model.js";
import Message from "../models/Message.model.js";

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { tuitionId, receiverId, content } = req.body;

    // Check if there's an approved application between sender and receiver for this tuition
    const application = await Application.findOne({
      tuitionId,
      $or: [
        { tutorId: req.user._id, "tuitionId.studentId": receiverId },
        { tutorId: receiverId, "tuitionId.studentId": req.user._id },
      ],
      status: "Approved",
    });

    if (!application) {
      return res.status(400).json({
        message: "You can only message users for approved applications",
      });
    }

    // Generate conversation ID
    const conversationId = [req.user._id, receiverId, tuitionId]
      .sort()
      .join("-");

    // Create new message
    const message = new Message({
      conversationId,
      tuitionId,
      senderId: req.user._id,
      receiverId,
      content,
    });

    await message.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const conversationId = req.params.conversationId;

    // Check if user is part of this conversation
    const [userId1, userId2] = conversationId.split("-");
    if (
      userId1 !== req.user._id.toString() &&
      userId2 !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this conversation" });
    }

    // Execute query with pagination
    const messages = await Message.find({ conversationId })
      .populate("senderId", "name photoUrl")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Message.countDocuments({ conversationId });

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
