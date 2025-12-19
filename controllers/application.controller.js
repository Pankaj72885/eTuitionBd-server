import Application from "../models/Application.model.js";
import Tuition from "../models/Tuition.model.js";
import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";

// Apply to a tuition (tutor only)
const applyToTuition = async (req, res) => {
  try {
    const { tuitionId, qualifications, experience, expectedSalary } = req.body;

    // Check if tuition exists and is open for applications
    const tuition = await Tuition.findById(tuitionId);

    if (!tuition) {
      return res.status(404).json({ message: "Tuition not found" });
    }

    if (!["Approved", "Open"].includes(tuition.status)) {
      return res
        .status(400)
        .json({ message: "This tuition is not accepting applications" });
    }

    // Check if tutor has already applied
    const existingApplication = await Application.findOne({
      tuitionId,
      tutorId: req.user._id,
    });

    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "You have already applied to this tuition" });
    }

    // Create new application
    const application = new Application({
      tuitionId,
      tutorId: req.user._id,
      qualifications,
      experience,
      expectedSalary,
    });

    await application.save();

    // Update tuition application count
    tuition.applicationCount += 1;
    await tuition.save();

    // Create notification for student
    await Notification.create({
      userId: tuition.studentId,
      type: "application_received",
      message: `New application received for ${tuition.subject} tuition`,
      link: `/dashboard/student/applied-tutors`,
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    console.error("Apply to tuition error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get applications for student's tuitions
const getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      "tuitionId.studentId": req.user._id,
    })
      .populate("tuitionId", "subject classLevel location budget")
      .populate(
        "tutorId",
        "name email photoUrl city experienceYears averageRating reviewCount"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Get student applications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get tutor's applications
const getTutorApplications = async (req, res) => {
  try {
    const applications = await Application.find({ tutorId: req.user._id })
      .populate("tuitionId", "subject classLevel location budget status")
      .populate(
        "tutorId",
        "name email photoUrl city experienceYears averageRating reviewCount"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Get tutor applications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update application status (accept/reject)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(req.params.id)
      .populate("tuitionId")
      .populate("tutorId");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if user owns the tuition
    if (
      application.tuitionId.studentId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this application" });
    }

    application.status = status;
    await application.save();

    // Update tuition status if approved
    if (status === "Approved") {
      const tuition = await Tuition.findById(application.tuitionId._id);
      tuition.status = "Ongoing";
      await tuition.save();

      // Reject other applications for this tuition
      await Application.updateMany(
        {
          tuitionId: application.tuitionId._id,
          _id: { $ne: application._id },
        },
        { status: "Rejected" }
      );
    }

    // Create notification for tutor
    await Notification.create({
      userId: application.tutorId._id,
      type:
        status === "Approved" ? "application_approved" : "application_rejected",
      message: `Your application for ${
        application.tuitionId.subject
      } has been ${status.toLowerCase()}`,
      link: `/dashboard/tutor/my-applications`,
    });

    res.status(200).json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully`,
      data: application,
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update application details (tutor only)
const updateApplication = async (req, res) => {
  try {
    const { qualifications, experience, expectedSalary } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if user owns the application
    if (application.tutorId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this application" });
    }

    // Can only update pending applications
    if (application.status !== "Pending") {
      return res
        .status(400)
        .json({
          message: "Cannot update application after it has been processed",
        });
    }

    // Update fields
    if (qualifications) application.qualifications = qualifications;
    if (experience) application.experience = experience;
    if (expectedSalary) application.expectedSalary = expectedSalary;

    await application.save();

    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: application,
    });
  } catch (error) {
    console.error("Update application error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete application (tutor only)
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if user owns the application
    if (application.tutorId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this application" });
    }

    // Can only delete pending applications
    if (application.status !== "Pending") {
      return res
        .status(400)
        .json({
          message: "Cannot delete application after it has been processed",
        });
    }

    await Application.findByIdAndDelete(req.params.id);

    // Update tuition application count
    const tuition = await Tuition.findById(application.tuitionId);
    tuition.applicationCount = Math.max(0, tuition.applicationCount - 1);
    await tuition.save();

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Delete application error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  applyToTuition,
  getStudentApplications,
  getTutorApplications,
  updateApplicationStatus,
  updateApplication,
  deleteApplication,
};
