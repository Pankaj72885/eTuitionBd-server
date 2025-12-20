import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import { initializeFirebase } from "./config/firebaseAdmin.js";
import { initializeStripe } from "./config/stripe.js";
dotenv.config();

const port = process.env.PORT || 5000;
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
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });
