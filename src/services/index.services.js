/* eslint-disable no-useless-catch */
const { Op } = require("sequelize");
const {
  User,
  sequelize,
  Notification,
  Permission,
} = require("../models/sequelize.model");

module.exports = {
  /**
   * Create a new permission.
   *
   * @param {Object} param - Parameters for creating a permission.
   * @param {string} param.name - The name of the permission.
   * @param {string} param.json - The JSON representation of the permission.
   * @returns {Promise<Object>} A promise that resolves with the created permission.
   * @throws Will throw an error if there's an issue with the operation.
   */
  createPermission: async ({ name, json }) => {
    try {
      const response = await Permission.create({ name, json });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Retrieves a permission by its name.
   * @param {Object} options - The options object.
   * @param {string} options.permission - The name of the permission to retrieve.
   * @returns {Promise<Permission | null>} - A promise resolving to the retrieved permission or null if not found.
   * @throws {Error} - Throws an error if the retrieval fails.
   */
  getPermissionByName: async ({ permission }) => {
    try {
      // Use Sequelize's findOne method to retrieve a permission by its name
      const retrievedPermission = await Permission.findOne({
        where: { name: permission },
      });

      // Return the retrieved permission or null if not found
      return retrievedPermission;
    } catch (error) {
      // If an error occurs during the retrieval process, throw the error
      throw error;
    }
  },

  /**
   * Update permission details by ID.
   *
   * @param {Object} param - Parameters for updating permission details.
   * @param {string} param.permissionId - The ID of the permission.
   * @param {string} param.name - The new name for the permission.
   * @param {string} param.json - The new JSON representation for the permission.
   * @returns {Promise<number>} A promise that resolves with the number of updated permissions.
   * @throws Will throw an error if there's an issue with the operation.
   */
  updatePermission: async ({ permissionId, name, json }) => {
    try {
      // Use Sequelize model to update an existing permission
      const [updatedPermission] = await Permission.update(
        {
          name,
          json,
        },
        {
          where: { id: permissionId },
        },
      );
      return updatedPermission;
    } catch (error) {
      // Handle errors and format the error message
      throw error;
    }
  },

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
                "(SELECT COUNT(id) FROM members WHERE members.userId = User.id AND members.status != 'Pending' AND members.projectId NOT IN (SELECT id from projects WHERE projects.createdBy = User.id))",
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
  /**
   * Function to delete the account.
   *
   * @param {Object} Options - Options including the userId.
   * @returns {Promise<Array>} - A promise resolving to an array of projects.
   * @throws {Object} - Throws a error in case of failure.
   */
  deleteAccount: ({ userId }) => {
    try {
      const profile = User.destroy({
        where: { id: userId },
      });
      return profile;
    } catch (error) {
      throw error;
    }
  },
  /**
   * Creates a new notification in the database.
   * @param {Object} options - Object containing message, broadcastId, and createdBy.
   * @returns {Promise<Object>} - A promise resolving to the created notification.
   * @throws {Error} - Throws an error if the creation fails.
   */
  createNotification: async ({
    type,
    content,
    broadcastIds,
    author,
    projectId,
  }) => {
    try {
      // Use Sequelize's create method to add a new notification to the database
      const notification = await Notification.create({
        type,
        content,
        broadcastIds,
        authorId: author,
        projectId,
      });

      // Return the created notification
      return notification;
    } catch (error) {
      // If an error occurs during the creation process, throw the error
      throw error;
    }
  },
  /**
   * Retrieves notifications based on roomIds and userId, with optional pagination.
   * @param {Object} options - Object containing roomIds, userId, offset, and limit.
   * @returns {Promise<Object>} - A promise resolving to an object with notification data and count.
   * @throws {Error} - Throws an error if the operation fails.
   */
  getNotifications: async ({ type, userId, offset, limit, unread }) => {
    try {
      const whereClause = type && { type };
      const unreadNotifications = unread && {
        readersIds: sequelize.literal(
          `NOT JSON_CONTAINS(readersIds, '${userId}')`,
        ),
      };
      // Use Sequelize's findAndCountAll to get paginated notification data
      const notificationsData = await Notification.findAndCountAll({
        offset,
        limit,
        where: {
          // Construct a WHERE clause based on roomIds and userId
          // author: [...roomIds, userId],
          ...whereClause,
          ...unreadNotifications,
          broadcastIds: sequelize.literal(
            `JSON_CONTAINS(broadcastIds, '${userId}')`,
          ),
        },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "email"],
          },
        ],
        attributes: {
          exclude: ["authorId"],
        },
        order: [["createdAt", "DESC"]],
        // replacements: {
        //   broadcastIds,
        // },
      });

      // Return the result, including the count and notification data
      return notificationsData;
    } catch (error) {
      // If an error occurs, throw the error
      throw error;
    }
  },
  /**
   * Updates the readers of specified notifications by appending a new user ID.
   * @param {Object} options - Object containing notificationIds and userId.
   * @returns {Promise<Array>} - A promise resolving to an array of updated notifications.
   * @throws {Error} - Throws an error if the update fails.
   */
  updateNotification: async ({ notificationId, userId }) => {
    try {
      // Use Sequelize's update method to modify the readers of specified notifications
      return await Notification.update(
        {
          readersIds: sequelize.literal(
            `JSON_ARRAY_APPEND(readersIds, '$', ${userId})`,
          ),
        },
        {
          where: {
            id: notificationId,
          },
        },
      );
    } catch (error) {
      // If an error occurs during the update process, throw the error
      throw error;
    }
  },
  /**
   * Deletes notifications that were created more than 15 days ago.
   * @returns {Promise<number>} - A promise resolving to the number of deleted notifications.
   * @throws {Error} - Throws an error if the deletion fails.
   */
  deleteOldNotifications: async () => {
    try {
      // Calculate the date 15 days ago from the current time
      const fifteenDaysAgo = new Date(new Date() - 15 * 24 * 60 * 60 * 1000);

      // Use Sequelize's destroy method to delete notifications older than 15 days
      const deletedNotificationCount = await Notification.destroy({
        where: {
          createdAt: {
            [Op.lte]: fifteenDaysAgo,
          },
        },
        force: true, // Use force: true to perform a hard delete
      });

      // Return the number of deleted notifications
      return deletedNotificationCount;
    } catch (error) {
      // If an error occurs during the deletion process, throw the error
      throw error;
    }
  },

  /**
   * Retrieves the count of unread notifications for a given user with the "Mention" type.
   * @param {Object} options - Options object containing the user ID.
   * @param {number} options.userId - The ID of the user for whom unread notifications are counted.
   * @returns {Promise<number>} - A promise resolving to the count of unread notifications.
   * @throws {Error} - Throws an error if there is an issue with the database query.
   */
  getUnreadNotificationCount: async ({ userId }) => {
    try {
      // Use Sequelize's count method to count notifications based on specified conditions
      return await Notification.count({
        where: {
          type: "Mention", // Consider only notifications of type "Mention"
          broadcastIds: sequelize.literal(
            `JSON_CONTAINS(broadcastIds, '${userId}')`,
          ), // Check if userId is present in the broadcastIds array
          readersIds: sequelize.literal(
            `NOT JSON_CONTAINS(readersIds, '${userId}')`,
          ), // Ensure userId is not present in the readersIds array
        },
      });
    } catch (error) {
      // Throw an error if there's an issue with the database query
      throw error;
    }
  },
};
