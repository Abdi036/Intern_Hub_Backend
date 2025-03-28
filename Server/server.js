const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const errorMiddleware = require("./controllers/errorController");
const authRoute = require("./routes/authRoute");

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Database Connection
mongoose
  .connect(process.env.REMOTE_MONGO_URI)
  .then(() => console.log("DB connected successfully"))
  .catch((error) => console.error("DB connection failed:", error.message));

// Routes
app.use("api/v1/auth", authRoute);

// Global Error Handling Middleware
app.use(errorMiddleware);

// Server
app.listen(process.env.PORT, () => {
  console.log(`Server is running...`);
});
