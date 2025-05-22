const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Internship = require("../models/intershipModel");
const User = require("../models/userModel");
const Application = require("../models/applicationModel");
const sendEmail = require("../utils/email");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../utils/cloudinary");

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

// student can view all intership from all companies
exports.GetInternships = catchAsync(async (req, res, next) => {
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  // Build query for filtering
  const query = {};

  // Filter by remote status if provided
  if (req.query.remote !== undefined) {
    query.remote = req.query.remote === "true";
  }

  // Filter by paid status if provided
  if (req.query.paid !== undefined) {
    query.paid = req.query.paid === "true";
  }

  // Execute query with pagination, filters, and sorting by createdAt (latest first)
  const internships = await Internship.find(query)
    .sort({ createdAt: -1 }) // Sort newest first
    .skip(skip)
    .limit(limit)
    .populate("companyId", "name");

  // Get total count for pagination with filters applied
  const total = await Internship.countDocuments(query);

  if (!internships || internships.length === 0) {
    return next(new AppError("No internships found", 404));
  }

  res.status(200).json({
    status: "success",
    results: total,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
    data: {
      internships,
    },
  });
});

exports.GetInternshipById = catchAsync(async (req, res, next) => {
  const internship = await Internship.findById(req.params.id).populate(
    "reviews"
  );
  if (!internship) {
    return next(new AppError("No internship found with that ID", 404));
  }
  res.status(200).json({
    status: "Success",
    internship,
  });
});

exports.ApplyInternship = catchAsync(async (req, res, next) => {
  // 1) Check if internship exists
  const internship = await Internship.findById(req.params.internshipId);
  if (!internship) {
    return next(new AppError("No internship found with that ID", 404));
  }

  // 2) Check if user has already applied
  const existingApplication = await Application.findOne({
    internshipId: req.params.internshipId,
    studentId: req.user._id,
  });

  if (existingApplication) {
    return next(
      new AppError("You have already applied for this internship", 400)
    );
  }

  // 3) Check if file is provided
  if (!req.file) {
    return next(
      new AppError("Please upload your cover letter as a PDF file", 400)
    );
  }

  const uploadsDir = path.join(__dirname, "../uploads");

  // 1. Ensure uploads folder exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // 2. Save file to disk
  const tempPath = path.join(uploadsDir, req.file.originalname);
  fs.writeFileSync(tempPath, req.file.buffer);

  // 3. Upload to Cloudinary
  const result = await cloudinary.uploader.upload(tempPath, {
    resource_type: "raw",
    folder: "cover-letters",
  });

  // 4. Clean up temp file
  fs.unlinkSync(tempPath);

  // 7) Create application with cloud URL
  const application = await Application.create({
    internshipId: req.params.internshipId,
    studentId: req.user._id,
    coverLetter: result.secure_url,
    portfolio: req.body.portfolio?.trim() || undefined,
    status: "pending",
  });

  // 8) Add student to internship's applicants array
  internship.applicants.push(req.user._id);
  await internship.save();

  res.status(201).json({
    status: "success",
    data: {
      application,
    },
  });
});

// Student Can Get all Their Application
exports.GetMyApplications = catchAsync(async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Find all applications for the student
    const applications = await Application.find({ studentId }).populate(
      "internshipId",
      "title CompanyName department startDate endDate location remote paid applicationDeadline numPositions description requiredSkills"
    );

    if (!applications || applications.length === 0) {
      return next(
        new AppError("You have not applied for any internships yet", 404)
      );
    }

    // Format the response to include relevant information
    const formattedApplications = applications
      .filter((app) => app.internshipId)
      .map((application) => ({
        applicationId: application._id,
        internshipId: application.internshipId._id,
        title: application.internshipId.title,
        companyName: application.internshipId.CompanyName,
        department: application.internshipId.department,
        startDate: application.internshipId.startDate,
        endDate: application.internshipId.endDate,
        location: application.internshipId.location,
        remote: application.internshipId.remote,
        paid: application.internshipId.paid,
        applicationStatus: application.status,
        applicationDeadline: application.internshipId.applicationDeadline,
        numPositions: application.internshipId.numPositions,
        description: application.internshipId.description,
        requiredSkills: application.internshipId.requiredSkills,
        coverLetter: application.coverLetter,
        portfolio: application.portfolio,
        appliedAt: application.appliedAt,
      }));

    res.status(200).json({
      status: "success",
      results: formattedApplications.length,
      data: {
        applications: formattedApplications,
      },
    });
  } catch (error) {
    console.error("Error in GetMyApplications:", error);
    next(error);
  }
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
      id: application._id,
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

// Get all applicants for a specific internship (Company)
exports.GetAllApplicants = catchAsync(async (req, res, next) => {
  const { internshipId } = req.params;
  const companyId = req.user._id;

  // Find the internship and verify company ownership
  const internship = await Internship.findOne({
    _id: internshipId,
    companyId,
  });

  if (!internship) {
    return next(
      new AppError("No internship found or unauthorized access", 404)
    );
  }

  // Find all applications for this internship
  const applications = await Application.find({ internshipId })
    .populate("studentId", "name email photo")
    .select("_id studentId status appliedAt");

  if (!applications || applications.length === 0) {
    return next(new AppError("No applicants found for this internship", 404));
  }

  // Format the response to include application ID
  const formattedApplicants = applications.map((app) => ({
    applicationId: app._id,
    studentId: app.studentId._id,
    name: app.studentId.name,
    email: app.studentId.email,
    photo: app.studentId.photo,
    status: app.status,
    appliedAt: app.appliedAt,
  }));

  res.status(200).json({
    status: "success",
    results: formattedApplicants.length,
    data: formattedApplicants,
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

  res.status(200).json({
    status: "success",
    message: "Application deleted successfully",
  });
});

exports.UpdateApplicationStatus = catchAsync(async (req, res, next) => {
  const { applicationId, status } = req.body;
  const companyId = req.user._id;

  // Validate status
  if (!["accepted", "rejected"].includes(status)) {
    return next(
      new AppError("Invalid status. Must be 'accepted' or 'rejected'", 400)
    );
  }

  // Find the application and populate internship details including companyId
  const application = await Application.findById(applicationId)
    .populate("studentId", "name email")
    .populate({
      path: "internshipId",
      select: "title CompanyName department startDate endDate companyId",
    });

  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  // Verify company owns the internship
  if (
    !application.internshipId ||
    application.internshipId.companyId.toString() !== companyId.toString()
  ) {
    return next(
      new AppError("You are not authorized to update this application", 403)
    );
  }

  // Update application status
  application.status = status;
  await application.save();

  // Prepare email content based on status
  const emailSubject =
    status === "accepted"
      ? `Congratulations! Your application for ${application.internshipId.title} has been accepted!`
      : `Update on your application for ${application.internshipId.title}`;

  const emailMessage =
    status === "accepted"
      ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Congratulations!</h2>
        <p>Dear ${application.studentId.name},</p>
        <p>We are pleased to inform you that your application for the ${
          application.internshipId.title
        } position at ${
          application.internshipId.CompanyName
        } has been accepted!</p>
        <p>Internship Details:</p>
        <ul>
          <li>Position: ${application.internshipId.title}</li>
          <li>Company: ${application.internshipId.CompanyName}</li>
          <li>Department: ${application.internshipId.department}</li>
          <li>Start Date: ${new Date(
            application.internshipId.startDate
          ).toLocaleDateString()}</li>
          <li>End Date: ${new Date(
            application.internshipId.endDate
          ).toLocaleDateString()}</li>
        </ul>
        <p>Next Steps:</p>
        <ol>
          <li>Please confirm your acceptance by replying to this email</li>
          <li>We will send you further details about onboarding process</li>
        </ol>
        <p>Best regards,<br>${application.internshipId.CompanyName} Team</p>
      </div>
    `
      : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">Application Status Update</h2>
        <p>Dear ${application.studentId.name},</p>
        <p>Thank you for your interest in the ${application.internshipId.title} position at ${application.internshipId.CompanyName}.</p>
        <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
        <p>We encourage you to apply for future opportunities that match your skills and experience.</p>
        <p>Best regards,<br>${application.internshipId.CompanyName} Team</p>
      </div>
    `;

  // Send email to student
  try {
    await sendEmail({
      email: application.studentId.email,
      subject: emailSubject,
      message: emailMessage,
      html: emailMessage,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }

  res.status(200).json({
    status: "success",
    message: `Application ${status} successfully`,
    data: {
      application,
    },
  });
});
