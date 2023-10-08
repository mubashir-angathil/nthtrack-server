module.exports = {
  /**
   * Generates a formatted error response object.
   * @param {string} type - The type of error.
   * @param {string} message - The error message.
   * @param {any} value - The relevant value associated with the error.
   * @returns {object} - The formatted error response object.
   */
  errorResponse: (props) => {
    const formattedError = Object.create(props);
    return formattedError;
  },
  formattedError: (error) => {
    return {
      name: error.name,
      errors: error.errors.map(({ type, message }) => {
        return { type, message };
      }),
    };
  },
};
