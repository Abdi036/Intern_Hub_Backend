const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();
const {
  Signup,
  Signin,
  PostInternship,
  GetAllMycompanyInternships,
  GetPostedInternship,
} = require("../controllers/userController");

router.post("/signup", Signup);
router.post("/signin", Signin);
router.post("/postInternship", protect, restrictTo("company"), PostInternship);

router.get(
  "/allMypostedInterships",
  protect,
  restrictTo("company"),
  GetAllMycompanyInternships
);

router.get("/internship/:id", protect, GetPostedInternship);

// get all internships student
// get intership/:id student

module.exports = router;
