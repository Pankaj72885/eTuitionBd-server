const jwt = await import("jsonwebtoken");
const { getFirebaseAdmin } = await import("../config/firebaseAdmin");
const User = await import("../models/User.model");
const { generateJWT } = await import("../utils/generateJWT");

// Register user
const register = async (req, res) => {
  try {
    const { idToken, name, email, phone, role, city } = req.body;

    if (!idToken || !name || !email || !phone || !role || !city) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Verify Firebase ID token
    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({
      firebaseUid: decodedToken.uid,
      name,
      email,
      phone,
      role,
      city,
    });

    await user.save();

    // Generate JWT token
    const token = generateJWT(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "ID token is required" });
    }

    // Verify Firebase ID token
    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Find user in database
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate JWT token
    const token = generateJWT(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        isVerified: user.isVerified,
        photoUrl: user.photoUrl,
        averageRating: user.averageRating,
        reviewCount: user.reviewCount,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -firebaseUid"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default {
  register,
  login,
  getCurrentUser,
};
