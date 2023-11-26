const express = require("express");
const router = express.Router();

const dataController = require("../controllers/data.controller");
const {
  verifyToken,
  validatePermission,
} = require("../middlewares/auth.middleware");
const { tryCatch } = require("../utils/helpers/helpers");

/**
 * Route for retrieving trackers. Requires a valid token for authentication.
 * GET /api/trackers
 */
router.get("/trackers", verifyToken, dataController.getTrackers);

/**
 * Route for retrieving statuses. Requires a valid token for authentication.
 * GET /api/statuses
 */
router.get("/statuses", verifyToken, dataController.getStatuses);

router.get("/teams", verifyToken, tryCatch(dataController.getMemberTeams));
router.get(
  "/permissions",
  verifyToken,
  tryCatch(dataController.getPermissions),
);

router.get(
  "/project/:projectId/members",
  verifyToken,
  tryCatch(dataController.getProjectMembers),
);
router.get(
  "/project/:projectId/task/:taskId",
  verifyToken,
  validatePermission("project.member.all"),
  tryCatch(dataController.getTaskAssignees),
);
module.exports = router;
