const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { tryCatch } = require("../utils/helpers/helpers");

/**
 * Route for user sign-up.
 * POST /api/auth/sign-up
 */
router.post("/sign-up", authController.doSignUp);

/**
 * Route for user login.
 * POST /api/auth/login
 */
router.post("/login", tryCatch(authController.doSignIn));

/**
 * Route for obtaining a new access token.
 * POST /api/auth/token
 */
router.post("/token", tryCatch(authController.getNewAccessToken));

module.exports = router;
