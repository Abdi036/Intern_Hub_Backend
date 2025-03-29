const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

function generateToken(res, _id) {
  const token = jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
}

exports.Signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      password: req.body.password,
    });

    const token = generateToken(res, newUser._id);

    res.status(201).json({
      status: "success",
      token,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.Signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide email and password!",
    });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password!",
      });
    }

    const token = generateToken(res, user._id);

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
