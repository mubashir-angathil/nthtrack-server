const indexServices = require("../services/index.services");
const { httpStatusCode } = require("../utils/constants/Constants");

module.exports = {
  /**
   * Retrieves profile details.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} - Asynchronous function.
   */
  getProfileDetails: async (req, res, next) => {
    // Extract user ID from request
    const { userId } = req.params;

    const profile = await indexServices.getProfileDetails({ userId });

    if (!profile) {
      throw next({ message: "Profile details fetching failed" });
    }

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Profile details retrieved successfully",
      data: profile,
    });
  },
};
