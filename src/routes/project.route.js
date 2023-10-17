const express = require("express");

const route = express.Router();

const projectController = require("../controllers/project.controller");
const verifyToken = require("../middlewares/verifyToken.middleware");

/**
 * Express route for creating a new project.
 * Requires a valid authentication token.
 * @name POST /api/project/create-project
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
route.post("/create-project", verifyToken, projectController.createProject);
route.patch("/update-project", verifyToken, projectController.updateProject);

/**
 * Express route for retrieving all projects.
 * Requires a valid authentication token.
 * @name GET /api/project/all
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
route.get("/all", verifyToken, projectController.getAllProjects);
route.get("/:projectId", verifyToken, projectController.getProjectById);
route.patch("/close", verifyToken, projectController.closeProjectById);

route.post(
  "/:projectId/issue/create",
  verifyToken,
  projectController.createIssue,
);
route.patch("/update-issue", verifyToken, projectController.updateIssue);

route.get("/:projectId/issue/all", verifyToken, projectController.getAllIssues);
route.get("/issue/:issueId", verifyToken, projectController.getIssueById);
route.patch("/issue/close", verifyToken, projectController.closeIssueById);

module.exports = route;
