const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Internship = require("../models/intershipModel");

exports.PostInternship = catchAsync(async (req, res, next) => {
  const {
    title,
    CompanyName,
    department,
    startDate,
    endDate,
    description,
    requiredSkills,
    location,
    remote,
    paid,
    numPositions,
    applicationDeadline,
  } = req.body;

  if (
    !title ||
    !CompanyName ||
    !department ||
    !startDate ||
    !endDate ||
    !description ||
    !requiredSkills ||
    !location ||
    !numPositions ||
    !applicationDeadline
  ) {
    return next(new AppError("All required fields must be provided!", 400));
  }

  const currentDate = new Date();

  // Validate startDate
  if (new Date(startDate) < currentDate) {
    return next(new AppError("Start date cannot be in the past!", 400));
  }

  // Validate endDate
  if (new Date(endDate) < currentDate) {
    return next(new AppError("End date has already passed!", 400));
  }

  // Create internship
  const internship = await Internship.create({
    title,
    CompanyName,
    department,
    startDate,
    endDate,
    description,
    requiredSkills,
    location,
    remote: remote || false,
    paid: paid || false,
    numPositions,
    applicationDeadline,
    companyId: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: {
      internship,
    },
  });
});

// company can see all the internships they have posted
exports.GetAllMycompanyInternships = catchAsync(async (req, res, next) => {
  const internships = await Internship.find({ companyId: req.user._id });

  if (!internships || internships.length === 0) {
    return next(new AppError("No internships found for this company", 404));
  }

  res.status(200).json({
    status: "success",
    results: internships.length,
    data: {
      internships,
    },
  });
});

// company can get a specific internship they have posted
exports.GetPostedInternship = catchAsync(async (req, res, next) => {
  const internship = await Internship.findById(req.params.id);

  if (!internship) {
    return next(new AppError("No internship found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      internship,
    },
  });
});

// company can edit an internship they have posted
exports.EditMyIntership = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    CompanyName,
    department,
    duration,
    description,
    requiredSkills,
    location,
    remote,
    paid,
    numPositions,
    applicationDeadline,
  } = req.body;

  const internship = await Internship.findById(id);
  if (!internship) {
    return next(new AppError("No internship found with this ID", 404));
  }

  if (internship.companyId.toString() !== req.user._id.toString()) {
    return next(
      new AppError("You are not authorized to edit this internship", 403)
    );
  }

  const updatedInternship = await Internship.findByIdAndUpdate(
    id,
    {
      title,
      CompanyName,
      department,
      duration,
      description,
      requiredSkills,
      location,
      remote: remote || false,
      paid: paid || false,
      numPositions,
      applicationDeadline,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      internship: updatedInternship,
    },
  });
});

// company can delete an internship they have posted
exports.DeleteInternship = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const internship = await Internship.findById(id);
  if (!internship) {
    return next(new AppError("No internship found with that ID", 404));
  }

  if (internship.companyId.toString() !== req.user._id.toString()) {
    return next(
      new AppError("You are not authorized to delete this internship", 403)
    );
  }

  await Internship.findByIdAndDelete(id);

  res.status(204).json({
    status: "success",
    message: "Internship deleted successfully",
  });
});

// Students Controller
exports.GetInternships = catchAsync(async (req, res, next) => {
  const internships = await Internship.find({}).populate("companyId", "name");

  if (!internships || internships.length === 0) {
    return next(new AppError("No internships found", 404));
  }

  res.status(200).json({
    status: "success",
    results: internships.length,
    data: {
      internships,
    },
  });
});

exports.ApplyInternship = catchAsync(async (req, res, next) => {
  
})
