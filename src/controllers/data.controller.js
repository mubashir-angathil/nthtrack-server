const dataService = require("../services/data.service");

/**
 * Retrieves a list of trackers and sends a JSON response based on the success of the operation.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves once the response is sent.
 */
module.exports = {
  getTrackers: async (req, res) => {
    try {
      const trackers = await dataService.getTrackers();

      if (!trackers) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to retrieve trackers." });
      }

      return res.json({ success: true, data: trackers });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error retrieving trackers.", error });
    }
  },
};
