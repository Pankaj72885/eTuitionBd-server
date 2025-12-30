import dotenv from "dotenv";
import mongoose from "mongoose";
import Application from "../models/Application.model.js";
import Payment from "../models/Payment.model.js";
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
    await Payment.deleteMany({});

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
      photoUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
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
        photoUrl: `https://ui-avatars.com/api/?name=Student+${i}&background=random`,
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
        photoUrl: `https://ui-avatars.com/api/?name=Tutor+${i}&background=random`,
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

    // Create sample applications and payments
    const applications = [];
    const payments = [];

    // Helper to get a random date within the last n months
    const getRandomDate = (monthsBack) => {
      const date = new Date();
      date.setMonth(date.getMonth() - Math.floor(Math.random() * monthsBack));
      date.setDate(Math.floor(Math.random() * 28) + 1);
      return date;
    };

    for (let i = 0; i < 30; i++) {
      const tuition = tuitions[i % tuitions.length];
      const tutor = tutors[i % tutors.length];

      const application = new Application({
        tuitionId: tuition._id,
        tutorId: tutor._id,
        qualifications: "Bachelor's in Education",
        experience: `${tutor.experienceYears} years of teaching experience`,
        expectedSalary: 4000 + i * 300,
        status: i % 4 === 0 ? "Approved" : ["Pending", "Rejected"][i % 2],
      });

      const savedApp = await application.save();
      applications.push(savedApp);

      // Create payment for approved/some applications
      if (application.status === "Approved" || i % 5 === 0) {
        const paymentDate = getRandomDate(6); // Last 6 months
        const amount = 500 + Math.floor(Math.random() * 2000); // Fee/Payment

        const payment = new Payment({
          studentId: tuition.studentId,
          tutorId: tutor._id,
          tuitionId: tuition._id,
          applicationId: savedApp._id,
          amount: amount,
          stripePaymentIntentId: `pi_mock_${Date.now()}_${i}`,
          status: "Succeeded",
          paymentMethod: ["card", "mobile_banking"][i % 2],
          createdAt: paymentDate,
          updatedAt: paymentDate,
        });

        payments.push(await payment.save());
      }
    }
    console.log(`Created ${applications.length} sample applications`);
    console.log(`Created ${payments.length} sample payments with history`);

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
