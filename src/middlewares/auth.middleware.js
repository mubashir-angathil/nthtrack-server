const { authenticateJwtToken } = require("../utils/helpers/jwt.helper");
const { ACCESS_TOKEN_SECRET } = require("../configs/configs");
const { httpStatusCode } = require("../utils/constants/Constants");
let { permission } = require("../configs/permission/permission");
const { isPathPermissionIncluded } = require("../utils/helpers/helpers");
const projectService = require("../services/project.service");

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
    const user = authenticateJwtToken({
      token: accessToken.split(" ")[1],
      secret: ACCESS_TOKEN_SECRET,
    });

    if (user) {
      req.user = user;
    }

    // If the verification is successful, proceed to the next middleware or route
    next();
  } catch (err) {
    // If the token is expired or invalid, respond with unauthorized status and an error message
    res
      .status(401)
      .json({ message: "Token expired or invalid", error: err.name });
  }
};

const validatePermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      const projectId = req?.body?.projectId || req?.params?.projectId;
      const userId = req?.user?.id;

      if (projectId && userId) {
        const isAdmin = await projectService.checkIsAdmin({
          projectId,
          userId,
        });

        if (isAdmin) return next();

        const response = await projectService.getPermission({
          projectId,
          userId,
        });

        permission = response.permission.dataValues.json;
        const isPermitted = await isPathPermissionIncluded({
          permission,
          path: permissionKey,
          method: req.method,
        });

        if (!isPermitted) {
          console.log("error");
          return next({
            message: "Not permitted",
            httpCode: httpStatusCode.FORBIDDEN,
          });
        }

        return next();
      } else {
        return next({
          message: "Not permitted",
          httpCode: httpStatusCode.FORBIDDEN,
        });
      }
    } catch (error) {
      next({ message: "Not permitted", httpCode: httpStatusCode.FORBIDDEN });
    }
  };
};

module.exports = {
  verifyToken,
  validatePermission,
};
