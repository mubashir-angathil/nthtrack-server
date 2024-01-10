/* eslint-disable no-useless-catch */
const { User, sequelize } = require("../models/sequelize.model");
module.exports = {
  /**
   * Function to get profile details.
   *
   * @param {Object} {userId} - userId.
   * @returns {Promise<Array>} - A promise resolving to an array of projects.
   * @throws {Object} - Throws a error in case of failure.
   */
  getProfileDetails: ({ userId }) => {
    try {
      const profile = User.findOne({
        where: { id: userId },
        attributes: {
          exclude: ["password", "updatedAt"],
          include: [
            [
              sequelize.literal(
                "(SELECT COUNT(id) FROM projects WHERE projects.createdBy = User.id)",
              ),
              "totalProjects",
            ],
            [
              sequelize.literal(
                "(SELECT COUNT(id) FROM members WHERE members.projectId NOT IN (SELECT projectId FROM projects WHERE projects.createdBy = User.id))",
              ),
              "totalContributedProjects",
            ],
          ],
        },
      });
      return profile;
    } catch (error) {
      throw error;
    }
  },
  /**
   * Function to update profile details.
   *
   * @param {Object} Options - Options including the userId, and username.
   * @returns {Promise<Array>} - A promise resolving to an array of projects.
   * @throws {Object} - Throws a error in case of failure.
   */
  updateProfileDetails: ({ userId, username }) => {
    try {
      const profile = User.update(
        { username },
        {
          where: { id: userId },
        },
      );
      return profile;
    } catch (error) {
      throw error;
    }
  },
};
