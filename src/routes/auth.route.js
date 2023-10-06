const express = require("express");

const route = express.Router();
const authController = require("../controllers/auth.controller");

// Define routes for user sign-up and sign-in using the authentication controller

// Route for user sign-up
route.post("/sign-up", authController.doSignUp);

// Route for user sign-in
route.post("/sign-in", authController.doSignIn);

// Route for get newToken
route.post("/token", authController.getNewAccessToken);

module.exports = route;
