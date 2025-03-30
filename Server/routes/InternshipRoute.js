const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

const {
  PostInternship,
  GetAllMycompanyInternships,
  GetPostedInternship,
  EditMyIntership,
  DeleteInternship,
  GetInternships,
} = require("../controllers/internController");

// COMPANY ROUTES
router.post("/postInternship", protect, restrictTo("company"), PostInternship);

router.get(
  "/allMypostedInterships",
  protect,
  restrictTo("company"),
  GetAllMycompanyInternships
);

router
  .route("/:id")
  .get(protect, GetPostedInternship)
  .patch(protect, restrictTo("company"), EditMyIntership)
  .delete(protect, restrictTo("company"), DeleteInternship);

// STUDENT ROUTES
router.get("/", protect, restrictTo("student"), GetInternships);
// apply for internship

module.exports = router;
