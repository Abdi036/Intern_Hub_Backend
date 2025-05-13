const express = require("express");
const {
  protect,
  restrictTo,
  isApproved,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/pdfUploadMiddleware");
const {
  PostInternship,
  GetAllMycompanyInternships,
  GetPostedInternship,
  EditMyIntership,
  DeleteInternship,
  GetInternships,
  GetInternshipById,
  ApplyInternship,
  GetMyApplications,
  GetApplication,
  DeleteApplication,
  GetAllApplicants,
  GetApplicant,
  UpdateApplicationStatus,
  ApproveMyCompanyAccount,
} = require("../controllers/internController");

const router = express.Router();

// Protected Routes
router.use(protect);

// Public Routes
router.get("/", restrictTo("student", "admin"), GetInternships);

// Company Routes
router.post(
  "/postInternship",
  restrictTo("company"),
  isApproved,
  PostInternship
);

router.get(
  "/allMypostedInterships",
  restrictTo("company"),
  GetAllMycompanyInternships
);

router.patch(
  "/update-application-status",
  restrictTo("company"),
  UpdateApplicationStatus
);

// Student Routes
router.get("/my-applications", restrictTo("student"), GetMyApplications);
router.get("/:id", restrictTo("student", "admin"), GetInternshipById);

router.post(
  "/:internshipId/apply",
  restrictTo("student"),
  upload.single("file"),
  ApplyInternship
);
router.get("/:internshipId/application", restrictTo("student"), GetApplication);
router.delete(
  "/:internshipId/delete-application",
  restrictTo("student"),
  DeleteApplication
);

// Company Routes with ID
router.get("/posted/:id", restrictTo("company"), GetPostedInternship);
router.patch("/:id", restrictTo("company"), EditMyIntership);
router.delete("/:id", restrictTo("company"), DeleteInternship);
router.get(
  "/:internshipId/applicants",
  restrictTo("company"),
  GetAllApplicants
);
router.get(
  "/:internshipId/applicants/:applicantId",
  restrictTo("company"),
  GetApplicant
);

module.exports = router;
