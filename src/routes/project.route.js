const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");
const {
  verifyToken,
  validatePermission,
} = require("../middlewares/auth.middleware");
const { tryCatch } = require("../utils/helpers/helpers");

/**
 * Route for creating a new project. Requires a valid token for authentication.
 * POST /api/project/create
 */
router.post("/create", verifyToken, tryCatch(projectController.createProject));

/**
 * Route for updating an existing project. Requires a valid token and specific project permissions.
 * PATCH /api/project/update
 */
router.patch(
  "/update",
  verifyToken,
  validatePermission("project.id"),
  tryCatch(projectController.updateProject),
);

/**
 * Route for retrieving all projects. Requires a valid token for authentication.
 * GET /api/project/all
 */
router.get("/all", verifyToken, tryCatch(projectController.getAllProjects));

/**
 * Route for retrieving a specific project by its ID. Requires a valid token and specific project permissions.
 * GET /api/project/:projectId
 */
router.get(
  "/:projectId",
  verifyToken,
  validatePermission("project.id"),
  tryCatch(projectController.getProjectById),
);

/**
 * Route for closing a specific project. Requires a valid token and specific project permissions.
 * DELETE /api/project/:projectId/close
 */
router.delete(
  "/:projectId/close",
  verifyToken,
  validatePermission("project.id"),
  tryCatch(projectController.closeProjectById),
);
/**
 * Route for creating a new task within a project. Requires a valid token and specific project task permissions.
 * POST /api/project/:projectId/task/create
 */
router.post(
  "/:projectId/task/create",
  verifyToken,
  validatePermission("project.task.id"),
  tryCatch(projectController.createTask),
);

/**
 * Route for updating an existing task within a project. Requires a valid token and specific project permissions.
 * PATCH /api/project/:projectId/task/update
 */
router.patch(
  "/:projectId/task/update",
  verifyToken,
  validatePermission("project.id"),
  tryCatch(projectController.updateTask),
);

/**
 * Route for retrieving all tasks within a project. Requires a valid token and specific project task permissions.
 * GET /api/project/:projectId/task/all
 */
router.get(
  "/:projectId/task/all",
  verifyToken,
  validatePermission("project.task.all"),
  tryCatch(projectController.getAllTasks),
);

/**
 * Route for retrieving a specific task within a project by its ID. Requires a valid token and specific project task permissions.
 * GET /api/project/:projectId/task/:taskId
 */
router.get(
  "/:projectId/task/:taskId",
  verifyToken,
  validatePermission("project.task.id"),
  tryCatch(projectController.getTaskById),
);

/**
 * Route for closing a specific task within a project. Requires a valid token and specific project task permissions.
 * DELETE /api/project/:projectId/task/:taskId/close
 */
router.delete(
  "/:projectId/task/:taskId/close",
  verifyToken,
  validatePermission("project.task.id"),
  tryCatch(projectController.closeTaskById),
);

/**
 * Route for adding a member to a project. Requires a valid token and specific project member permissions.
 * POST /api/project/:projectId/member/add
 */
router.post(
  "/:projectId/member/add",
  verifyToken,
  validatePermission("project.member.id"),
  tryCatch(projectController.addMember),
);

/**
 * Route for updating a member within a project. Requires a valid token and specific project member permissions.
 * PUT /api/project/:projectId/member/update
 */
router.put(
  "/:projectId/member/update",
  verifyToken,
  validatePermission("project.member.id"),
  tryCatch(projectController.updateMember),
);

/**
 * Route for removing a member from a project. Requires a valid token and specific project member permissions.
 * DELETE /api/project/:projectId/member/:memberId/delete
 */
router.delete(
  "/:projectId/member/:memberId/delete",
  verifyToken,
  validatePermission("project.member.id"),
  tryCatch(projectController.removeMember),
);

/**
 * Route for creating a new permission. Requires a valid token.
 * POST /api/project/permission/create
 */
router.post(
  "/permission/create",
  verifyToken,
  tryCatch(projectController.createPermission),
);

/**
 * Route for updating an existing permission. Requires a valid token.
 * PATCH /api/project/permission/:permissionId/update
 */
router.patch(
  "/permission/:permissionId/update",
  verifyToken,
  tryCatch(projectController.updatePermission),
);

/**
 * Route for retrieving projects associated with a specific team. Requires a valid token.
 * GET /api/project/team/:teamId
 */
router.get(
  "/team/:teamId",
  verifyToken,
  tryCatch(projectController.getTeamProjects),
);

/**
 * Route for retrieving project members. Requires a valid token.
 * POST /api/project/:projectId/members
 */
router.post(
  "/:projectId/members",
  verifyToken,
  tryCatch(projectController.getProjectMembers),
);

/**
 * Route for reopening a closed project. Requires a valid token and specific project permissions.
 * PATCH /api/project/:projectId/reopen
 */
router.patch(
  "/:projectId/reopen",
  verifyToken,
  validatePermission("project.id"),
  tryCatch(projectController.restoreProject),
);

/**
 * Route for deleting a project. Requires a valid token and specific project permissions.
 * DELETE /api/project/:projectId/delete
 */
router.delete(
  "/:projectId/delete",
  verifyToken,
  validatePermission("project.id"),
  tryCatch(projectController.deleteProject),
);

/**
 * Route for reopening a closed task within a project. Requires a valid token and specific task permissions.
 * PATCH /api/project/:projectId/task/:taskId/reopen
 */
router.patch(
  "/:projectId/task/:taskId/reopen",
  verifyToken,
  validatePermission("project.task.id"),
  tryCatch(projectController.restoreClosedTask),
);

/**
 * Route for deleting a task within a project. Requires a valid token and specific task permissions.
 * DELETE /api/project/:projectId/task/:taskId/delete
 */
router.delete(
  "/:projectId/task/:taskId/delete",
  verifyToken,
  validatePermission("project.task.id"),
  tryCatch(projectController.deleteTask),
);

/**
 * Route for get all labels. Requires a valid token for authentication.
 * POST /api/project/:projectId/labels
 */
router.post(
  "/:projectId/labels",
  verifyToken,
  tryCatch(projectController.getAllProjectLabels),
);

/**
 * Route for get all status. Requires a valid token for authentication.
 * POST /api/project/:projectId/labels
 */
router.post(
  "/:projectId/statuses",
  verifyToken,
  tryCatch(projectController.getAllProjectStatuses),
);

/**
 * Route for creating a new label. Requires a valid token for authentication.
 * POST /api/project/:projectId/label/create
 */
router.post(
  "/:projectId/label/create",
  verifyToken,
  tryCatch(projectController.createLabel),
);

/**
 * Route for creating a new status. Requires a valid token for authentication.
 * POST /api/project/:projectId/label/create
 */
router.post(
  "/:projectId/status/create",
  verifyToken,
  tryCatch(projectController.createStatus),
);

/**
 * Route for deleting status. Requires a valid token for authentication.
 * POST /api/project/:projectId/status/:statusId/delete
 */
router.delete(
  "/:projectId/status/:statusId/delete",
  verifyToken,
  tryCatch(projectController.deleteStatus),
);

/**
 * Route for deleting label. Requires a valid token for authentication.
 * POST /api/project/:projectId/label/:labelId/delete
 */
router.delete(
  "/:projectId/label/:labelId/delete",
  verifyToken,
  tryCatch(projectController.deleteLabel),
);

/**
 * Route for updating status. Requires a valid token for authentication.
 * POST /api/project/:projectId/status/:statusId/update
 */
router.patch(
  "/:projectId/status/:statusId/update",
  verifyToken,
  tryCatch(projectController.updateStatus),
);
/**
 * Route for updating label. Requires a valid token for authentication.
 * POST /api/project/:projectId/label/update
 */
router.patch(
  "/:projectId/label/:labelId/update",
  verifyToken,
  tryCatch(projectController.updateLabel),
);

/**
 * Route for accept initiation. Requires a valid token for authentication.
 * POST /api/project/:projectId/invitation/accept
 */
router.patch(
  "/:projectId/invitation/accept",
  verifyToken,
  tryCatch(projectController.acceptProjectInvitation),
);

/**
 * Route for accept initiation. Requires a valid token for authentication.
 * POST /api/project/:projectId/invitation/reject
 */
router.patch(
  "/:projectId/invitation/reject",
  verifyToken,
  tryCatch(projectController.rejectProjectInvitation),
);

module.exports = router;
