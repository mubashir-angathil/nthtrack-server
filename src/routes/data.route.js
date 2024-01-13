const express = require("express");
const router = express.Router();
const dataController = require("../controllers/data.controller");
const {
  verifyToken,
  validatePermission,
} = require("../middlewares/auth.middleware");

const { tryCatch } = require("../utils/helpers/helpers");

/**
 * Route for retrieving labels. Requires a valid token for authentication.
 * GET /api/project/:projectId/labels
 */
router.post(
  "/project/:projectId/labels",
  verifyToken,
  tryCatch(dataController.getLabels),
);

/**
 * Route for retrieving statuses. Requires a valid token for authentication.
 * GET /api/project/:projectId/statuses
 */
router.get(
  "/project/:projectId/statuses",
  verifyToken,
  tryCatch(dataController.getTaskCategoriesByProjectId),
);

/**
 * Route for retrieving users. Requires a valid token for authentication.
 * POST /api/users
 */
router.post("/users", verifyToken, tryCatch(dataController.getUsers));

/**
 * Route for retrieving member teams. Requires a valid token for authentication.
 * GET /api/teams
 */
router.get("/teams", verifyToken, tryCatch(dataController.getMemberTeams));

/**
 * Route for retrieving permissions. Requires a valid token for authentication.
 * GET /api/permissions
 */
router.get(
  "/permissions",
  verifyToken,
  tryCatch(dataController.getPermissions),
);

/**
 * Route for retrieving project members. Requires a valid token for authentication.
 * GET /api/project/:projectId/members
 */
router.get(
  "/project/:projectId/members",
  verifyToken,
  tryCatch(dataController.getProjectMembers),
);

/**
 * Route for retrieving task assignees within a project. Requires a valid token and appropriate permissions.
 * GET /api/project/:projectId/task/:taskId
 */
router.get(
  "/project/:projectId/task/:taskId",
  verifyToken,
  validatePermission("project.member.all"),
  tryCatch(dataController.getTaskAssignees),
);

/**
 * Route for retrieving enrolled project IDs for a user. Requires a valid token for authentication.
 * GET /api/team/project/all
 */
router.get(
  "/team/project/all",
  verifyToken,
  tryCatch(dataController.getEnrolledProjectIds),
);

module.exports = router;
