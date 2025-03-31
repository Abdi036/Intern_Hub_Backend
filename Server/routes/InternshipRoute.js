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
  ApplyInternship,
  GetAllApplicants,
  GetApplicant,
  GetMyApplications,
} = require("../controllers/internController");

// COMPANY ROUTES
router.post("/postInternship", protect, restrictTo("company"), PostInternship);

router.get(
  "/allMypostedInterships",
  protect,
  restrictTo("company"),
  GetAllMycompanyInternships
);

// STUDENT ROUTES
router.get("/", protect, restrictTo("student"), GetInternships);

// Get all applications for the logged-in student - This needs to be before parameterized routes
router.get("/my-applications", protect, restrictTo("student"), GetMyApplications);

// apply for internship
router.post(
  "/:internshipId/apply",
  protect,
  restrictTo("student"),
  ApplyInternship
);

router.get(
  "/:internshipId/applicants",
  protect,
  restrictTo("company"),
  GetAllApplicants
);

router.get(
  "/:internshipId/applicants/:applicantId",
  protect,
  restrictTo("company"),
  GetApplicant
);

router
  .route("/:id")
  .get(protect, GetPostedInternship)
  .patch(protect, restrictTo("company"), EditMyIntership)
  .delete(protect, restrictTo("company"), DeleteInternship);

module.exports = router;
