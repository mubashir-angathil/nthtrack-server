/* eslint-disable no-useless-catch */
const {
  Project,
  Task,
  Status,
  Tracker,
  User,
  Member,
  Permission,
  sequelize,
} = require("../models/sequelize.model");

const { Op } = require("sequelize");
const dataService = require("./data.service");

// Exported module containing functions for project and task management
module.exports = {
  /**
   * Function to create a new project.
   *
   * @param {Object} projectData - The project data, including name, description, and statusId.
   * @returns {Promise<Object>} - A promise resolving to the created project.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  createProject: async ({ name, description, statusId, createdBy }) => {
    try {
      // Use Sequelize model to create a new project
      const newProject = await Project.create({
        name,
        description,
        statusId,
        createdBy,
      });

      const adminPermission = await module.exports.getPermissionByName({
        permission: "Super Admin",
      });

      if (adminPermission.id) {
        await module.exports.addMember({
          projectId: newProject.id,
          userId: createdBy,
          permissionId: adminPermission.id,
        });
      } else {
        throw new Error("Permission generation failed");
      }

      return newProject;
    } catch (error) {
      // Handle errors and format the error message
      throw error;
    }
  },

  /**
   * Function to update an existing project.
   *
   * @param {Object} projectData - The project data, including name, description, statusId, and projectId.
   * @returns {Promise<Object>} - A promise resolving to the updated project.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  updateProject: async ({ name, description, statusId, projectId }) => {
    try {
      // Use Sequelize model to update an existing project
      const [updatedProject] = await Project.update(
        {
          name,
          statusId,
          description,
        },
        {
          where: { id: projectId },
        },
      );
      return updatedProject;
    } catch (error) {
      // Handle errors and format the error message
      throw error;
    }
  },

  /**
   * Function to get all projects with optional pagination and filtering by name.
   *
   * @param {Object} options - Options for pagination and filtering, including offset, limit, and name.
   * @returns {Promise<Array>} - A promise resolving to an array of projects.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  getAllProjects: async ({ offset, limit, name, userId }) => {
    try {
      // Define a where clause based on the presence of name
      const whereClause = name
        ? { name: { [Op.like]: `%${name}%` } }
        : undefined;

      // Use Sequelize model to retrieve all projects
      const projects = await Project.findAndCountAll({
        offset,
        limit,
        paranoid: false, // Include soft-deleted records
        where: { ...whereClause, createdBy: userId },
        include: [
          {
            model: Status,
            as: "status",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        ],
        order: [
          ["statusId", "ASC"],
          ["createdAt", "DESC"],
        ],
        attributes: {
          include: [
            [
              sequelize.literal(
                "(SELECT COUNT(tasks.id) FROM tasks WHERE tasks.projectId = Project.id and tasks.statusId = 1)",
              ),
              "taskCount",
            ],
          ],
          exclude: ["statusId"],
        },
      });

      return projects;
    } catch (error) {
      // Handle errors and format the error message
      throw error;
    }
  },

  /**
   * Function to get a project by ID.
   *
   * @param {Object} options - Options including the projectId.
   * @returns {Promise<Object>} - A promise resolving to the retrieved project.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  getProjectById: async ({ projectId }) => {
    try {
      // Use Sequelize model to retrieve a project by ID
      const project = await Project.findByPk(projectId, {
        paranoid: false,
      });
      return project;
    } catch (error) {
      // Handle errors and format the error message
      throw error;
    }
  },

  /**
   * Function to close a project by ID (soft delete).
   *
   * @param {Object} options - Options including the projectId.
   * @returns {Promise<Object>} - A promise resolving to the closed project.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  closeProjectById: async ({ projectId }) => {
    try {
      // Use Sequelize model to soft delete a project by setting deletedAt
      return await Project.destroy({
        where: { id: projectId },
      });
    } catch (error) {
      // Handle errors and format the error message
      throw error;
    }
  },

  /**
   * Function to create a new task within a project.
   *
   * @param {Object} newTask - The new task data.
   * @returns {Promise<Object>} - A promise resolving to the created task.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  createTask: async (newTask) => {
    try {
      // Use Sequelize model to create a new task
      const task = await Task.create(newTask);
      return task;
    } catch (error) {
      // Handle errors and format the error message
      throw error;
    }
  },

  /**
   * Function to update an task within a project.
   *
   * @param {Object} options - Options including the taskId, trackerId, description, and statusId.
   * @returns {Promise<Object>} - A promise resolving to the updated task.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  updateTask: async ({
    statusId,
    taskId,
    assignees,
    updatedBy,
    closedBy,
    description,
  }) => {
    try {
      // Use Sequelize model to update an existing task
      const updatedTask = await Task.update(
        {
          statusId,
          description,
          updatedBy,
          assignees,
          closedBy,
        },
        {
          where: { id: taskId },
        },
      );
      return updatedTask;
    } catch (error) {
      // Handle errors and format the error message
      throw error;
    }
  },
  /**
   * Function to get all tasks within a project with optional filters and pagination.
   *
   * @param {Object} options - Options including offset, limit, trackerId, statusId, searchKey, and projectId.
   * @returns {Promise<Array>} - A promise resolving to an array of tasks.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  getAllTasks: async ({
    offset,
    limit,
    trackerId,
    statusId,
    searchKey,
    projectId,
  }) => {
    try {
      // Define a where clause based on the provided filters
      const whereClause = {
        projectId,
        trackerId,
        statusId,
      };

      trackerId === undefined && delete whereClause.trackerId;
      statusId === undefined && delete whereClause.statusId;

      // Add a search filter if searchKey is provided
      if (searchKey) {
        whereClause.description = { [Op.like]: `%${searchKey}%` };
      }

      // Use Sequelize model to retrieve all tasks within a project
      const tasks = await Task.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Status,
            as: "status",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: Tracker,
            as: "tracker",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: User,
            as: "createdByUser",
            attributes: ["id", "username", "email"],
          },
          {
            model: User,
            as: "updatedByUser",
            attributes: ["id", "username", "email"],
          },
          {
            model: User,
            as: "closedByUser",
            attributes: ["id", "username", "email"],
          },
        ],
        order: [
          ["closedAt", "ASC"],
          ["id", "DESC"],
        ],
        attributes: {
          exclude: [
            "createdBy",
            "updatedBy",
            "closedBy",
            "statusId",
            "trackerId",
            "projectId",
          ],
        },
        offset,
        limit,
        paranoid: false, // Include soft-deleted records
      });

      // Map over tasks and get assignees for each task
      await Promise.all(
        tasks.rows.map(async (task) => dataService.getAssignees(task)),
      );

      return tasks;
      // console.log(tasks.rows[0]);
    } catch (error) {
      // Handle errors and format the error message
      throw error;
    }
  },

  /**
   * Function to get an task by ID within a project.
   *
   * @param {Object} options - Options including the taskId.
   * @returns {Promise<Object>} - A promise resolving to the retrieved task.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  getTaskById: async ({ taskId }) => {
    try {
      // Use Sequelize model to retrieve an task by ID
      const task = await Task.findByPk(taskId, {
        paranoid: false,
        include: [
          {
            model: Tracker,
            as: "tracker",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: Status,
            as: "status",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
          {
            model: User,
            as: "createdByUser",
            attributes: ["id", "username", "email"],
          },
          {
            model: User,
            as: "updatedByUser",
            attributes: ["id", "username", "email"],
          },
          {
            model: User,
            as: "closedByUser",
            attributes: ["id", "username", "email"],
          },
        ],
        attributes: {
          exclude: [
            "createdBy",
            "closedBy",
            "updatedBy",
            "projectId",
            "statusId",
            "trackerId",
          ],
        },
      });

      return await dataService.getAssignees(task);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Function to close an task by ID within a project (soft delete).
   *
   * @param {Object} options - Options including the taskId.
   * @returns {Promise<Object>} - A promise resolving to the closed task.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  closeTaskById: async ({ taskId }) => {
    try {
      // Use Sequelize model to soft delete an task by setting deletedAt
      return await Task.destroy({
        where: { id: taskId },
      });
    } catch (error) {
      // Handle errors and format the error message
      throw error;
    }
  },

  /**
   * Function to get the count of open tasks within a project.
   *
   * @param {Object} options - Options including the projectId.
   * @returns {Promise<number>} - A promise resolving to the count of open tasks.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  getOpenTasksCountByProjectId: async ({ projectId }) => {
    try {
      // Use Sequelize model to count open tasks based on the absence of closedAt
      const tasksCount = await Task.count({
        where: {
          projectId,
          closedAt: { [Op.eq]: null },
        },
      });
      return tasksCount;
    } catch (error) {
      // Handle errors and format the error message
      throw error;
    }
  },
  /**
   * Function to get the status.
   *
   * @param {Object} options - Options including the status.
   * @returns {Promise<number>} - A promise resolving to the count of open tasks.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  getStatus: async ({ name }) => {
    try {
      // Use Sequelize model to fetch status based on status name
      const status = await Status.findOne({
        where: {
          name,
        },
      });
      return status;
    } catch (error) {
      // Handle errors and format the error message
      throw error;
    }
  },
  /**
   * Add a member to a project or retrieve if already exists.
   *
   * @param {Object} param - Parameters for adding a member.
   * @param {string} param.projectId - The ID of the project.
   * @param {string} param.userId - The ID of the user.
   * @param {string} param.permissionId - The ID of the permission.
   * @returns {Promise<Array>} A promise that resolves with an array containing the member details.
   * @throws Will throw an error if there's an issue with the operation.
   */
  addMember: async ({ projectId, userId, permissionId }) => {
    try {
      return Member.findOrCreate({
        where: { projectId, userId },
        defaults: {
          projectId,
          userId,
          permissionId,
        },
      });
    } catch (error) {
      throw error;
    }
  },
  /**
   * Update member to a project or retrieve if already exists.
   *
   * @param {Object} param - Parameters for adding a member.
   * @param {string} param.projectId - The ID of the project.
   * @param {string} param.userId - The ID of the user.
   * @param {string} param.permissionId - The ID of the permission.
   * @returns {Promise<Array>} A promise that resolves with an array containing the member details.
   * @throws Will throw an error if there's an issue with the operation.
   */
  updateMember: async ({ projectId, memberId, permissionId }) => {
    try {
      const response = await Member.update(
        {
          permissionId,
        },
        {
          where: { id: memberId, projectId },
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  removeMember: async ({ projectId, memberId }) => {
    try {
      return await Member.destroy({
        where: { id: memberId, projectId },
      });
    } catch (error) {
      throw error;
    }
  },
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
   * Check if a user is an admin for a specific project.
   *
   * @param {Object} param - Parameters for checking admin status.
   * @param {string} param.userId - The ID of the user.
   * @param {string} param.projectId - The ID of the project.
   * @returns {Promise<Object>} A promise that resolves with information about admin status.
   * @throws Will throw an error if there's an issue with the operation.
   */
  checkIsAdmin: async ({ userId, projectId }) => {
    try {
      const isAdmin = await Project.findOne({
        paranoid: false,
        where: {
          id: projectId,
          createdBy: userId,
        },
      });

      return isAdmin;
    } catch (error) {
      throw error;
    }
  },
  /**
   * Retrieve permission details for a user in a project.
   *
   * @param {Object} param - Parameters for retrieving permission details.
   * @param {string} param.projectId - The ID of the project.
   * @param {string} param.userId - The ID of the user.
   * @returns {Promise<Object>} A promise that resolves with information about the user's permission.
   * @throws Will throw an error if there's an issue with the operation.
   */
  getPermission: async ({ projectId, userId }) => {
    try {
      const isAdmin = await Member.findOne({
        where: {
          projectId,
          userId,
        },
        include: [
          {
            model: Permission,
            as: "permission",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });
      return isAdmin;
    } catch (error) {
      throw error;
    }
  },

  getPermissionByName: async ({ permission }) => {
    try {
      return await Permission.findOne({ where: { name: permission } });
    } catch (error) {
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
   * Retrieve team projects with pagination.
   *
   * @param {Object} param - Parameters for retrieving team projects.
   * @param {string} param.offset - The offset for pagination.
   * @param {string} param.limit - The limit for pagination.
   * @param {string} param.name - The name to filter projects.
   * @param {string} param.teamId - The ID of the team.
   * @param {string} param.userId - The ID of the user.
   * @returns {Promise<Object>} A promise that resolves with information about team projects.
   * @throws Will throw an error if there's an issue with the operation.
   */
  getTeamProjects: async ({ offset, limit, name, teamId, userId }) => {
    try {
      // Define a where clause based on the presence of name
      const whereClause = name
        ? { name: { [Op.like]: `%${name}%` } }
        : undefined;

      // Use Sequelize model to retrieve all projects
      const projects = await Project.findAndCountAll({
        offset,
        limit,
        paranoid: false, // Include soft-deleted records
        where: {
          ...whereClause,
          createdBy: teamId,
          id: [
            sequelize.literal(
              `(SELECT projectId FROM members WHERE members.userId = ${userId})`,
            ),
          ],
        },
        include: [
          {
            model: Status,
            as: "status",
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        ],
        order: [
          ["statusId", "ASC"],
          ["createdAt", "DESC"],
        ],
        attributes: {
          include: [
            [
              sequelize.literal(
                "(SELECT COUNT(tasks.id) FROM tasks WHERE tasks.projectId = Project.id and tasks.statusId = 1)",
              ),
              "taskCount",
            ],
          ],
          exclude: ["statusId"],
        },
      });

      return projects;
    } catch (error) {
      // Handle errors and format the error message
      throw error;
    }
  },
  getProjectMembers: async ({ projectId, limit, offset }) => {
    try {
      return await Member.findAndCountAll({
        limit,
        offset,
        where: {
          projectId,
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
          {
            model: Permission,
            as: "permission",
            attributes: ["id", "name"],
          },
        ],
        attributes: ["id", "createdAt", "updatedAt"],
      });
    } catch (error) {
      throw error;
    }
  },
};
