/* eslint-disable no-useless-catch */
const { Op } = require("sequelize");
const {
  Label,
  Status,
  Member,
  User,
  Project,
  Permission,
  // sequelize,
} = require("../models/sequelize.model");

module.exports = {
  /**
   * Retrieves a list of tracker from the database.
   *
   * @returns {Promise<Array>} An array of labels objects containing 'id', color and 'name' attributes.
   * @throws {Error} Throws a formatted error if the operation encounters any issues.
   */
  getLabels: async ({ projectId }) => {
    try {
      const trackers = await Label.findAll({
        where: {
          projectId,
        },
      });
      return trackers;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Retrieves a list of status from the database.
   *
   * @returns {Promise<Array>} An array of status objects containing 'id' and 'name' attributes.
   * @throws {Error} Throws a formatted error if the operation encounters any issues.
   */
  getTaskCategoriesByProjectId: async ({ projectId }) => {
    try {
      const statuses = await Status.findAll({
        where: { projectId },
        attributes: {
          exclude: ["projectId"],
        },
      });
      return statuses;
    } catch (error) {
      throw error;
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
      throw error;
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
          status: "Member",
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
          status: {
            [Op.not]: "Pending",
          },
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
  getUsers: async ({ offset, limit, searchKey, projectId }) => {
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

      if (projectId) {
        const membersIds = await Member.findAll({
          where: { projectId, status: { [Op.not]: "Pending" } },
          attributes: ["userId"],
        });
        usersData.rows = await usersData.rows.filter((user) => {
          return !membersIds.some((ids) => ids.userId === user.id);
        });
      }

      // Return the result, including the count and user data
      return usersData;
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
};
