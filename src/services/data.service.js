const { Tracker, Status } = require("../models/sequelize.model");
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
};
