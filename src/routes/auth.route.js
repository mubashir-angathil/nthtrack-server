const express = require("express");

const router = express.Router();
const authController = require("../controllers/auth.controller");
const { tryCatch } = require("../utils/helpers/helpers");

/**
 * Express route for user sign-up.
 * @name POST /api/auth/sign-up
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} controller - Controller function to handle the request.
 */
router.post("/sign-up", authController.doSignUp);

/**
 * Express route for user sign-in.
 * @name POST /api/auth/sign-in
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} controller - Controller function to handle the request.
 */
router.post("/login", tryCatch(authController.doSignIn));

/**
 * Express route for obtaining a new access token using a refresh token.
 * @name POST /api/auth/token
 * @function
 * @memberof module:routes
 * @inner
 * @param {string} path - Express route path.
 * @param {Function} controller - Controller function to handle the request.
 */
router.post("/token", tryCatch(authController.getNewAccessToken));

module.exports = router;
