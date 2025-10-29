const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");

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

// exports.Signup = catchAsync(async (req, res, next) => {
//   const { email } = req.body;
//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     return next(new AppError("User already exists with this email.", 400));
//   }
//   const newUser = await User.create({
//     name: req.body.name,
//     email: req.body.email,
//     role: req.body.role,
//     password: req.body.password,
//   });
//   const token = generateToken(res, newUser._id);
//   const otp = User.createOtp();

//   const message = `Your OTP code is: ${otp}. It will expire in 10 minutes.`;

//   const htmlMessage = `
//     <div style="font-family: Arial; max-width: 600px;">
//       <h2>Welcome to InternHub!</h2>
//       <p>Please use the OTP below to verify your email:</p>
//       <h3 style="color: green;">${otp}</h3>
//       <p>This OTP will expire in 10 minutes.</p>
//     </div>
//   `;

//   await sendEmail({
//     email: User.email,
//     subject: "Verify your email - OTP",
//     message,
//     html: htmlMessage,
//   });

//   res.status(201).json({
//     status: "success",
//     token,
//   });
// });
exports.Signup = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("User already exists with this email.", 400));
  }

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
  });

  // EMAIL VERIFICATION DISABLED - Generate OTP
  // const otp = newUser.createEmailOTP();
  // await newUser.save({ validateBeforeSave: false });

  // Prepare email content
  // const message = `Your OTP code is: ${otp}. It will expire in 10 minutes.`;

  // const htmlMessage = `
  //   <div style="font-family: Arial; max-width: 600px;">
  //     <h2>Welcome to InternHub!</h2>
  //     <p>Please use the OTP below to verify your email:</p>
  //     <h3 style="color: green;">${otp}</h3>
  //     <p>This OTP will expire in 10 minutes.</p>
  //   </div>
  // `;

  // Try to send email, but don't fail signup if email fails
  // try {
  //   await sendEmail({
  //     email: newUser.email,
  //     subject: "Verify your email - OTP",
  //     message,
  //     html: htmlMessage,
  //   });

  //   // Send response if email sent successfully
  //   const token = generateToken(res, newUser._id);
  //   res.status(201).json({
  //     status: "success",
  //     token,
  //     message: "OTP sent to your email. Please verify to continue.",
  //   });
  // } catch (error) {
  //   console.error("Email sending failed:", error);
    
  //   // Still allow signup but inform user about email issue
  //   const token = generateToken(res, newUser._id);
  //   res.status(201).json({
  //     status: "success",
  //     token,
  //     message: "Account created successfully! However, we couldn't send the OTP email. Please use the 'Resend OTP' option.",
  //     emailError: true,
  //   });
  // }

  // EMAIL VERIFICATION DISABLED - Direct signup without verification
  const token = generateToken(res, newUser._id);
  res.status(201).json({
    status: "success",
    token,
    message: "Account created successfully!",
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email, otp });

  if (!user) {
    return next(new AppError("Invalid OTP or email.", 400));
  }

  if (user.otpExpires < Date.now()) {
    return next(
      new AppError("OTP has expired. Please request a new one.", 400)
    );
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Email successfully verified.",
  });
});

exports.resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found with this email.", 404));
  }

  if (user.isVerified) {
    return next(new AppError("This email is already verified.", 400));
  }

  // Generate and set new OTP
  const newOtp = user.createEmailOTP();
  await user.save({ validateBeforeSave: false });

  // Compose message
  const message = `Your new OTP code is: ${newOtp}. It will expire in 10 minutes.`;
  const htmlMessage = `
    <div style="font-family: Arial; max-width: 600px;">
      <h2>InternHub OTP Resend</h2>
      <p>Please use the OTP below to verify your email:</p>
      <h3 style="color: green;">${newOtp}</h3>
      <p>This OTP will expire in 10 minutes.</p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Resend OTP - InternHub",
      message,
      html: htmlMessage,
    });

    res.status(200).json({
      status: "success",
      message: "A new OTP has been sent to your email.",
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    return next(
      new AppError(
        "Failed to send OTP email. Please check your email configuration or try again later.",
        500
      )
    );
  }
});

exports.Signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  // EMAIL VERIFICATION DISABLED
  // if (!user.isVerified) {
  //   return next(new AppError("Please verify your email first.", 400));
  // }
  if (!user) {
    return next(
      new AppError("No user found with this email please signup!", 404)
    );
  }

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401));
  }

  const token = generateToken(res, user._id);
  const { name, role, email: userEmail, photo, _id, approved } = user;

  res.status(200).json({
    status: "success",
    data: {
      name,
      role,
      email: userEmail,
      photo,
      approved,
      _id,
    },
    token,
  });
});

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

// v2 UpdateMyAccount
// exports.UpdateMyAccount = catchAsync(async (req, res, next) => {
//   // 1) Create error if user POSTs password data
//   if (req.body.password || req.body.passwordConfirm) {
//     return next(
//       new AppError(
//         "This route is not for password updates. Please use /updateMyPassword.",
//         400
//       )
//     );
//   }

//   // 2) Filtered out unallowed fields names that are not allowed to be updated
//   const filteredBody = filterObj(req.body, "name", "email", "photo");

//   // 3) Handle photo upload if present
//   if (req.file) {
//     const uploadResult = await cloudinary.uploader.upload_stream(
//       {
//         folder: "user_photos", // Cloudinary folder
//         public_id: `user-${req.user.id}`,
//         transformation: [{ width: 500, height: 500, crop: "fill" }],
//       },
//       async (error, result) => {
//         if (error) {
//           return next(new AppError("Cloudinary upload failed", 500));
//         }
//         filteredBody.photo = result.secure_url;

//         // Update user with new photo
//         const updatedUser = await User.findByIdAndUpdate(
//           req.user.id,
//           filteredBody,
//           {
//             new: true,
//             runValidators: true,
//           }
//         );

//         res.status(200).json({
//           status: "success",
//           data: {
//             user: updatedUser,
//           },
//         });
//       }
//     );

//     // Pipe image buffer to Cloudinary
//     require("streamifier").createReadStream(req.file.buffer).pipe(uploadResult);
//   } else {
//     const updatedUser = await User.findByIdAndUpdate(
//       req.user.id,
//       filteredBody,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     res.status(200).json({
//       status: "success",
//       data: {
//         user: updatedUser,
//       },
//     });
//   }
// });

exports.UpdateMyAccount = catchAsync(async (req, res, next) => {
  // 1) Disallow password updates via this route
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  // 2) Filter out unallowed fields
  const filteredBody = filterObj(req.body, "name", "email", "photo");

  // 3) If file is uploaded, handle Cloudinary upload
  if (req.file) {
    const streamUpload = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "user_photos",
            public_id: `user-${req.user.id}`,
            transformation: [{ width: 500, height: 500, crop: "fill" }],
          },
          (error, result) => {
            if (error) reject(new AppError("Cloudinary upload failed", 500));
            else resolve(result);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });

    const result = await streamUpload(req.file.buffer);
    filteredBody.photo = result.secure_url;
  }

  // 4) Update user
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
    message: "Internship deleted successfully",
  });
});

exports.ApproveMyCompanyAccount = catchAsync(async (req, res, next) => {
  const user = req.user;

  if (!req.file) {
    return res.status(400).json({
      status: "fail",
      message: "Please upload an approval letter image.",
    });
  }

  // Use a Promise wrapper to handle cloudinary.upload_stream with async/await
  const uploadToCloudinary = () =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "intern_hub/approval_letters",
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

  try {
    const result = await uploadToCloudinary();

    // Update user document
    user.approvalLetter = result.secure_url;
    user.approved = "pending";
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "Approval letter uploaded successfully. Awaiting admin review.",
      data: {
        approvalImage: result.secure_url,
      },
    });
  } catch (err) {
    return next(new AppError("Cloudinary upload failed.", 500));
  }
});
