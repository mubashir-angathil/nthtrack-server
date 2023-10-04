const express = require("express");
const cors = require("cors");
const authRoute = require("./routes/auth.routes");

// Assign express
const app = express();

// Enables cors
app.use(cors({}));

// Route initialization
app.use("/auth", authRoute);

module.exports = app;
