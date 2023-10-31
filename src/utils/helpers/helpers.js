const { Sequelize } = require("../../models/sequelize.model");

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
            name: this.error.name || "Custom error",
            query: this.error.sql,
            fieldErrors: this.error.fieldErrors,
          },
        };
        return { data };
      },
    };

    const formattedError = Object.create(formattedErrorPrototype);

    if (Sequelize.ValidationError) {
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
};
