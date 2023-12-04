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
  tryCatch: (controller) => async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  },
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
  isArrayUnique: (arr) => {
    // Create a Set from the array, removing duplicates
    const uniqueSet = new Set(arr);

    // If the size of the Set is equal to the length of the array, all elements are unique
    return uniqueSet.size === arr.length;
  },
  validateIsUserAddAsSuperAdmin: async ({
    projectId,
    userId,
    permissionId,
    next,
  }) => {
    // Retrieve the project by ID
    const project = await projectService.getProjectById({ projectId });

    // Check if the user being added is an admin of the project
    const isAdmin = await project.checkIsAdmin(userId);

    // Retrieve the "Super Admin" permission
    const superAdminPermission = await projectService.getPermissionByName({
      permission: "Super Admin",
    });

    // If the user is an admin but not adding as super admin, disallow the operation
    if (isAdmin && superAdminPermission.id !== permissionId) {
      throw next({
        message: "This user is an admin of the project! Add as a super admin.",
        httpCode: httpStatusCode.BAD_REQUEST,
      });
    }

    // If the user is not an admin and adding as super admin, disallow the operation
    if (!isAdmin && superAdminPermission.id === permissionId) {
      throw next({
        message: "Can't add multiple super admins",
        httpCode: httpStatusCode.BAD_REQUEST,
      });
    }

    // Return the project if validation is successful
    return project;
  },
};
