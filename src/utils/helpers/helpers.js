module.exports = {
  /**
   * A function to format a Sequelize SQL error for consistent error handling.
   * @param {Error} error - The original error object.
   * @returns {Object} - A formatted error object containing name, message, and SQL error details.
   */
  formattedError: (error) => {
    // Create a formatted error object with specific properties
    return {
      name: error?.name, // Extract the error name (e.g., SequelizeDatabaseError)
      message: error?.message, // Extract the error message
      query: error?.sql, // Extract the SQL-related error details (if available)
    };
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
};
