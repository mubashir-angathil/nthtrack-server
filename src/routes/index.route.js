const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/auth.middleware");
const { tryCatch } = require("../utils/helpers/helpers");
const indexController = require("../controllers/index.controller");

/**
 * Route for retrieving user profile details. Requires a valid token for authentication.
 * POST /api/user/:userId/profile
 */
router.get(
  "/user/:userId/profile",
  verifyToken,
  tryCatch(indexController.getProfileDetails),
);

/**
 * Route for update user profile details. Requires a valid token for authentication.
 * POST /api/user/:userId/profile/update
 */
router.patch(
  "/user/:userId/profile/update",
  verifyToken,
  tryCatch(indexController.updateProfileDetails),
);

/**
 * Route for delete account. Requires a valid token for authentication.
 * POST /api/account/:userId/delete
 */
router.delete(
  "/account/:userId/delete",
  verifyToken,
  tryCatch(indexController.deleteAccount),
);

/**
 * Route for retrieving user notifications. Requires a valid token for authentication.
 * GET /api/user/notifications
 */
router.get(
  "/user/notifications",
  verifyToken,
  tryCatch(indexController.getNotifications),
);

/**
 * Route for mark notification as read initiation. Requires a valid token for authentication.
 * POST /api/user/notifications/read
 */
router.patch(
  "/user/notifications/read",
  verifyToken,
  tryCatch(indexController.markNotificationAsRead),
);

module.exports = router;
