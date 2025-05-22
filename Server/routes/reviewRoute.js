const express = require("express");
const {
  createReview,
  getAllReviews,
} = require("../controllers/reviewController.js");
const { protect, restrictTo } = require("../middleware/authMiddleware.js");

const router = express.Router();
router
  .route("/")
  .get(protect, getAllReviews)
  .post(protect, restrictTo("student"), createReview);

module.exports = router;
