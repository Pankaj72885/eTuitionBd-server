const jwt = await import("jsonwebtoken");
const { getFirebaseAdmin } = await import("../config/firebaseAdmin");
const User = await import("../models/User.model");

const auth = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid token. User not found." });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    }

    res.status(500).json({ message: "Server error in authentication." });
  }
};

export default auth;
