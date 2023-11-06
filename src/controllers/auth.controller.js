const authService = require("../services/auth.service");
const {
  generateAccessToken,
  generateRefreshToken,
  authenticateJwtToken,
} = require("../utils/helpers/jwt.helper");
const { REFRESH_TOKEN_SECRET } = require("../configs/configs");
const { httpStatusCode } = require("../utils/constants/Constants");
const { ValidationError } = require("sequelize");

module.exports = {
  /**
   * Handles user signup by extracting username and password from the request body.
   * Uses the authService to create a new user and responds with the result.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Object} - HTTP response with status and message.
   */
  doSignUp: async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
      next({ message: "Username or password is not provided" });
    }

    // Call authService to create a new user
    const user = await authService.doSignUp({ username, password });

    if (!user) {
      return next({
        message: "Registration failed due to invalid input",
      });
    }

    // Generate an access token and refresh token for the authenticated user
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken({ id: user.id, username: user.username }),
      generateRefreshToken({ id: user.id, username: user.username }),
    ]);

    const authDetails = {
      id: user.id,
      username,
      accessToken,
      refreshToken,
    };

    // Respond with a success message and the created user
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: authDetails,
    });
  },

  /**
   * Handles user sign-in by extracting username and password from the request body.
   * Uses the authService to find the user, validate the password, and generate an access token.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Object} - HTTP response with status, message, and user details.
   */
  doSignIn: async (req, res, next) => {
    const { username, password } = req.body;

    // Check if username or password is not provided
    if (!username || !password) {
      return next({ message: "Username or password is not provided" });
    }

    // Find the user by username
    const user = await authService.doSignIn({ username, password });

    // If user not found, respond with a 404 status
    if (!user) {
      throw new ValidationError({
        message: "User not found. Please register if you are a new user.",
        errors: [
          {
            path: "username",
            message: "Username not found.",
          },
        ],
      });
    }

    // Compare the entered password with the hashed password in the database
    const isPasswordValid = await user.comparePassword(password);

    // If password is not valid, respond with a 401 status
    if (!isPasswordValid) {
      throw new ValidationError({
        message: "Incorrect password. Please try again.",
        errors: [
          {
            path: "password",
            message: "Incorrect password",
          },
        ],
      });
    }

    // Generate an access token and refresh token for the authenticated user
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken({ id: user.id, username: user.username }),
      generateRefreshToken({ id: user.id, username: user.username }),
    ]);

    const authDetails = {
      id: user.id,
      username,
      accessToken,
      refreshToken,
    };

    // User is authenticated, respond with success message and user details
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: authDetails,
    });
  },

  /**
   * Refreshes the access token using a provided refresh token.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Object} - HTTP response with a new access token.
   */
  getNewAccessToken: (req, res, next) => {
    const { refreshToken } = req.body;

    // Authenticate the refresh token and extract user information
    const user = authenticateJwtToken({
      token: refreshToken,
      secret: REFRESH_TOKEN_SECRET,
    });

    // Generate a new access token
    const newAccessToken = generateAccessToken({
      id: user.id,
      username: user.username,
    });

    if (newAccessToken) {
      // Respond with the new access token
      res.status(httpStatusCode.OK).json({
        success: true,
        message: "Authentication successful.",
        accessToken: newAccessToken,
      });
    } else {
      throw next({
        httpCode: httpStatusCode.UNAUTHORIZED,
        message: "Authentication failed. Please login again",
      });
    }
  },
};
