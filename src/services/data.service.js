/* eslint-disable no-useless-catch */
const { Tracker, Status, Member, User } = require("../models/sequelize.model");
const { formatError } = require("../utils/helpers/helpers");

module.exports = {
  /**
   * Retrieves a list of tracker from the database.
   *
   * @returns {Promise<Array>} An array of tracker objects containing 'id' and 'name' attributes.
   * @throws {Error} Throws a formatted error if the operation encounters any issues.
   */
  getTrackers: async () => {
    try {
      const trackers = await Tracker.findAll({
        attributes: ["id", "name"],
      });
      return trackers;
    } catch (error) {
      throw formatError(error);
    }
  },
  /**
   * Retrieves a list of status from the database.
   *
   * @returns {Promise<Array>} An array of status objects containing 'id' and 'name' attributes.
   * @throws {Error} Throws a formatted error if the operation encounters any issues.
   */
  getStatuses: async () => {
    try {
      const statuses = await Status.findAll({
        attributes: ["id", "name"],
      });
      return statuses;
    } catch (error) {
      throw formatError(error);
    }
  },
  getMemberTeams: async ({ userId }) => {
    try {
      const teams = await Member.findAll({
        where: {
          userId,
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username"],
          },
        ],
        attributes: ["id"],
      });
      // Use a Map to store unique users based on their IDs
      const uniqueUsersMap = new Map();

      // Iterate through teams and add unique users to the map
      teams.forEach((team) => {
        const user = team.user;

        // Use user ID as the key in the Map to ensure uniqueness
        uniqueUsersMap.set(user.id, user);
      });

      // Convert the Map values to an array
      const uniqueUsersArray = Array.from(uniqueUsersMap.values());

      return uniqueUsersArray;
    } catch (error) {
      throw error;
    }
  },
};
