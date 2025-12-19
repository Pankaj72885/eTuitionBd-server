import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Routes
import userRoutes from "./routes/user.routes.js";
app.use("/api/users", userRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("API is running on Bun!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
