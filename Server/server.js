const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const setupDefaultImage = require("./utils/setupDefaultImage");
const authRoute = require("./routes/authRoute");
const InternsRoute = require("./routes/InternshipRoute");
const ReviewRoute = require("./routes/reviewRoute");
const adminRoute = require("./routes/adminRoute");
const errorMiddleware = require("./middleware/errorMiddleware");

dotenv.config();
const app = express();

// Define rate limiter before use
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 500,
//   message: "Too many requests from this IP, please try again later.",
// });

// Apply security-related middleware first
// app.use(limiter);
app.use(xss());
app.use(mongoSanitize());

// Middleware
app.use(cors());
app.use(express.json());

// Setup default image
setupDefaultImage();

// Database Connection
mongoose
  .connect(process.env.REMOTE_MONGO_URI)
  .then(() => console.log("DB connected successfully"))
  .catch((error) => console.error("DB connection failed:", error.message));

// Static File Serving
app.use("/images/users", express.static("public/images/users"));

// Routes
app.use("/api/v1/user", authRoute);
app.use("/api/v1/internships", InternsRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/reviews", ReviewRoute);

// Global Error Handling Middleware
app.use(errorMiddleware);

// Server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}...`);
});
