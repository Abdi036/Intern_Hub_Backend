const User = require(".././models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const catchAsync = require(".././utils/catchAsync");
const AppError = require("../utils/appError");

// Function to generate token
const generateToken = (res, _id) => {
  const token = jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return token;
};

exports.Signup = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Signup route is working",
  });
  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   role: req.body.role,
  // });

  // const token = generateToken(res, newUser._id);

  // res.status(201).json({
  //   status: "success",
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
});

exports.Signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("No user with this email!", 404));
  }

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const token = generateToken(res, user._id);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});
