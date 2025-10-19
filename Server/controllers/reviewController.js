const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Internship = require("../models/intershipModel");
const User = require("../models/userModel");
const Review = require("../models/reviewModel");

// Create or update the current user's review for an internship
exports.upsertMyReview = catchAsync(async (req, res, next) => {
  const { internshipId } = req.params;
  const { review, rating } = req.body;

  if (!rating && !review) {
    return next(new AppError("Provide at least rating or review text", 400));
  }

  const internship = await Internship.findById(internshipId);
  if (!internship) return next(new AppError("Internship not found", 404));

  const updated = await Review.findOneAndUpdate(
    { internship: internshipId, user: req.user._id },
    {
      $set: {
        internship: internshipId,
        user: req.user._id,
        ...(review !== undefined ? { review } : {}),
        ...(rating !== undefined ? { rating } : {}),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { new: true, upsert: true, runValidators: true }
  );

  await Review.calcAverageRatings(internshipId);

  const updatedInternship = await Internship.findById(internshipId);

  res.status(200).json({
    status: "success",
    data: {
      review: updated,
      internship: updatedInternship,
    },
  });
});

// Update only (fails if no existing review by user)
exports.updateMyReview = catchAsync(async (req, res, next) => {
  const { internshipId } = req.params;
  const { review, rating } = req.body;

  const existing = await Review.findOne({
    internship: internshipId,
    user: req.user._id,
  });
  if (!existing)
    return next(new AppError("You haven't reviewed this internship yet", 404));

  if (review !== undefined) existing.review = review;
  if (rating !== undefined) existing.rating = rating;
  await existing.save();

  await Review.calcAverageRatings(internshipId);

  const updatedInternship = await Internship.findById(internshipId);

  res.status(200).json({
    status: "success",
    data: {
      review: existing,
      internship: updatedInternship,
    },
  });
});

// Delete the current user's review for an internship
exports.deleteMyReview = catchAsync(async (req, res, next) => {
  const { internshipId } = req.params;
  const deleted = await Review.findOneAndDelete({
    internship: internshipId,
    user: req.user._id,
  });
  if (!deleted) return next(new AppError("Review not found", 404));

  await Review.calcAverageRatings(internshipId);

  const updatedInternship = await Internship.findById(internshipId);

  res.status(200).json({
    status: "success",
    message: "Review deleted successfully",
    data: {
      internship: updatedInternship,
    },
  });
});

// Get all reviews for an internship
exports.getInternshipReviews = catchAsync(async (req, res, next) => {
  const { internshipId } = req.params;
  await Review.calcAverageRatings(internshipId);
  const internship = await Internship.findById(internshipId);
  if (!internship) return next(new AppError("Internship not found", 404));
  const reviews = await Review.find({ internship: internshipId });
  res
    .status(200)
    .json({ status: "success", results: reviews.length, data: { reviews } });
});
