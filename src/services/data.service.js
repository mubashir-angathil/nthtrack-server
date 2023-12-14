/* eslint-disable no-useless-catch */
const { Op } = require("sequelize");
const {
  Tracker,
  Status,
  Member,
  User,
  Project,
  Permission,
  Notification,
  sequelize,
} = require("../models/sequelize.model");
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

  /**
   * Retrieve all permissions.
   *
   * @returns {Promise<Array>} A promise that resolves with an array containing permission details.
   * @throws Will throw an error if there's an issue with the operation.
   */
  getPermissions: async () => {
    try {
      return await Permission.findAll({
        attributes: ["id", "name"],
      });
    } catch (error) {
      throw formatError(error);
    }
  },

  /**
   * Retrieve teams that a user is a member of.
   *
   * @param {Object} param - Parameters for retrieving member teams.
   * @param {string} param.userId - The ID of the user.
   * @returns {Promise<Array>} A promise that resolves with an array containing unique users in the teams.
   * @throws Will throw an error if there's an issue with the operation.
   */
  getMemberTeams: async ({ userId }) => {
    try {
      const teams = await Member.findAll({
        where: {
          userId,
        },
        include: [
          {
            paranoid: false, // Include soft-deleted records
            model: Project,
            as: "project",
            include: [
              {
                model: User,
                as: "createdByUser",
                attributes: ["id", ["username", "team"]],
              },
            ],
            attributes: ["id"],
          },
        ],
        attributes: ["id"],
      });
      // Use a Map to store unique users based on their IDs
      const uniqueUsersMap = new Map();
      // Iterate through teams and add unique users to the map
      teams.forEach((team) => {
        if (team.project.createdByUser.id !== userId) {
          const user = team.project.createdByUser;
          // Use user ID as the key in the Map to ensure uniqueness
          uniqueUsersMap.set(user.id, user);
        }
      });

      // Convert the Map values to an array
      const uniqueUsersArray = Array.from(uniqueUsersMap.values());

      return uniqueUsersArray;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Retrieve members of a project.
   *
   * @param {Object} param - Parameters for retrieving project members.
   * @param {string} param.projectId - The ID of the project.
   * @returns {Promise<Array>} A promise that resolves with an array containing unique users in the project.
   * @throws Will throw an error if there's an issue with the operation.
   */
  getProjectMembers: async ({ projectId }) => {
    try {
      const members = await Member.findAll({
        where: {
          projectId,
        },
        include: [
          {
            paranoid: false, // Include soft-deleted records
            model: User,
            as: "user",
            attributes: ["id", "email", "username"],
          },
        ],
        attributes: ["id"],
      });

      // Use a Map to store unique users based on their IDs
      const uniqueUsersMap = new Map();

      // Iterate through members and add unique users to the map
      members.forEach((member) => {
        const user = member.user;
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

  /**
   * Retrieve users by their IDs.
   *
   * @param {Object} param - Parameters for retrieving users by IDs.
   * @param {Array} param.userIds - An array of user IDs.
   * @returns {Promise<Array>} A promise that resolves with an array containing user details.
   * @throws Will throw an error if there's an issue with the operation.
   */
  getUsersByIds: async ({ userIds }) => {
    try {
      return await User.findAll({
        where: { id: userIds },
        attributes: ["id", "username", "email"],
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Retrieve assignees for a task.
   *
   * @param {Object} task - The task object.
   * @returns {Promise<Object>} A promise that resolves with the task object containing assignee details.
   * @throws Will throw an error if there's an issue with the operation.
   */
  getAssignees: async (task) => {
    let assignees = await task.getAssignees();

    // Map assignees to get their user details
    assignees = await module.exports.getUsersByIds({ userIds: assignees });

    task.assignees = assignees; // Assign the array of assignees' user details to the task
    return task;
  },

  /**
   * Retrieves a list of users with optional search criteria.
   * @param {Object} options - Object containing offset, limit, and searchKey.
   * @returns {Promise<Object>} - A promise resolving to an object with user data.
   * @throws {Error} - Throws an error if the operation fails.
   */
  getUsers: async ({ offset, limit, searchKey }) => {
    try {
      // Construct a WHERE clause based on the searchKey, if provided
      const whereClause = searchKey
        ? {
            [Op.or]: [
              { username: { [Op.like]: `%${searchKey}%` } },
              { email: { [Op.like]: `%${searchKey}%` } },
            ],
          }
        : undefined;

      // Use Sequelize's findAndCountAll to get paginated user data
      const usersData = await User.findAndCountAll({
        offset,
        limit,
        attributes: ["id", "username", "email"],
        where: whereClause,
      });

      // Return the result, including the count and user data
      return usersData;
    } catch (error) {
      // If an error occurs, throw the error
      throw error;
    }
  },

  /**
   * Retrieves notifications based on roomIds and userId, with optional pagination.
   * @param {Object} options - Object containing roomIds, userId, offset, and limit.
   * @returns {Promise<Object>} - A promise resolving to an object with notification data and count.
   * @throws {Error} - Throws an error if the operation fails.
   */
  getNotifications: async ({ roomIds, userId, offset, limit }) => {
    try {
      // Use Sequelize's findAndCountAll to get paginated notification data
      const notificationsData = await Notification.findAndCountAll({
        offset,
        limit,
        where: {
          // Construct a WHERE clause based on roomIds and userId
          broadcastId: [...roomIds, userId],
          readers: sequelize.literal(`NOT JSON_CONTAINS(readers, '${userId}')`),
        },
        order: [["createdAt", "DESC"]],
        replacements: {
          roomIds,
        },
      });

      // Return the result, including the count and notification data
      return notificationsData;
    } catch (error) {
      // If an error occurs, throw the error
      throw error;
    }
  },

  /**
   * Retrieves project IDs in which the user is enrolled.
   * @param {Object} options - Object containing the userId.
   * @returns {Promise<Array>} - A promise resolving to an array of project IDs.
   * @throws {Error} - Throws an error if the user is not enrolled in any project or if an operation fails.
   */
  getEnrolledProjectIds: async ({ userId }) => {
    try {
      // Use Sequelize's findAll to get projects where the user is a member
      const projects = await Member.findAll({
        where: {
          userId,
        },
      });

      // Check if the result is an array of projects
      if (Array.isArray(projects)) {
        // Extract project IDs from the projects array
        const projectIds = projects.map((member) => member.projectId);
        return projectIds;
      }

      // If the result is not an array, throw an error indicating the user is not enrolled in any project
      throw new Error("User currently not enrolled in any project");
    } catch (error) {
      // If an error occurs, throw the error
      throw error;
    }
  },

  /**
   * Retrieves the count of unread notifications for a user in specified rooms.
   * @param {Object} options - Object containing roomIds and userId.
   * @returns {Promise<number>} - A promise resolving to the count of unread notifications.
   * @throws {Error} - Throws an error if an operation fails.
   */
  getNotificationCount: async ({ roomIds, userId }) => {
    try {
      // Use Sequelize's count to get the number of unread notifications
      const notificationCount = await Notification.count({
        where: {
          broadcastId: roomIds,
          readers: sequelize.literal(`NOT JSON_CONTAINS(readers, '${userId}')`),
        },
      });

      // Return the count of unread notifications
      return notificationCount;
    } catch (error) {
      // If an error occurs, throw the error
      throw error;
    }
  },
};
