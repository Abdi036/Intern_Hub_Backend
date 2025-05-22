const mongoose = require("mongoose");

const InternshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Internship needs a title"],
    },
    CompanyName: {
      type: String,
      required: [true, "CompanyName is required"],
    },
    department: {
      type: String,
      required: [true, "Internship needs a department"],
    },
    startDate: {
      type: Date,
      required: [true, "Internship needs a start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Internship needs an end date"],
    },
    description: {
      type: String,
      required: [true, "Internship needs a description"],
    },
    requiredSkills: {
      type: [String],
    },
    location: {
      type: String,
      required: [true, "Internship needs a location"],
    },
    remote: {
      type: Boolean,
      default: false,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    numPositions: {
      type: Number,
      required: [true, "Specify the number of interns you want"],
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
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

InternshipSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "internship",
  localField: "_id",
});

const Internship = mongoose.model("Internship", InternshipSchema);

module.exports = Internship;
