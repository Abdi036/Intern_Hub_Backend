const express = require("express");
const router = express.Router();
const { Signin, Signup } = require(".././middleware/authController");

router.post("/signup", Signup);
router.post("/signin", Signin);

module.exports = router;
