const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors)

mongoose
  .connect(process.env.REMOTE_MONGO_URI)
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((error) => {
    console.error("DB connection failed:", error.message);
  });

  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}...`);
  })