const express = require("express");

const route = express.Router();

const projectController = require("../controllers/project.controller");
const verifyToken = require("../middlewares/verifyToken.middleware");

route.get("/all", verifyToken, projectController.getProjects);

module.exports = route;
