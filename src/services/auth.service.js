const { User } = require("../models/sequelize.model");
const { errorResponse } = require("../utils/helpers/helpers");

module.exports = {
  /**
   * Performs user sign-up.
   * @param {object} credentials - User credentials, including 'username' and 'password'.
   * @returns {Promise<object>} - A promise that resolves to the created user object.
   * @throws {object} - An error response object if the sign-up fails.
   */
  doSignUp: async ({ username, password }) => {
    try {
      // Create a new user in the database
      const user = await User.create({ username, password });
      return user;
    } catch (error) {
      // Handle validation errors and throw a formatted error response
      const { type, message, value } = error.errors[0];
      throw errorResponse(type, message, value);
    }
  },

  /**
   * Performs user sign-in.
   * @param {object} credentials - User credentials, including 'username'.
   * @returns {Promise<object|null>} - A promise that resolves to the user object if found, or null if not found.
   * @throws {object} - An error response object if the sign-in fails.
   */
  doSignIn: async ({ username }) => {
    try {
      // Find a user in the database based on the provided username
      const user = await User.findOne({
        where: { username },
      });

      return user;
    } catch (error) {
      // Handle validation errors and throw a formatted error response
      const { type, message, value } = error.errors[0];
      throw errorResponse(type, message, value);
    }
  },
};
