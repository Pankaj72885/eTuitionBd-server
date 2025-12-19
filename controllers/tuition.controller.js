import Application from "../models/Application.model.js";
import Tuition from "../models/Tuition.model.js";

// Get all tuitions with filters and pagination
export const getTuitions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      q,
      class: classLevel,
      subject,
      location,
      sort = "dateDesc",
    } = req.query;

    // Build query
    const query = { status: { $in: ["Approved", "Open"] } }; // Only show approved/open tuitions publicly

    if (classLevel) {
      query.classLevel = classLevel;
    }

    if (subject) {
      query.subject = subject;
    }

    if (location) {
      query.location = location;
    }

    if (q) {
      query.$text = { $search: q };
    }

    // Build sort
    let sortOptions = {};
    switch (sort) {
      case "budgetAsc":
        sortOptions = { budget: 1 };
        break;
      case "budgetDesc":
        sortOptions = { budget: -1 };
        break;
      case "dateAsc":
        sortOptions = { createdAt: 1 };
        break;
      case "dateDesc":
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // Execute query with pagination
    const tuitions = await Tuition.find(query)
      .populate("studentId", "name city")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Tuition.countDocuments(query);

    res.status(200).json({
      success: true,
      data: tuitions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get tuitions error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get tuition by ID
export const getTuitionById = async (req, res) => {
  try {
    const tuition = await Tuition.findById(req.params.id).populate(
      "studentId",
      "name city"
    );

    if (!tuition) {
      return res.status(404).json({ message: "Tuition not found" });
    }

    // Get application count
    const applicationCount = await Application.countDocuments({
      tuitionId: tuition._id,
    });
    tuition.applicationCount = applicationCount;

    res.status(200).json({
      success: true,
      data: tuition,
    });
  } catch (error) {
    console.error("Get tuition by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create new tuition (student only)
export const createTuition = async (req, res) => {
  try {
    const {
      subject,
      classLevel,
      location,
      budget,
      schedule,
      mode,
      description,
    } = req.body;

    // Create new tuition
    const tuition = new Tuition({
      studentId: req.user._id,
      subject,
      classLevel,
      location,
      budget,
      schedule,
      mode,
      description,
      status: "Pending", // Pending admin approval
    });

    await tuition.save();

    res.status(201).json({
      success: true,
      message: "Tuition created successfully and pending approval",
      data: tuition,
    });
  } catch (error) {
    console.error("Create tuition error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update tuition (student owner only)
export const updateTuition = async (req, res) => {
  try {
    const {
      subject,
      classLevel,
      location,
      budget,
      schedule,
      mode,
      description,
    } = req.body;

    // Find tuition
    const tuition = await Tuition.findById(req.params.id);

    if (!tuition) {
      return res.status(404).json({ message: "Tuition not found" });
    }

    // Check if user owns the tuition
    if (tuition.studentId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this tuition" });
    }

    // Update fields
    if (subject) tuition.subject = subject;
    if (classLevel) tuition.classLevel = classLevel;
    if (location) tuition.location = location;
    if (budget) tuition.budget = budget;
    if (schedule) tuition.schedule = schedule;
    if (mode) tuition.mode = mode;
    if (description !== undefined) tuition.description = description;

    await tuition.save();

    res.status(200).json({
      success: true,
      message: "Tuition updated successfully",
      data: tuition,
    });
  } catch (error) {
    console.error("Update tuition error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete tuition (student/admin only)
export const deleteTuition = async (req, res) => {
  try {
    // Find tuition
    const tuition = await Tuition.findById(req.params.id);

    if (!tuition) {
      return res.status(404).json({ message: "Tuition not found" });
    }

    // Check if user owns the tuition or is admin
    if (
      tuition.studentId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this tuition" });
    }

    await Tuition.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Tuition deleted successfully",
    });
  } catch (error) {
    console.error("Delete tuition error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get student's tuitions
export const getStudentTuitions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    const query = { studentId: req.user._id };

    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const tuitions = await Tuition.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Tuition.countDocuments(query);

    res.status(200).json({
      success: true,
      data: tuitions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get student tuitions error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Approve tuition (admin only)
export const approveTuition = async (req, res) => {
  try {
    const tuition = await Tuition.findById(req.params.id);

    if (!tuition) {
      return res.status(404).json({ message: "Tuition not found" });
    }

    tuition.status = "Approved";
    await tuition.save();

    res.status(200).json({
      success: true,
      message: "Tuition approved successfully",
      data: tuition,
    });
  } catch (error) {
    console.error("Approve tuition error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reject tuition (admin only)
export const rejectTuition = async (req, res) => {
  try {
    const tuition = await Tuition.findById(req.params.id);

    if (!tuition) {
      return res.status(404).json({ message: "Tuition not found" });
    }

    tuition.status = "Rejected";
    await tuition.save();

    res.status(200).json({
      success: true,
      message: "Tuition rejected successfully",
      data: tuition,
    });
  } catch (error) {
    console.error("Reject tuition error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all tuitions for admin
export const getAllTuitions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // Execute query with pagination
    const tuitions = await Tuition.find(query)
      .populate("studentId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Tuition.countDocuments(query);

    res.status(200).json({
      success: true,
      data: tuitions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all tuitions error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
