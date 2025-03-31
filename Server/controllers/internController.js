const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Internship = require("../models/intershipModel");
const User = require("../models/userModel");
const Application = require("../models/applicationModel");

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

// Students Controller to get all the internships
// exports.GetInternships = catchAsync(async (req, res, next) => {
//   const internships = await Internship.find({}).populate("companyId", "name");

//   if (!internships || internships.length === 0) {
//     return next(new AppError("No internships found", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     results: internships.length,
//     data: {
//       internships,
//     },
//   });
// });

exports.GetInternships = catchAsync(async (req, res, next) => {
  const { sortBy } = req.query;

  let sortOptions = {};

  sortOptions =
    sortBy === "name"
      ? { name: 1 }
      : sortBy === "date"
      ? { createdAt: -1 }
      : {};

  const internships = await Internship.find({})
    .populate("companyId", "name")
    .sort(sortOptions);

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
  const { internshipId } = req.params;
  const studentId = req.user.id;
  const { coverLetter, portfolio } = req.body;

  const internship = await Internship.findById(internshipId);
  if (!internship) {
    return next(new AppError("Internship not found", 404));
  }

  if (internship.applicants.includes(studentId)) {
    return next(
      new AppError("You have already applied for this internship", 400)
    );
  }

  // Create application record
  const application = await Application.create({
    internshipId,
    studentId,
    coverLetter,
    portfolio,
    status: "pending",
  });

  // Add student to internship applicants
  internship.applicants.push(studentId);
  await internship.save();

  res.status(200).json({
    status: "success",
    message: "Successfully applied for the internship",
    data: {
      application,
    },
  });
});

exports.GetMyApplications = catchAsync(async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Find all internships where the student has applied
    const internships = await Internship.find({
      applicants: studentId,
    }).populate("companyId", "name");

    if (!internships || internships.length === 0) {
      return next(
        new AppError("You have not applied for any internships yet", 404)
      );
    }

    // Format the response to include relevant information
    const applications = internships.map((internship) => ({
      internshipId: internship._id,
      title: internship.title,
      companyName: internship.CompanyName,
      department: internship.department,
      startDate: internship.startDate,
      endDate: internship.endDate,
      location: internship.location,
      remote: internship.remote,
      paid: internship.paid,
      applicationStatus: "Pending",
      applicationDeadline: internship.applicationDeadline,
      numPositions: internship.numPositions,
      currentApplicants: internship.applicants.length,
      description: internship.description,
      requiredSkills: internship.requiredSkills,
    }));

    res.status(200).json({
      status: "success",
      results: applications.length,
      data: {
        applications,
      },
    });
  } catch (error) {
    console.error("Error in GetMyApplications:", error);
    next(error);
  }
});

// Get all applicants for a specific internship (Company)
exports.GetAllApplicants = catchAsync(async (req, res, next) => {
  const { internshipId } = req.params;
  const companyId = req.user.id;
  const { sortBy } = req.query;

  // Find the internship and populate applicants
  const internship = await Internship.findOne({
    _id: internshipId,
    companyId,
  }).populate({
    path: "applicants",
    select: "name email createdAt",
    options: {
      sort:
        sortBy === "name"
          ? { name: 1 }
          : sortBy === "date"
          ? { createdAt: -1 }
          : {},
    },
  });

  if (!internship) {
    return next(
      new AppError("No internship found or unauthorized access", 404)
    );
  }

  res.status(200).json({
    status: "success",
    results: internship.applicants.length,
    data: internship.applicants,
  });
});

exports.GetApplication = catchAsync(async (req, res, next) => {
  const { internshipId } = req.params;
  const studentId = req.user._id;

  // Find the application with internship details
  const application = await Application.findOne({
    internshipId,
    studentId,
  }).populate(
    "internshipId",
    "title CompanyName department startDate endDate location remote paid applicationDeadline"
  );

  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  // Format the response
  const applicationDetails = {
    applicationId: application._id,
    internship: {
      title: application.internshipId.title,
      companyName: application.internshipId.CompanyName,
      department: application.internshipId.department,
      startDate: application.internshipId.startDate,
      endDate: application.internshipId.endDate,
      location: application.internshipId.location,
      remote: application.internshipId.remote,
      paid: application.internshipId.paid,
      applicationDeadline: application.internshipId.applicationDeadline,
    },
    application: {
      coverLetter: application.coverLetter,
      portfolio: application.portfolio,
      status: application.status,
      appliedAt: application.appliedAt,
    },
  };

  res.status(200).json({
    status: "success",
    data: applicationDetails,
  });
});

// Get a specific applicant for a specific internship (Company)
exports.GetApplicant = catchAsync(async (req, res, next) => {
  const { internshipId, applicantId } = req.params;
  const companyId = req.user.id;

  const internship = await Internship.findOne({ _id: internshipId, companyId });
  if (!internship) {
    return next(
      new AppError("No internship found or unauthorized access", 404)
    );
  }

  if (!internship.applicants.includes(applicantId)) {
    return next(
      new AppError("This applicant did not apply for this internship", 404)
    );
  }

  // Get the application details including cover letter and portfolio
  const application = await Application.findOne({
    internshipId,
    studentId: applicantId,
  });

  if (!application) {
    return next(new AppError("Application details not found", 404));
  }

  // Get the applicant's basic information
  const applicant = await User.findById(applicantId).select("name email");

  if (!applicant) {
    return next(new AppError("Applicant not found", 404));
  }

  // Combine all information
  const applicantDetails = {
    ...applicant.toObject(),
    application: {
      coverLetter: application.coverLetter,
      portfolio: application.portfolio,
      appliedAt: application.appliedAt,
    },
  };

  res.status(200).json({
    status: "success",
    data: applicantDetails,
  });
});

exports.DeleteApplication = catchAsync(async (req, res, next) => {
  const { internshipId } = req.params;
  const studentId = req.user._id;

  // Find the application
  const application = await Application.findOne({
    internshipId,
    studentId,
  });

  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  // Find the internship and remove student from applicants array
  const internship = await Internship.findById(internshipId);
  if (!internship) {
    return next(new AppError("Internship not found", 404));
  }

  // Remove student from applicants array
  internship.applicants = internship.applicants.filter(
    (applicant) => applicant.toString() !== studentId.toString()
  );
  await internship.save();

  // Delete the application
  await Application.findByIdAndDelete(application._id);

  res.status(204).json({
    status: "success",
    message: "Application deleted successfully",
  });
});
