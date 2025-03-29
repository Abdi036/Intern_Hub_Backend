const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

const {
  Signup,
  Signin,
  PostInternship,
  GetAllMycompanyInternships,
  GetPostedInternship,
  EditMyIntership,
  DeleteInternship,

  //////////////students////////
  GetInternships,
} = require("../controllers/userController");

router.post("/signup", Signup);
router.post("/signin", Signin);

// COMPANY ROUTES
router.post("/postInternship", protect, restrictTo("company"), PostInternship);

router.get(
  "/allMypostedInterships",
  protect,
  restrictTo("company"),
  GetAllMycompanyInternships
);

router.get("/internship/:id", protect, GetPostedInternship);

router.patch(
  "/internship/:id",
  protect,
  restrictTo("company"),
  EditMyIntership
);

router.delete(
  "/internship/:id",
  protect,
  restrictTo("company"),
  DeleteInternship
);

// STUDENT ROUTES
router.get("/allInternships", protect, restrictTo("student"), GetInternships);
// apply for internship

module.exports = router;
