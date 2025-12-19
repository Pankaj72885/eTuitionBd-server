import dotenv from "dotenv";
import mongoose from "mongoose";
import Application from "../models/Application.model.js";
import Tuition from "../models/Tuition.model.js";
import User from "../models/User.model.js";

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding");

    // Clear existing data
    await User.deleteMany({});
    await Tuition.deleteMany({});
    await Application.deleteMany({});

    console.log("Cleared existing data");

    // Create admin user
    const adminUser = new User({
      firebaseUid: "admin-uid-123",
      name: "Admin User",
      email: "admin@etuitionbd.com",
      phone: "01712345678",
      role: "admin",
      city: "Dhaka",
      isVerified: true,
    });

    await adminUser.save();
    console.log("Created admin user");

    // Create sample students
    const students = [];
    for (let i = 1; i <= 5; i++) {
      const student = new User({
        firebaseUid: `student-uid-${i}`,
        name: `Student ${i}`,
        email: `student${i}@example.com`,
        phone: `0171234567${i}`,
        role: "student",
        city: ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Sylhet"][i - 1],
        isVerified: true,
      });

      students.push(await student.save());
    }
    console.log("Created sample students");

    // Create sample tutors
    const tutors = [];
    for (let i = 1; i <= 10; i++) {
      const tutor = new User({
        firebaseUid: `tutor-uid-${i}`,
        name: `Tutor ${i}`,
        email: `tutor${i}@example.com`,
        phone: `0181234567${i % 10}`,
        role: "tutor",
        city: ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Sylhet"][i % 5],
        qualifications: `Bachelor's in Education`,
        experienceYears: i + 2,
        subjects: ["Math", "English", "Physics", "Chemistry", "Biology"][i % 5],
        classLevels: ["Class 1-5", "Class 6-8", "Class 9-10", "SSC", "HSC"][
          i % 5
        ],
        isVerified: true,
        averageRating: 4 + Math.random(),
        reviewCount: Math.floor(Math.random() * 50) + 1,
      });

      tutors.push(await tutor.save());
    }
    console.log("Created sample tutors");

    // Create sample tuitions
    const tuitions = [];
    for (let i = 1; i <= 15; i++) {
      const tuition = new Tuition({
        studentId: students[i % students.length]._id,
        subject: ["Math", "English", "Physics", "Chemistry", "Biology"][i % 5],
        classLevel: ["Class 1-5", "Class 6-8", "Class 9-10", "SSC", "HSC"][
          i % 5
        ],
        location: ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Sylhet"][
          i % 5
        ],
        budget: 3000 + i * 500,
        schedule: "3 days/week",
        mode: ["online", "offline", "hybrid"][i % 3],
        description: `Looking for an experienced teacher for ${
          ["Math", "English", "Physics", "Chemistry", "Biology"][i % 5]
        }.`,
        status: ["Approved", "Open", "Ongoing"][i % 3],
        applicationCount: Math.floor(Math.random() * 5),
      });

      tuitions.push(await tuition.save());
    }
    console.log("Created sample tuitions");

    // Create sample applications
    for (let i = 0; i < 20; i++) {
      const application = new Application({
        tuitionId: tuitions[i % tuitions.length]._id,
        tutorId: tutors[i % tutors.length]._id,
        qualifications: "Bachelor's in Education",
        experience: `${
          tutors[i % tutors.length].experienceYears
        } years of teaching experience`,
        expectedSalary: 4000 + i * 300,
        status: ["Pending", "Approved", "Rejected"][i % 3],
      });

      await application.save();
    }
    console.log("Created sample applications");

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
