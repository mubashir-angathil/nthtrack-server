const { Tracker } = require("../models/sequelize.model");
const { formatError } = require("../utils/helpers/helpers");

module.exports = {
  /**
   * Retrieves a list of trackers from the database.
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
};
