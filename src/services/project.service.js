/* eslint-disable no-useless-catch */
const {
  Project,
  Task,
  Status,
  User,
  Member,
  Label,
  Permission,
  sequelize,
} = require("../models/sequelize.model");

const { Op } = require("sequelize");
const dataService = require("./data.service");
const { labelColors } = require("../utils/constants/Constants");
const indexServices = require("./index.services");

// Exported module containing functions for project and task management
module.exports = {
  /**
   * Function to create a new project.
   *
   * @param {Object} projectData - The project data, including name, description, and statusId.
   * @returns {Promise<Object>} - A promise resolving to the created project.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  createProject: async ({ name, description, createdBy }) => {
    try {
      // Use Sequelize model to create a new project
      const newProject = await Project.create({
        name,
        description,
        createdBy,
      });

      const adminPermission = await indexServices.getPermissionByName({
        permission: "Super Admin",
      });

      if (adminPermission?.id) {
        await module.exports.addMember({
          projectId: newProject.id,
          userId: createdBy,
          status: "Super Admin",
          permissionId: adminPermission.id,
        });
      } else {
        throw new Error("Permission generation failed");
      }

      await module.exports.createBasicStatuses({ projectId: newProject.id });
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
  updateProject: async ({
    name,
    description,
    updatedBy,
    closedBy,
    projectId,
  }) => {
    try {
      // Use Sequelize model to update an existing project
      const [updatedProject] = await Project.update(
        {
          name,
          closedBy,
          updatedBy,
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
        order: [["createdAt", "DESC"]],
        attributes: {
          include: [
            [
              sequelize.literal(
                "(SELECT COUNT(tasks.id) FROM tasks WHERE tasks.projectId = Project.id)",
              ),
              "tasksCount",
            ],
            [
              sequelize.literal(
                `
                (SELECT COUNT(tasks.id) FROM tasks WHERE tasks.projectId = Project.id AND tasks.statusId = 
                (SELECT MAX(statuses.id) FROM statuses WHERE statuses.projectId = Project.id))
                `,
              ),
              "completedTasks",
            ],
            [
              sequelize.literal(
                `
                (
                  SELECT JSON_ARRAYAGG(
                    JSON_OBJECT('id', users.id, 'email', users.email, 'username', users.username)
                  )
                  FROM users
                  WHERE users.id IN (
                    SELECT members.userId
                    FROM members
                    WHERE members.projectId = Project.id AND members.status in ("Member","Super Admin") 
                  )
                )
                `,
              ),
              "contributors",
            ],
          ],
        },
      });

      // Calculate the current task progress of each project
      if (projects.rows.length > 0) {
        const projectPromises = await projects.rows.map((project) => {
          const defaultValues = project.toJSON();
          return {
            ...defaultValues,
            currentProgress:
              (defaultValues.completedTasks / defaultValues.tasksCount) * 100,
          };
        });
        projects.rows = await Promise.all(projectPromises);
      }

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
      return await Project.findOne({
        where: { id: parseInt(projectId) },
        paranoid: false,
        include: [
          {
            model: Status,
            as: "statuses",
            attributes: {
              exclude: ["projectId"],
            },
          },
          {
            model: User,
            as: "createdByUser",
          },
          {
            model: User,
            as: "updatedByUser",
          },
          {
            model: User,
            as: "closedByUser",
          },
        ],
        attributes: {
          include: [
            [
              sequelize.literal(
                `
              (
                SELECT JSON_ARRAYAGG(
                  JSON_OBJECT('id', users.id, 'email', users.email, 'username', users.username)
                )
                FROM users
                WHERE users.id IN (
                  SELECT members.userId
                  FROM members
                  WHERE members.projectId = Project.id AND members.status in ("Member","Super Admin") 
                )
              )
              `,
              ),
              "contributors",
            ],
          ],
        },
      });
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

      const taskDetails = await module.exports.getTaskById({ taskId: task.id });

      return taskDetails;
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
    labelId,
    task,
    assignees,
    updatedBy,
    description,
  }) => {
    try {
      // Use Sequelize model to update an existing task
      const [updatedTask] = await Task.update(
        {
          statusId,
          task,
          labelId,
          description,
          updatedBy,
          assignees,
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
  getAllTasks: async ({ labelId, searchKey, projectId }) => {
    try {
      // Define a where clause based on the provided filters
      const whereClause = {
        projectId,
        labelId,
      };

      labelId === undefined && delete whereClause.labelId;

      // Add a search filter if searchKey is provided
      if (searchKey) {
        whereClause.task = { [Op.like]: `%${searchKey}%` };
      }

      // Use Sequelize model to retrieve all tasks within a project
      const tasks = await Task.findAll({
        where: whereClause,
        include: [
          {
            model: Status,
            as: "status",
            attributes: {
              exclude: ["projectId"],
            },
          },
          {
            model: Label,
            as: "label",
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
        ],
        attributes: {
          exclude: [
            "createdBy",
            "updatedBy",
            "statusId",
            "trackerId",
            "projectId",
          ],
        },
        paranoid: false, // Include soft-deleted records
      });

      // Map over tasks and get assignees for each task
      await Promise.all(
        // dataService.getAssignees(task);
        tasks.map(async (task) => await dataService.getAssignees(task)),
      );

      // Group tasks based on status using a regular loop
      const groupedTasks = {};
      for (const task of tasks) {
        const statusName = task.status.name;

        // Create an array for the status if it doesn't exist
        groupedTasks[statusName] = groupedTasks[statusName] || [];

        // Add the task to the array
        groupedTasks[statusName].push(task);
      }

      return groupedTasks;
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
            model: Label,
            as: "label",
            attributes: {
              exclude: ["projectId"],
            },
          },
          {
            model: Status,
            as: "status",
            attributes: {
              exclude: ["projectId"],
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
            model: Project,
            as: "project",
            attributes: ["id", "name"],
          },
        ],
        attributes: {
          exclude: [
            "createdBy",
            "updatedBy",
            "projectId",
            "statusId",
            "labelId",
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
      // Use Sequelize model to count open tasks
      const tasksCount = await Task.count({
        where: {
          projectId,
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
  addMember: async ({ projectId, userId, permissionId, status }) => {
    try {
      return Member.findOrCreate({
        where: { projectId, userId },
        defaults: {
          projectId,
          userId,
          status,
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
  updateMember: async ({ projectId, memberId, permissionId, status }) => {
    try {
      const response = await Member.update(
        {
          permissionId,
          status,
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

  /**
   * Removes a member from a project.
   * @param {Object} options - The options object.
   * @param {number} options.projectId - The ID of the project from which to remove the member.
   * @param {number} options.memberId - The ID of the member to be removed.
   * @returns {Promise<number>} - A promise resolving to the number of affected rows (0 or 1).
   * @throws {Error} - Throws an error if the removal fails.
   */
  removeMember: async ({ projectId, memberId }) => {
    try {
      // Use Sequelize's destroy method to remove a member from a project
      const removedRowsCount = await Member.destroy({
        where: { id: memberId, projectId },
      });

      // Return the number of affected rows (0 or 1)
      return removedRowsCount;
    } catch (error) {
      // If an error occurs during the removal process, throw the error
      throw error;
    }
  },
  /**
   * Retrieve a member details by using projectId and userId.
   * @param {Object} options - The options object.
   * @param {number} options.projectId - The ID of the project from which to retrieve the member.
   * @param {number} options.userId - The ID of the user to be retrieve.
   * @returns {Promise<number>} - A promise resolving to the number of affected rows (0 or 1).
   * @throws {Error} - Throws an error if the removal fails.
   */
  getMemberId: async ({ projectId, userId }) => {
    try {
      // Use Sequelize's destroy method to remove a member from a project
      return await Member.findOne({
        where: { userId, projectId },
      });
    } catch (error) {
      // If an error occurs during the removal process, throw the error
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
      const permission = await Member.findOne({
        where: {
          projectId,
          userId,
        },
        include: [
          {
            model: Permission,
            as: "permission",
            attributes: ["name", "json"],
          },
        ],
        attributes: ["id"],
      });
      return permission;
    } catch (error) {
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
        order: [["createdAt", "DESC"]],
        attributes: {
          include: [
            [
              sequelize.literal(
                "(SELECT COUNT(tasks.id) FROM tasks WHERE tasks.projectId = Project.id)",
              ),
              "tasksCount",
            ],
            [
              sequelize.literal(
                `
                (SELECT COUNT(tasks.id) FROM tasks WHERE tasks.projectId = Project.id AND tasks.statusId = 
                (SELECT MAX(statuses.id) FROM statuses WHERE statuses.projectId = Project.id))
                `,
              ),
              "completedTasks",
            ],
            [
              sequelize.literal(
                `
                (
                  SELECT JSON_ARRAYAGG(
                    JSON_OBJECT('id', users.id, 'email', users.email, 'username', users.username)
                  )
                  FROM users
                  WHERE users.id IN (
                    SELECT members.userId
                    FROM members
                    WHERE members.projectId = Project.id 
                  )
                )
                `,
              ),
              "contributors",
            ],
          ],
          exclude: ["statusId"],
        },
      });

      // Calculate the current task progress of each project
      if (projects.rows.length > 0) {
        const projectPromises = await projects.rows.map((project) => {
          const defaultValues = project.toJSON();
          return {
            ...defaultValues,
            currentProgress:
              (defaultValues.completedTasks / defaultValues.tasksCount) * 100,
          };
        });
        projects.rows = await Promise.all(projectPromises);
      }

      return projects;
    } catch (error) {
      // Handle errors and format the error message
      throw error;
    }
  },

  /**
   * Retrieves project members with their user details and permissions.
   * @param {Object} options - Object containing projectId, limit, and offset.
   * @returns {Promise<Object>} - A promise resolving to an object with the count and rows of project members.
   * @throws {Error} - Throws an error if an operation fails.
   */
  getProjectMembers: async ({ projectId, limit, offset }) => {
    try {
      // Use Sequelize's findAndCountAll to get project members with user details and permissions
      const members = await Member.findAndCountAll({
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
        attributes: ["id", "status", "createdAt", "updatedAt"],
      });

      // Return the object with count and rows of project members
      return members;
    } catch (error) {
      // If an error occurs, throw the error
      throw error;
    }
  },

  /**
   * Restores a project with the specified projectId.
   * @param {Object} options - The options for restoring a project.
   * @param {number} options.projectId - The ID of the project to be restored.
   * @returns {Promise<number>} - A promise resolving to the number of restored projects.
   * @throws {Error} - Throws an error if the restoration process fails.
   */
  restoreProject: async ({ projectId }) => {
    try {
      // Attempt to restore a project with the given projectId
      return await Project.restore({ where: { id: projectId } });
    } catch (error) {
      // Handle and propagate any errors that occur during the restoration process
      throw error;
    }
  },

  /**
   * Restores a closed task within the specified project.
   * @param {Object} options - The options for restoring a closed task.
   * @param {number} options.projectId - The ID of the project containing the task.
   * @param {number} options.taskId - The ID of the closed task to be restored.
   * @returns {Promise<number>} - A promise resolving to the number of restored tasks.
   * @throws {Error} - Throws an error if the restoration process fails.
   */
  restoreClosedTask: async ({ projectId, taskId }) => {
    try {
      // Attempt to restore a closed task with the given taskId within the specified projectId
      return await Task.restore({ where: { id: taskId, projectId } });
    } catch (error) {
      // Handle and propagate any errors that occur during the restoration process
      throw error;
    }
  },

  /**
   * Deletes a task within the specified project.
   * @param {Object} options - The options for deleting a task.
   * @param {number} options.projectId - The ID of the project containing the task.
   * @param {number} options.taskId - The ID of the task to be deleted.
   * @returns {Promise<number>} - A promise resolving to the number of deleted tasks.
   * @throws {Error} - Throws an error if the deletion process fails.
   */
  deleteTask: async ({ projectId, taskId }) => {
    try {
      // Attempt to delete a task with the given taskId within the specified projectId
      return await Task.destroy({
        where: { id: taskId, projectId },
        force: true,
      });
    } catch (error) {
      // Handle and propagate any errors that occur during the deletion process
      throw error;
    }
  },

  /**
   * Deletes a project by its ID.
   * @param {Object} options.projectId - The options for deleting a project.
   * @param {number} options.projectId - The ID of the project to be deleted.
   * @returns {Promise<number>} - A promise resolving to the number of deleted projects.
   * @throws {Error} - Throws an error if the deletion process fails.
   */
  deleteProject: async ({ projectId }) => {
    try {
      // Attempt to delete the project with the given projectId
      return await Project.destroy({
        where: { id: projectId },
        force: true,
      });
    } catch (error) {
      // Handle and propagate any errors that occur during the deletion process
      throw error;
    }
  },

  /**
   * Create basic statuses for a project.
   * @param {Object} params - The parameters containing projectId.
   */
  createBasicStatuses: async ({ projectId }) => {
    try {
      await Status.bulkCreate([
        { name: "Todo", color: labelColors[0], projectId },
        { name: "Inprogress", color: labelColors[1], projectId },
        { name: "Complete", color: labelColors[2], projectId },
      ]);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a label.
   * @param {Object} label - The label object to be created.
   * @returns {Object} - The created label.
   */
  createLabel: async (label) => {
    try {
      return await Label.create(label);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a status.
   * @param {Object} status - The status object to be created.
   * @returns {Object} - The created status.
   */
  createStatus: async (status) => {
    try {
      return await Status.create(status);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a status by projectId and statusId.
   * @param {Object} params - The parameters containing projectId and statusId.
   * @returns {number} - The number of deleted statuses.
   */
  deleteStatus: async ({ projectId, statusId }) => {
    try {
      return await Status.destroy({
        where: {
          projectId,
          id: statusId,
        },
        force: true,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a label by projectId and labelId.
   * @param {Object} params - The parameters containing projectId and labelId.
   * @returns {number} - The number of deleted labels.
   */
  deleteLabel: async ({ projectId, labelId }) => {
    try {
      return await Label.destroy({
        where: {
          projectId,
          id: labelId,
        },
        force: true,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a status by projectId, statusId, name, and color.
   * @param {Object} params - The parameters containing projectId, statusId, name, and color.
   * @returns {number} - The number of updated statuses.
   */
  updateStatus: async ({ name, color, statusId, projectId }) => {
    try {
      return await Status.update(
        { name, color },
        {
          where: { id: statusId, projectId },
        },
      );
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a label by projectId, labelId, name, and color.
   * @param {Object} params - The parameters containing projectId, labelId, name, and color.
   * @returns {number} - The number of updated labels.
   */
  updateLabel: async ({ name, color, labelId, projectId }) => {
    try {
      return await Label.update(
        { name, color },
        {
          where: { id: labelId, projectId },
        },
      );
    } catch (error) {
      throw error;
    }
  },
  /**
   * Retrieves project labels.
   * @param {Object} options - Object containing projectId, limit, and offset.
   * @returns {Promise<Object>} - A promise resolving to an object with the count and rows of project labels.
   * @throws {Error} - Throws an error if an operation fails.
   */
  getProjectLabels: async ({ projectId, limit, offset }) => {
    try {
      // Use Sequelize's findAndCountAll to get project labels
      return await Label.findAndCountAll({
        limit,
        offset,
        where: {
          projectId,
        },
      });
    } catch (error) {
      // If an error occurs, throw the error
      throw error;
    }
  },
  /**
   * Retrieves project statuses.
   * @param {Object} options - Object containing projectId, limit, and offset.
   * @returns {Promise<Object>} - A promise resolving to an object with the count and rows of project statuses.
   * @throws {Error} - Throws an error if an operation fails.
   */
  getProjectStatuses: async ({ projectId, limit, offset }) => {
    try {
      // Use Sequelize's findAndCountAll to get project statuses
      return await Status.findAndCountAll({
        limit,
        offset,
        where: {
          projectId,
        },
      });
    } catch (error) {
      // If an error occurs, throw the error
      throw error;
    }
  },
};
