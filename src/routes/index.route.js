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

module.exports = router;
