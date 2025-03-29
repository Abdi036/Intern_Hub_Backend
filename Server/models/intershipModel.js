const mongoose = require("mongoose");

const InternshipSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Internship needs a title"] },
  CompanyName: { type: String, required: [true, "CompanyName is required"] },
  department: {
    type: String,
    required: [true, "Internship needs a description"],
  },
  duration: { type: String, required: [true, "Internship needs a duration"] },
  description: { type: String, required: [, "Internship needs a description"] },
  requiredSkills: {
    type: [String],
    required: [true, "Internship needs a skillsets"],
  },
  location: { type: String, required: [true, "Internship needs a location"] },
  remote: { type: Boolean, default: false },
  paid: { type: Boolean, default: false },
  numPositions: {
    type: Number,
    required: [true, "Specify Number of Interns you want"],
  },
  applicationDeadline: {
    type: Date,
    required: [true, "Internship needs a deadline"],
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Internship = mongoose.model("Internship", InternshipSchema);

module.exports = Internship;
