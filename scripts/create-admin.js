// create-admin.js
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

import User from "../models/User.model.js";

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin1@etuitionbd.com" });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("📧 Email:", existingAdmin.email);
      console.log("👤 Name:", existingAdmin.name);
      console.log("🆔 ID:", existingAdmin._id);
      console.log(
        "\n💡 To create a new admin with different email, modify the script."
      );

      // Close connection
      await mongoose.connection.close();
      return;
    }

    // Admin user data
    const adminData = {
      firebaseUid: `admin-${Date.now()}`,
      name: "System Administrator",
      email: "admin1@etuitionbd.com",
      phone: "01712345678",
      role: "admin",
      city: "Dhaka",
      photoUrl: "https://picsum.photos/seed/admin/200/200.jpg",
      isVerified: true,
    };

    // Create admin user
    const admin = new User(adminData);
    await admin.save();

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", adminData.email);
    console.log("� Name:", adminData.name);
    console.log("📱 Phone:", adminData.phone);
    console.log("🆔 ID:", admin._id);
    console.log(
      "\n💡 You can now login with this email using Firebase Authentication"
    );
    console.log("💡 Make sure to create this user in Firebase Console first!");

    // Close connection
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    await mongoose.connection.close();
  }
};

// Run the function
createAdmin();
