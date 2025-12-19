import Application from "../models/Application.model.js";
import Notification from "../models/Notification.model.js";
import Review from "../models/Review.model.js";
import User from "../models/User.model.js";

// Create a review
export const createReview = async (req, res) => {
  try {
    const { tutorId, tuitionId, rating, comment } = req.body;

    // Check if application exists and is approved
    const application = await Application.findOne({
      tuitionId,
      tutorId,
      studentId: req.user._id,
      status: "Approved",
    });

    if (!application) {
      return res.status(400).json({
        message: "You can only review tutors for approved applications",
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      tutorId,
      studentId: req.user._id,
      tuitionId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this tutor for this tuition",
      });
    }

    // Create new review
    const review = new Review({
      tutorId,
      studentId: req.user._id,
      tuitionId,
      rating,
      comment,
    });

    await review.save();

    // Update tutor's average rating and review count
    const tutorReviews = await Review.find({ tutorId });
    const totalRating = tutorReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const averageRating = totalRating / tutorReviews.length;

    await User.findByIdAndUpdate(tutorId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: tutorReviews.length,
    });

    // Create notification for tutor
    await Notification.create({
      userId: tutorId,
      type: "review_received",
      message: `You received a ${rating}-star review`,
      link: `/dashboard/tutor/profile`,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get reviews for a tutor
export const getTutorReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Execute query with pagination
    const reviews = await Review.find({ tutorId: req.params.tutorId })
      .populate("studentId", "name photoUrl")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Review.countDocuments({ tutorId: req.params.tutorId });

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get tutor reviews error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
