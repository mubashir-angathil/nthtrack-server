const authService = require("../services/auth.service");
const {
  generateAccessToken,
  generateRefreshToken,
  authenticateJwtToken,
} = require("../utils/helpers/jwt.helper");
const { REFRESH_TOKEN_SECRET } = require("../configs/configs");
const { httpStatusCode } = require("../utils/constants/Constants");

module.exports = {
  /**
   * Handles user signup by extracting username and password from the request body.
   * Uses the authService to create a new user and responds with the result.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Object} - HTTP response with status and message.
   */
  doSignUp: async (req, res) => {
    const { username, password } = req.body;

    try {
      if (!username || !password) {
        throw new Error("Username or password is not provided");
      }

      // Call authService to create a new user
      const user = await authService.doSignUp({ username, password });

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
      return res.status(200).json({
        success: true,
        message: "Registration successful",
        authDetails,
      });
    } catch (error) {
      // Handle specific error scenarios
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          success: false,
          message: "Username or email is already in use",
          fieldErrors: {
            username: "Username or email is already in use",
          },
        });
      }

      // Respond with a generic error message
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  /**
   * Handles user sign-in by extracting username and password from the request body.
   * Uses the authService to find the user, validate the password, and generate an access token.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Object} - HTTP response with status, message, and user details.
   */
  doSignIn: async (req, res) => {
    const { username, password } = req.body;

    try {
      // Check if username or password is not provided
      if (!username || !password) {
        throw new Error("Username or password is not provided");
      }

      // Find the user by username
      const user = await authService.doSignIn({ username, password });

      // If user not found, respond with a 404 status
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found. Please register if you are a new user.",
          fieldErrors: {
            username: "User not found. Please register if you are a new user.",
          },
        });
      }

      // Compare the entered password with the hashed password in the database
      const isPasswordValid = await user.comparePassword(password);

      // If password is not valid, respond with a 401 status
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password. Please try again.",
          fieldErrors: {
            password: "Incorrect password. Please try again.",
          },
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
        authDetails,
      });
    } catch (error) {
      // Handle specific error scenarios
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          success: false,
          message: "Username or email is already in use",
          fieldErrors: {
            username: "Username or email is already in use",
          },
        });
      }

      // Respond with a generic error message
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
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
