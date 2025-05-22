const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  internship: {
    type: mongoose.Schema.ObjectId,
    ref: "Internship",
  },
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  }).populate({
    path: "internship",
    select: "title CompanyName",
  });
  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
