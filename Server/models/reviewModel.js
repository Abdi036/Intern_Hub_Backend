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

// Ensure one review per user per internship
reviewSchema.index({ user: 1, internship: 1 }, { unique: true });

// Calculate and update ratingsAverage and ratingsQuantity on Internship
reviewSchema.statics.calcAverageRatings = async function (internshipId) {
  const objId =
    typeof internshipId === "string"
      ? new mongoose.Types.ObjectId(internshipId)
      : internshipId;

  const aggregates = await this.aggregate([
    { $match: { internship: objId } },
    {
      $group: {
        _id: "$internship",
        nRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  const Internship = mongoose.model("Internship");
  if (aggregates.length > 0) {
    await Internship.findByIdAndUpdate(internshipId, {
      ratingsQuantity: aggregates[0].nRatings,
      ratingsAverage:
        Math.round((aggregates[0].avgRating + Number.EPSILON) * 10) / 10,
    });
  } else {
    await Internship.findByIdAndUpdate(internshipId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

reviewSchema.post("save", function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.internship);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  // doc is the document after operation
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.internship);
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
