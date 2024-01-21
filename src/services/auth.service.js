/* eslint-disable no-useless-catch */
const { User } = require("../models/sequelize.model");
const { Op } = require("sequelize");

module.exports = {
  /**
   * Create a new user in the database.
   * @param {Object} userData - The user data including username and password.
   * @returns {Promise<Object>} - A Promise that resolves to the created user.
   * @throws {Error} - Throws an error if validation fails.
   */
  doSignUp: async ({ username, email, password, picture }) => {
    try {
      return await User.create({ username, email, password, picture });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Find a user in the database based on the provided username.
   * @param {Object} userData - The user data including username.
   * @returns {Promise<Object>} - A Promise that resolves to the found user.
   * @throws {Error} - Throws an error if validation fails.
   */
  doSignIn: async ({ usernameOrEmail }) => {
    try {
      return await User.findOne({
        where: {
          [Op.or]: [
            {
              username: usernameOrEmail,
            },
            {
              email: usernameOrEmail,
            },
          ],
        },
      });
    } catch (error) {
      throw error;
    }
  },
};
