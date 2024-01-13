const indexServices = require("../services/index.services");
const { httpStatusCode } = require("../utils/constants/Constants");
const helpers = require("../utils/helpers/helpers");

module.exports = {
  /**
   * Creates a new permission and sends a JSON response based on the success of the operation.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  createPermission: async (req, res, next) => {
    // Extract relevant information from the request body
    const { name, json } = req.body;

    // Attempt to create a new permission using the project service
    const response = await indexServices.createPermission({ name, json });

    // Check if the permission was successfully created
    if (response) {
      // Send a successful response if the permission is created
      return res.status(httpStatusCode.CREATED).json({
        success: true,
        message: "Permission created successfully",
      });
    }

    // If the permission is not created, send an error response
    throw next({ message: "Permission creation failed" });
  },

  /**
   * Controller for updating a permission by ID.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  updatePermission: async (req, res, next) => {
    const { name, json } = req.body;
    const { permissionId } = req.params;

    // Call the project service to update an existing permission
    const updatedPermission = await indexServices.updatePermission({
      name,
      json,
      permissionId,
    });

    // Check if the permission update was successful
    if (updatedPermission) {
      // Respond with success and information about the update
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Successfully updated permission details.",
        data: [{ updated: Boolean(updatedPermission) }],
      });
    }

    // If the permission update fails, send an error response
    throw next({ message: "Failed to update the permission." });
  },

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

  /**
   * Updating profile details.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} - Asynchronous function.
   */
  updateProfileDetails: async (req, res, next) => {
    // Extract user ID from request
    const { userId } = req.params;
    const { username } = req.body;

    const profile = await indexServices.updateProfileDetails({
      userId,
      username,
    });

    if (!profile) {
      throw next({ message: "Failed to update the profile details" });
    }

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Profile details updated successfully",
    });
  },

  /**
   * Delete account permanently.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} - Asynchronous function.
   */
  deleteAccount: async (req, res, next) => {
    // Extract user ID from request
    const { userId } = req.params;

    const profile = await indexServices.deleteAccount({
      userId,
    });

    if (!profile) {
      throw next({
        message: `Encountered an issue while attempting to permanently delete the account.
         Unfortunately, the operation was not successful.
          Apologies for any inconvenience caused.
           Please reach out to our support team for further assistance.
            Thank you for your understanding.`,
      });
    }

    return res.status(httpStatusCode.OK).json({
      success: true,
      message:
        "Your account has been successfully deleted. We appreciate your time with us and hope you consider rejoining in the future.",
    });
  },

  /**
   * Retrieves notifications based on roomIds, user ID, pagination parameters.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - Asynchronous function.
   */
  getNotifications: async (req, res, next) => {
    // Extract parameters from the query string
    const { page, limit, type } = req.query;

    // Calculate pagination based on provided page and limit
    const pagination = await helpers.getCurrentPagination({ page, limit });

    // Retrieve notifications based on parameters
    const notifications = await indexServices.getNotifications({
      type,
      userId: req.user.id, // Assuming user ID is stored in req.user
      offset: pagination.offset,
      limit: pagination.limit,
    });

    // Check if notifications were successfully retrieved
    if (!notifications) {
      // If notifications are empty, throw an error to be handled by the error middleware
      throw next({ message: "Notifications are empty." });
    }

    // Send a success response with notification data and pagination information
    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Notifications retrieved successfully.",
      data: notifications.rows,
      totalRows: notifications.count,
    });
  },

  /**
   * Marks notifications as read for the authenticated user.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} - Asynchronous function.
   */
  markNotificationAsRead: async (req, res, next) => {
    // Extract notificationId from the request body
    const { notificationId } = req.body;
    const userId = parseInt(req.user.id);

    // Call the service to update notifications as read
    const [markAsRead] = await indexServices.updateNotification({
      notificationId,
      userId,
    });

    // Send a success response if notifications are marked as read
    if (markAsRead) {
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Notifications marked as read successfully.",
      });
    }

    // If marking as read fails, trigger the error handler
    throw next({ message: "Failed to mark notifications as read." });
  },
};
