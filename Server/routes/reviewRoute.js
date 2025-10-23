const express = require("express");
const {
  getAllReviews,
  upsertMyReview,
  updateMyReview,
  deleteMyReview,
  getInternshipReviews,
} = require("../controllers/reviewController.js");
const { protect, restrictTo } = require("../middleware/authMiddleware.js");

const router = express.Router();

// Public/student: get all reviews for an internship
router.get(
  "/internships/:internshipId/reviews",
  protect,
  restrictTo("student"),
  getInternshipReviews
);

// Student: create or update own review for an internship
router.put(
  "/internships/:internshipId/my",
  protect,
  restrictTo("student"),
  upsertMyReview
);

// Student: update fields of own review
router.patch(
  "/internships/:internshipId/my",
  protect,
  restrictTo("student"),
  updateMyReview
);

// Student: delete own review
router.delete(
  "/internships/:internshipId/my",
  protect,
  restrictTo("student"),
  deleteMyReview
);

module.exports = router;
