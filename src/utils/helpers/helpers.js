const { Sequelize } = require("../../models/sequelize.model");
const projectService = require("../../services/project.service");
const { httpStatusCode } = require("../constants/Constants");

module.exports = {
  /**
   * A function to format a Sequelize SQL error for consistent error handling.
   * @param {Error} error - The original error object.
   * @returns {Object} - A formatted error object containing name, message, and SQL error details.
   */
  formattedError: (error) => {
    const formattedErrorPrototype = {
      getError: function () {
        const data = {
          success: false,
          message: this.error.message || "Something went wrong",
          error: {
            name: this.error.name || "Error",
            query: this.error.sql,
            fieldErrors: this.error.fieldErrors,
          },
        };
        return { data };
      },
    };
    const formattedError = Object.create(formattedErrorPrototype);

    if (error instanceof Sequelize.ValidationError) {
      formattedError.error = {
        message: error.message,
        query: error,
        name: error.name,
      };
      if (error?.errors) {
        formattedError.error.fieldErrors = [];

        error.errors.forEach((item) => {
          const fieldError = {
            field: item.path,
            message: item.message,
          };
          formattedError.error.fieldErrors.push(fieldError);
        });
      }
      return formattedError.getError();
    } else {
      formattedError.error = {
        message: error.message,
      };
    }

    return formattedError.getError();
  },

  /**
   * Get pagination options based on the provided page and limit values.
   * @param {Object} options - Pagination options.
   * @param {number} options.page - The current page.
   * @param {number} options.limit - The number of items per page.
   * @returns {Object} - Pagination configuration with offset and limit.
   */
  getCurrentPagination: ({ page, limit }) => {
    // Check if both page and limit are provided
    if (page && limit) {
      // Parse page and limit to integers
      page = parseInt(page);
      limit = parseInt(limit);

      // Calculate offset based on page and limit
      const pagination = {
        offset: (page - 1) * limit,
        limit,
      };
      return pagination;
    } else {
      // If either page or limit is not provided, set default values
      return {
        offset: page ? parseInt(page) : 0,
        limit: limit ? parseInt(limit) : undefined,
      };
    }
  },

  /**
   * Wraps a controller function with a try-catch block for structured error handling.
   * @function tryCatch
   * @param {Function} controller - The controller function to be wrapped.
   * @returns {Function} - The wrapped controller function.
   */
  tryCatch: (controller) => async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Checks if a specific permission is included in the path based on the HTTP method.
   * @function isPathPermissionIncluded
   * @param {Object} options - The options containing permission, path, and method.
   * @returns {boolean} - Returns true if the permission is included, false otherwise.
   */
  isPathPermissionIncluded: async ({ permission, path, method }) => {
    const keys = path.split(".");
    let current = permission;
    for (const key of keys) {
      if (!current[key]) {
        return false;
      }

      current = current[key];
    }
    return current[method === "PATCH" ? "PUT" : method] === true;
  },

  /**
   * Checks if an array contains only unique elements.
   * @function isArrayUnique
   * @param {Array} arr - The array to be checked for uniqueness.
   * @returns {boolean} - Returns true if all elements are unique, false otherwise.
   */
  isArrayUnique: (arr) => {
    const uniqueSet = new Set(arr);
    return uniqueSet.size === arr.length;
  },

  /**
   * Validates whether a user can be added as a super admin based on project, user, and permission information.
   * @function validateIsUserAddAsSuperAdmin
   * @param {Object} options - The options containing projectId, userId, permissionId, and next.
   * @throws {Error} - Throws an error with specific messages and HTTP codes based on validation results.
   * @returns {Object} - Returns the project if validation is successful.
   */
  validateIsUserAddAsSuperAdmin: async ({
    projectId,
    userId,
    permissionId,
    next,
  }) => {
    const project = await projectService.getProjectById({ projectId });
    const isAdmin = await project.checkIsAdmin(userId);
    const superAdminPermission = await projectService.getPermissionByName({
      permission: "Super Admin",
    });

    if (isAdmin && superAdminPermission.id !== permissionId) {
      throw next({
        message: "This user is an admin of the project! Add as a super admin.",
        httpCode: httpStatusCode.BAD_REQUEST,
      });
    }

    if (!isAdmin && superAdminPermission.id === permissionId) {
      throw next({
        message: "Can't add multiple super admins",
        httpCode: httpStatusCode.BAD_REQUEST,
      });
    }

    return project;
  },
};
