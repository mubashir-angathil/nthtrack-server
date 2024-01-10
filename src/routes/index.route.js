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

module.exports = router;
