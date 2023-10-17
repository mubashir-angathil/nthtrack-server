const express = require("express");

const router = express.Router();

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
router.post("/create-project", verifyToken, projectController.createProject);

/**
 * Express route for updating an existing project.
 * Requires a valid authentication token.
 * @name PATCH /api/project/update-project
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
router.patch("/update-project", verifyToken, projectController.updateProject);

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
router.get("/all", verifyToken, projectController.getAllProjects);

/**
 * Express route for retrieving a project by ID.
 * Requires a valid authentication token.
 * @name GET /api/project/:projectId
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
router.get("/:projectId", verifyToken, projectController.getProjectById);

/**
 * Express route for closing a project by ID.
 * Requires a valid authentication token.
 * @name PATCH /api/project/close
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
router.patch("/close", verifyToken, projectController.closeProjectById);

/**
 * Express route for creating an issue within a project.
 * Requires a valid authentication token.
 * @name POST /api/project/:projectId/issue/create
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
router.post(
  "/:projectId/issue/create",
  verifyToken,
  projectController.createIssue,
);

/**
 * Express route for updating an issue within a project.
 * Requires a valid authentication token.
 * @name PATCH /api/project/update-issue
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
router.patch("/update-issue", verifyToken, projectController.updateIssue);

/**
 * Express route for retrieving all issues within a project.
 * Requires a valid authentication token.
 * @name GET /api/project/:projectId/issue/all
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
router.get(
  "/:projectId/issue/all",
  verifyToken,
  projectController.getAllIssues,
);

/**
 * Express route for retrieving an issue by ID within a project.
 * Requires a valid authentication token.
 * @name GET /api/project/issue/:issueId
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
router.get("/issue/:issueId", verifyToken, projectController.getIssueById);

/**
 * Express route for closing an issue by ID within a project.
 * Requires a valid authentication token.
 * @name PATCH /api/project/issue/close
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
router.patch("/issue/close", verifyToken, projectController.closeIssueById);

module.exports = router;
