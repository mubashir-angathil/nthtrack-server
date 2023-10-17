const express = require("express");
const cors = require("cors");
const authRoute = require("./routes/auth.route");
const projectRoute = require("./routes/project.route");

// Assign express
const app = express();

// Parse incoming JSON requests
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Route initialization
app.use("/auth", authRoute); // Mount authRoute under /auth
app.use("/project", projectRoute); // Mount projectRoute under /project

module.exports = app;
