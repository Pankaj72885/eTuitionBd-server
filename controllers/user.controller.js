import User from "../models/User.model";

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    // Build query
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Execute query with pagination
    const users = await User.find(query)
      .select("-password -firebaseUid")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -firebaseUid"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      city,
      photoUrl,
      qualifications,
      experienceYears,
      subjects,
      classLevels,
      bio,
      isAvailable,
    } = req.body;

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (city) user.city = city;
    if (photoUrl !== undefined) user.photoUrl = photoUrl;

    // Tutor-specific fields
    if (user.role === "tutor") {
      if (qualifications) user.qualifications = qualifications;
      if (experienceYears !== undefined) user.experienceYears = experienceYears;
      if (subjects) user.subjects = subjects;
      if (classLevels) user.classLevels = classLevels;
      if (isAvailable !== undefined) user.isAvailable = isAvailable;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        photoUrl: user.photoUrl,
        qualifications: user.qualifications,
        experienceYears: user.experienceYears,
        subjects: user.subjects,
        classLevels: user.classLevels,
        isVerified: user.isVerified,
        averageRating: user.averageRating,
        reviewCount: user.reviewCount,
        isAvailable: user.isAvailable,
      },
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Change user role (admin only)
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !["student", "tutor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Valid role is required" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role changed successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Change user role error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Toggle user verification status (admin only)
const toggleUserVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User verification ${
        user.isVerified ? "enabled" : "disabled"
      } successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Toggle user verification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  getAllUsers,
  getUserById,
  updateUserProfile,
  changeUserRole,
  deleteUser,
  toggleUserVerification,
};
