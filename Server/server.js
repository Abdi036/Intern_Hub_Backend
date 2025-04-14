const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const setupDefaultImage = require("./utils/setupDefaultImage");

const authRoute = require("./routes/authRoute");
const InternsRoute = require("./routes/InternshipRoute");
const adminRoute = require("./routes/adminRoute");
const errorMiddleware = require("./middleware/errorMiddleware");

dotenv.config();
const app = express();

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

// Routes
app.use("/images/users", express.static("public/images/users"));
app.use(
  "/documents/cover-letters",
  express.static("public/documents/cover-letters")
);
app.use("/api/v1/user", authRoute);
app.use("/api/v1/internships", InternsRoute);
app.use("/api/v1/admin", adminRoute);

// Global Error Handling Middleware
app.use(errorMiddleware);
// Server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}...`);
});
