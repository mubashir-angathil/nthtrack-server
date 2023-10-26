const { User } = require("../models/sequelize.model");
const { formattedError } = require("../utils/helpers/helpers.js");

module.exports = {
  /**
   * Create a new user in the database.
   * @param {Object} userData - The user data including username and password.
   * @returns {Promise<Object>} - A Promise that resolves to the created user.
   * @throws {Error} - Throws an error if validation fails.
   */
  doSignUp: async ({ username, password }) => {
    try {
      const user = await User.create({ username, password });
      return user;
    } catch (error) {
      throw formattedError(error);
    }
  },

  /**
   * Find a user in the database based on the provided username.
   * @param {Object} userData - The user data including username.
   * @returns {Promise<Object>} - A Promise that resolves to the found user.
   * @throws {Error} - Throws an error if validation fails.
   */
  doSignIn: async ({ username }) => {
    try {
      const user = await User.findOne({ where: { username } });
      return user;
    } catch (error) {
      throw formattedError(error);
    }
  },
};
