const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const { processImage } = require("../middleware/uploadMiddleware");

function generateToken(res, _id) {
  const token = jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("jwt", token, cookieOptions);
  return token;
}

// function to filter out unwanted fields which is used in updateMyAccount
function filterObj(obj, ...allowedFields) {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
}

exports.Signup = catchAsync(async (req, res, next) => {
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
});

exports.Signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(
      new AppError("No user found with this email please signup!", 404)
    );
  }

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401));
  }

  const token = generateToken(res, user._id);
  const { name, role, email: userEmail, photo } = user;

  res.status(200).json({
    status: "success",
    data: {
      name,
      role,
      email: userEmail,
      photo,
    },
    token,
  });
});

// v1 forgot password
// exports.ForgotPassword = catchAsync(async (req, res, next) => {
//   const user = await User.findOne({ email: req.body.email });

//   if (!user) {
//     return next(new AppError("User not found!", 404));
//   }

//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });

//   const resetURL = `${req.protocol}://localhost:3000/api/v1/user/reset-password/${resetToken}`;

//   const textMessage = `If you forgot your password, click the link below to reset it: ${resetURL}.\nIf you didn't request this, please ignore this email.`;

//   const htmlMessage = `
//     <p>If you forgot your password, click the link below to reset it:</p>
//     <a href="${resetURL}">Reset Password</a>
//     <p>If you didn't request this, please ignore this email.</p>
//   `;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: "Your password reset token (valid for 10 minutes)",
//       text: textMessage,
//       html: htmlMessage,
//     });

//     res.status(200).json({
//       status: "success",
//       message: "Token sent to email",
//     });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;

//     console.log(err);
//     await user.save({ validateBeforeSave: false });

//     return next(
//       new AppError(
//         "There was an error sending the email. Try again later!",
//         500
//       )
//     );
//   }
// });

// v2 ForgotPassword
exports.ForgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const message = `Your password reset token is: ${resetToken}.\nIf you didn't forget your password, please ignore this email!`;

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <p>Your password reset token is:</p>
      <p style="word-break: break-all; color: #666; font-weight: bold;">${resetToken}</p>
      <p>This token will expire in 10 minutes.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
      html: htmlMessage,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

exports.ResetPassword = catchAsync(async (req, res, next) => {
  // Get token from request body instead of URL parameters
  const { token, password } = req.body;

  if (!token || !password) {
    return next(
      new AppError("Please provide both token and new password", 400)
    );
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const jwtToken = generateToken(res, user._id);

  res.status(200).json({
    status: "success",
    token: jwtToken,
  });
});

exports.UpdatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");
  // 2) Check if the posted current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Current password is incorrect", 401));
  }

  // 3) Update password
  user.password = req.body.password;
  await user.save();

  // 4) Log user in, send JWT
  const token = generateToken(res, user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

// v1 update my account
// exports.UpdateMyAccount = catchAsync(async (req, res, next) => {
//   // 1) Create an error if user tries to update password
//   if (req.body.password) {
//     return next(
//       new AppError(
//         "This route is not for password updates. Please use /updatePassword.",
//         400
//       )
//     );
//   }

//   // 2) Filter out unwanted fields
//   // added photo
//   const filteredBody = filterObj(req.body, "name", "email");

//   // 3) Update user document
//   const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
//     new: true,
//     runValidators: true,
//   });

//   res.status(200).json({
//     status: "success",
//     data: {
//       user: updatedUser,
//     },
//   });
// });

// v2 UpdateMyAccount
exports.UpdateMyAccount = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  // 2) Filtered out unallowed fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email", "photo");

  // 3) Handle photo upload if present
  if (req.file) {
    const filename = await processImage(req.file, req.user.id);
    filteredBody.photo = filename;
  }

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.DeleteMyAccount = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.user.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
