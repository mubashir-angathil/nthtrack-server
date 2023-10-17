const { authenticateJwtToken } = require("../utils/helpers/jwt.helper");
const { ACCESS_TOKEN_SECRET } = require("../configs/configs");

/**
 * Middleware to verify the authenticity of an access token.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 * @returns {void}
 */
const verifyToken = (req, res, next) => {
  // Extract the access token from the authorization header
  const accessToken = req.headers.authorization;

  // If the access token is not provided, respond with unauthorized status
  if (accessToken === undefined) {
    return res.sendStatus(401);
  }

  try {
    // Verify the access token using the specified secret
    authenticateJwtToken({
      token: accessToken.split(" ")[1],
      secret: ACCESS_TOKEN_SECRET,
    });

    // If the verification is successful, proceed to the next middleware or route
    next();
  } catch (err) {
    // If the token is expired or invalid, respond with unauthorized status and an error message
    res
      .status(401)
      .json({ message: "Token expired or invalid", error: err.name });
  }
};

module.exports = verifyToken;
