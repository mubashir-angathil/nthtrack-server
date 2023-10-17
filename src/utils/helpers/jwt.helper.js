const jwt = require("jsonwebtoken"); // Import the jsonwebtoken library
const {
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET,
} = require("../../configs/configs");

module.exports = {
  /**
   * Generates an access token using the provided user information.
   * @param {object} user - The user object containing 'id' and 'username'.
   * @returns {string} - The generated access token.
   */
  generateAccessToken: ({ id, username }) =>
    // Sign the user information with the access token secret and set expiration time
    jwt.sign({ id, username }, ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    }),
  /**
   * Generates a refresh token using the provided user information.
   * @param {object} user - The user object containing 'id' and 'username'.
   * @returns {string} - The generated refresh token.
   */
  generateRefreshToken: ({ id, username }) =>
    // Sign the user information with the refresh token secret and set expiration time
    jwt.sign({ id, username }, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    }),
  /**
   * Authenticates a JWT token using the provided token and secret.
   * @param {object} params - Object containing 'token' and 'secret'.
   * @param {string} params.token - The JWT token to be authenticated.
   * @param {string} params.secret - The secret used for token verification.
   * @returns {object} - The decoded user information if the token is valid.
   * @throws {Error} - If the token is invalid or expired.
   */
  authenticateJwtToken: ({ token, secret }) =>
    // Verify the token using the provided secret and return the decoded information
    jwt.verify(token, secret),
};
