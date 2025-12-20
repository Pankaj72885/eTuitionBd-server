import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import { initializeFirebase } from "./config/firebaseAdmin.js";
import { initializeStripe } from "./config/stripe.js";
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    // Initialize Firebase
    initializeFirebase();

    // Initialize Stripe
    initializeStripe();

    // Start server
    if (process.env.NODE_ENV !== "production") {
      const port = 5000;
      app.listen(port, () => {
        console.log(`Server running locally on port ${port}`);
      });
    }
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });
