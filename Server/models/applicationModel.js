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
  coverLetter: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return v.endsWith(".pdf");
      },
      message: "Cover letter must be a PDF file!",
    },
  },
  portfolio: {
    type: String,
    validate: {
      validator: function (v) {
        return /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})([\/\w .-]*)*\/?$/.test(
          v
        );
      },
      message: "Invalid URL format!",
    },
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
});

const Application = mongoose.model("Application", ApplicationSchema);

module.exports = Application;
