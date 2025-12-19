import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    role: {
      type: String,
      enum: ["student", "tutor", "admin"],
      default: "student",
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^01[3-9]\d{8}$/, "Please add a valid Bangladeshi phone number"],
    },
    photoUrl: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    // Tutor-specific fields
    qualifications: {
      type: String,
      trim: true,
    },
    experienceYears: {
      type: Number,
      min: 0,
      max: 50,
    },
    subjects: {
      type: [String],
      default: [],
    },
    classLevels: {
      type: [String],
      default: [],
    },
    // Platform meta
    isVerified: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


// Create index for role
userSchema.index({ role: 1 });

// Create index for city
userSchema.index({ city: 1 });

// Create index for subjects (for tutors)
userSchema.index({ subjects: 1 });

export default mongoose.model("User", userSchema);
