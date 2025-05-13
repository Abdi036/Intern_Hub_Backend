const express = require("express");

const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  Signup,
  Signin,
  ForgotPassword,
  ResetPassword,
  UpdatePassword,
  UpdateMyAccount,
  DeleteMyAccount,
  verifyEmail,
  resendOTP,
  ApproveMyCompanyAccount,
} = require("../controllers/userController");
const { upload } = require("../middleware/uploadMiddleware");

router
  .post("/signup", Signup)
  .post("/verify-email", verifyEmail)
  .post("/resend-otp", resendOTP)
  .post("/signin", Signin)
  .post("/forgot-password", ForgotPassword);
router.patch("/reset-password", ResetPassword);
router.patch("/update-password", protect, UpdatePassword);
// router.patch("/update-me", protect, UpdateMyAccount);
router.patch("/update-me", protect, upload.single("photo"), UpdateMyAccount);
router.delete("/delete-me", protect, DeleteMyAccount);
router.post(
  "/upload-approval-letter",
  protect,
  upload.single("approvalLetter"),
  ApproveMyCompanyAccount
);

module.exports = router;
