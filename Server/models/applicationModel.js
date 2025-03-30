const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Internship",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  resume: {
    type: String,
    required: true,
  },
  coverLetter: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Application = mongoose.model("Application", ApplicationSchema);

module.exports = Application;
