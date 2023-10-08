const express = require("express");

const route = express.Router();

const projectController = require("../controllers/project.controller");
const verifyToken = require("../middlewares/verifyToken.middleware");

route.post("/create-project", verifyToken, projectController.createProject);

module.exports = route;
