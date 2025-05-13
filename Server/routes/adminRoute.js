const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  GetAllUsers,
  DeleteUser,
  DeleteInternship,
  approveCompany,
  getUserById,
} = require("../controllers/adminController");

// Protect all routes and restrict to admin only
router.use(protect);
router.use(restrictTo("admin"));

// User management routes
router.get("/users", GetAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:companyId/approve-company", approveCompany);
router.delete("/users/:userId", DeleteUser);

// Internship management routes
router.delete("/internships/:internshipId", DeleteInternship);

module.exports = router;
