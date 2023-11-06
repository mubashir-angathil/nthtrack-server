/* eslint-disable no-useless-catch */
const {
  Project,
  Task,
  Status,
  Tracker,
  sequelize,
} = require("../models/sequelize.model");

const { Op } = require("sequelize");

// Exported module containing functions for project and task management
module.exports = {
  /**
   * Function to create a new project.
   *
   * @param {Object} projectData - The project data, including name, description, and statusId.
   * @returns {Promise<Object>} - A promise resolving to the created project.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  createProject: async ({ name, description, statusId }) => {
    try {
      // Use Sequelize model to create a new project
      const newProject = await Project.create({
        name,
        description,
        statusId,
      });
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
  getAllProjects: async ({ offset, limit, name }) => {
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
        where: whereClause,
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
      const project = await Project.destroy({
        where: { id: projectId },
      });
      return project;
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
  updateTask: async ({ taskId, trackerId, description }) => {
    try {
      // Use Sequelize model to update an existing task
      const [updatedTask] = await Task.update(
        {
          trackerId,
          description,
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
        ],
        order: [
          ["closedAt", "ASC"],
          ["id", "DESC"],
        ],
        attributes: {
          exclude: ["statusId", "trackerId", "projectId"],
        },
        offset,
        limit,
        paranoid: false, // Include soft-deleted records
      });

      return tasks;
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
        ],
        attributes: {
          exclude: ["projectId", "statusId", "trackerId"],
        },
      });
      return task;
    } catch (error) {
      // Handle errors and format the error message
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
      const task = await Task.destroy({
        where: { id: taskId },
      });
      return task;
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
};
