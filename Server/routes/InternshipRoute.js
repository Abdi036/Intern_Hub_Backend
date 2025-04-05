const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  PostInternship,
  GetAllMycompanyInternships,
  GetPostedInternship,
  EditMyIntership,
  DeleteInternship,
  GetInternships,
  ApplyInternship,
  GetMyApplications,
  GetApplication,
  DeleteApplication,
  GetAllApplicants,
  GetApplicant,
  UpdateApplicationStatus
} = require("../controllers/internController");
const { upload: pdfUpload } = require("../middleware/pdfUploadMiddleware");

const router = express.Router();

// Protected Routes
router.use(protect);

// Public Routes
router.get("/", restrictTo("student","admin"), GetInternships);


// Company Routes
router.post("/postInternship", restrictTo("company"), PostInternship);
router.get("/allMypostedInterships", restrictTo("company"), GetAllMycompanyInternships);
router.patch("/update-application-status", restrictTo("company"), UpdateApplicationStatus);

// Student Routes
router.get("/my-applications", restrictTo("student"), GetMyApplications);
router.post("/:internshipId/apply", restrictTo("student"), pdfUpload.single("coverLetter"), ApplyInternship);
router.get("/:internshipId/application", restrictTo("student"), GetApplication);
router.delete("/:internshipId/delete-application", restrictTo("student"), DeleteApplication);

// Company Routes with ID
router.get("/:id", restrictTo("company"), GetPostedInternship);
router.patch("/:id", restrictTo("company"), EditMyIntership);
router.delete("/:id", restrictTo("company"), DeleteInternship);
router.get("/:internshipId/applicants", restrictTo("company"), GetAllApplicants);
router.get("/:internshipId/applicants/:applicantId", restrictTo("company"), GetApplicant);

module.exports = router;
