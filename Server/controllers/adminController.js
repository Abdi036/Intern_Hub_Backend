const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const Internship = require("../models/intershipModel");

// Get all users with optional role filter
exports.GetAllUsers = catchAsync(async (req, res, next) => {
  const query = {};

  // Filter by role if provided
  if (req.query.role) {
    query.role = req.query.role;
  }

  const users = await User.find(query).select("-password");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password");

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User not found.",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.approveCompany = catchAsync(async (req, res, next) => {
  const { companyId } = req.params;
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid approval status. Must be 'approved' or 'rejected'.",
    });
  }

  const companyUser = await User.findOne({ _id: companyId, role: "company" });

  if (!companyUser) {
    return res.status(404).json({
      status: "fail",
      message: "Company user not found.",
    });
  }

  companyUser.approved = status;
  await companyUser.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: `Company has been ${status}.`,
    data: {
      company: companyUser,
    },
  });
});

// Delete a user
exports.DeleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  await User.findByIdAndDelete(req.params.userId);

  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
  });
});

// Delete an internship
exports.DeleteInternship = catchAsync(async (req, res, next) => {
  const internship = await Internship.findById(req.params.internshipId);

  if (!internship) {
    return next(new AppError("Internship not found", 404));
  }

  await Internship.findByIdAndDelete(req.params.internshipId);

  res.status(200).json({
    status: "success",
    message: "Internship deleted successfully",
  });
});
