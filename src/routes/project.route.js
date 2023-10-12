const express = require("express");

const route = express.Router();

const projectController = require("../controllers/project.controller");
const verifyToken = require("../middlewares/verifyToken.middleware");

/**
 * Express route for creating a new project.
 * Requires a valid authentication token.
 * @name POST /api/projects/create-project
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
route.post("/create-project", verifyToken, projectController.createProject);

/**
 * Express route for retrieving all projects.
 * Requires a valid authentication token.
 * @name GET /api/projects/all
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
route.get("/all", verifyToken, projectController.getAllProjects);

module.exports = route;
