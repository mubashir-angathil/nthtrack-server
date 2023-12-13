const express = require("express");

const router = express.Router();

const projectController = require("../controllers/project.controller");
const {
  verifyToken,
  validatePermission,
} = require("../middlewares/auth.middleware");
const { tryCatch } = require("../utils/helpers/helpers");

/**
 * Express route for creating a new project.
 * Requires a valid authentication token.
 * @name POST /api/project/create
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */

router.post("/create", verifyToken, tryCatch(projectController.createProject));

/**
 * Express route for updating an existing project.
 * Requires a valid authentication token.
 * @name PATCH /api/project/update
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
router.patch(
  "/update",
  verifyToken,
  validatePermission("project.id"),
  tryCatch(projectController.updateProject),
);

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
router.get("/all", verifyToken, tryCatch(projectController.getAllProjects));

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
router.get(
  "/:projectId",
  verifyToken,
  validatePermission("project.id"),
  tryCatch(projectController.getProjectById),
);

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
router.delete(
  "/:projectId/close",
  verifyToken,
  validatePermission("project.id"),
  tryCatch(projectController.closeProjectById),
);

/**
 * Express route for creating an task within a project.
 * Requires a valid authentication token.
 * @name POST /api/project/:projectId/task/create
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
router.post(
  "/:projectId/task/create",
  verifyToken,
  validatePermission("project.task.id"),
  tryCatch(projectController.createTask),
);

/**
 * Express route for updating an task within a project.
 * Requires a valid authentication token.
 * @name PATCH /api/project/update-task
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
router.patch(
  "/:projectId/task/update",
  verifyToken,
  validatePermission("project.id"),
  tryCatch(projectController.updateTask),
);

/**
 * Express route for retrieving all tasks within a project.
 * Requires a valid authentication token.
 * @name GET /api/project/:projectId/task/all
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
router.get(
  "/:projectId/task/all",
  verifyToken,
  validatePermission("project.task.all"),
  tryCatch(projectController.getAllTasks),
);

/**
 * Express route for retrieving an task by ID within a project.
 * Requires a valid authentication token.
 * @name GET /api/project/task/:taskId
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
router.get(
  "/:projectId/task/:taskId",
  verifyToken,
  validatePermission("project.task.id"),
  tryCatch(projectController.getTaskById),
);

/**
 * Express route for closing an task by ID within a project.
 * Requires a valid authentication token.
 * @name PATCH /api/project/task/close
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} middleware - Middleware function to verify authentication token.
 * @param {Function} controller - Controller function to handle the request.
 */
router.delete(
  "/:projectId/task/:taskId/close",
  verifyToken,
  validatePermission("project.task.id"),
  tryCatch(projectController.closeTaskById),
);

router.post(
  "/:projectId/member/add",
  verifyToken,
  validatePermission("project.member.id"),
  tryCatch(projectController.addMember),
);

router.put(
  "/:projectId/member/update",
  verifyToken,
  validatePermission("project.member.id"),
  tryCatch(projectController.updateMember),
);

router.delete(
  "/:projectId/member/:memberId/delete",
  verifyToken,
  validatePermission("project.member.id"),
  tryCatch(projectController.removeMember),
);

router.post(
  "/permission/create",
  verifyToken,
  tryCatch(projectController.createPermission),
);

router.patch(
  "/permission/:permissionId/update",
  verifyToken,
  tryCatch(projectController.updatePermission),
);

router.get(
  "/team/:teamId",
  verifyToken,
  tryCatch(projectController.getTeamProjects),
);

router.post(
  "/:projectId/members",
  verifyToken,
  tryCatch(projectController.getProjectMembers),
);

router.patch(
  "/notification/all/mark-as-read",
  verifyToken,
  tryCatch(projectController.markNotificationAsRead),
);

router.patch(
  "/:projectId/reopen",
  verifyToken,
  validatePermission("project.id"),
  tryCatch(projectController.restoreProject),
);

router.delete(
  "/:projectId/delete",
  verifyToken,
  validatePermission("project.id"),
  tryCatch(projectController.deleteProject),
);

router.patch(
  "/:projectId/task/:taskId/reopen",
  verifyToken,
  validatePermission("project.task.id"),
  tryCatch(projectController.restoreClosedTask),
);

router.delete(
  "/:projectId/task/:taskId/delete",
  verifyToken,
  validatePermission("project.task.id"),
  tryCatch(projectController.deleteProject),
);

module.exports = router;
