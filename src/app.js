const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.route");
const projectRoutes = require("./routes/project.route");
const dataRoutes = require("./routes/data.route");
const indexRoutes = require("./routes/index.route");
const { errorHandler } = require("./middlewares/errorHandler.middleware");
const scheduledTasks = require("./schedules");

// Initialize express app
const app = express();

// Parse incoming JSON requests
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Mount common routes under /
app.use("/", indexRoutes);

// Mount authentication routes under /auth
app.use("/auth", authRoutes);

// Mount project-related routes under /project
app.use("/project", projectRoutes);

// Mount data-related routes under /data
app.use("/data", dataRoutes);

// Handle errors globally with the errorHandler middleware
app.use(errorHandler);

// Start scheduled tasks
scheduledTasks();

module.exports = app;
