import { getStripe } from "../config/stripe.js";
import Application from "../models/Application.model.js";
import Notification from "../models/Notification.model.js";
import Payment from "../models/Payment.model.js";
import Tuition from "../models/Tuition.model.js";

// Create payment intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { applicationId } = req.body;

    // Get application details
    const application = await Application.findById(applicationId)
      .populate("tuitionId")
      .populate("tutorId");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if application is approved
    if (application.status !== "Approved") {
      return res.status(400).json({ message: "Application is not approved" });
    }

    // Check if user owns the tuition
    if (
      application.tuitionId.studentId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to pay for this application" });
    }

    // Create payment intent with Stripe
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: application.expectedSalary * 100, // Convert to cents
      currency: "bdt",
      metadata: {
        applicationId: application._id.toString(),
        tuitionId: application.tuitionId._id.toString(),
        tutorId: application.tutorId._id.toString(),
        studentId: req.user._id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Stripe webhook handler
export const stripeWebhook = async (req, res) => {
  try {
    const stripe = getStripe();
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;

        // Create payment record
        const payment = new Payment({
          studentId: paymentIntent.metadata.studentId,
          tutorId: paymentIntent.metadata.tutorId,
          tuitionId: paymentIntent.metadata.tuitionId,
          applicationId: paymentIntent.metadata.applicationId,
          amount: paymentIntent.amount / 100, // Convert from cents
          stripePaymentIntentId: paymentIntent.id,
          status: "Succeeded",
        });

        await payment.save();

        // Update application status
        await Application.findByIdAndUpdate(
          paymentIntent.metadata.applicationId,
          {
            status: "Approved",
          }
        );

        // Update tuition status
        await Tuition.findByIdAndUpdate(paymentIntent.metadata.tuitionId, {
          status: "Ongoing",
        });

        // Create notifications
        await Notification.create([
          {
            userId: paymentIntent.metadata.studentId,
            type: "payment_success",
            message: "Payment successful. Your tuition has started.",
            link: "/dashboard/student/my-tuitions",
          },
          {
            userId: paymentIntent.metadata.tutorId,
            type: "payment_success",
            message: "Payment received. Your tuition has started.",
            link: "/dashboard/tutor/ongoing-tuitions",
          },
        ]);

        console.log("Payment succeeded:", paymentIntent.id);
        break;

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object;

        // Create payment record
        const failedPayment = new Payment({
          studentId: failedPaymentIntent.metadata.studentId,
          tutorId: failedPaymentIntent.metadata.tutorId,
          tuitionId: failedPaymentIntent.metadata.tuitionId,
          applicationId: failedPaymentIntent.metadata.applicationId,
          amount: failedPaymentIntent.amount / 100, // Convert from cents
          stripePaymentIntentId: failedPaymentIntent.id,
          status: "Failed",
        });

        await failedPayment.save();

        console.log("Payment failed:", failedPaymentIntent.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get student's payment history
export const getStudentPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, from, to } = req.query;

    // Build query
    const query = { studentId: req.user._id, status: "Succeeded" };

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    // Execute query with pagination
    const payments = await Payment.find(query)
      .populate("tutorId", "name email photoUrl")
      .populate("tuitionId", "subject classLevel")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get student payments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get tutor's payment history
export const getTutorPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, from, to } = req.query;

    // Build query
    const query = { tutorId: req.user._id, status: "Succeeded" };

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    // Execute query with pagination
    const payments = await Payment.find(query)
      .populate("studentId", "name email photoUrl")
      .populate("tuitionId", "subject classLevel")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get tutor payments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all payments (admin only)
export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, from, to } = req.query;

    // Build query
    const query = { status: "Succeeded" };

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    // Execute query with pagination
    const payments = await Payment.find(query)
      .populate("studentId", "name email")
      .populate("tutorId", "name email")
      .populate("tuitionId", "subject classLevel")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all payments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
