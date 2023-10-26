const express = require("express");
const cors = require("cors");
const authRoute = require("./routes/auth.route");
const projectRoute = require("./routes/project.route");
const dataRoute = require("./routes/data.route");
const { errorHandler } = require("./middlewares/errorHandler.middleware");

// Assign express
const app = express();

// Parse incoming JSON requests
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Route initialization
app.use("/auth", authRoute); // Mount authRoute under /auth
app.use("/project", projectRoute); // Mount projectRoute under /project
app.use("/data", dataRoute); // Mount dataRoute under /data

app.use(errorHandler);
module.exports = app;
