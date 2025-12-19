import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
    tuitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tuition",
      required: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Create index for tuitionId
calendarEventSchema.index({ tuitionId: 1 });

// Create index for tutorId
calendarEventSchema.index({ tutorId: 1 });

// Create index for studentId
calendarEventSchema.index({ studentId: 1 });

// Create index for date
calendarEventSchema.index({ date: 1 });

export default mongoose.model("CalendarEvent", calendarEventSchema);
