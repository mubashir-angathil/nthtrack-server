// Import necessary modules and services
const projectService = require("../services/project.service");
const { getCurrentPagination } = require("../utils/helpers/helpers");
const { httpStatusCode } = require("../utils/constants/Constants");
const dataService = require("../services/data.service");
const helpers = require("../utils/helpers/helpers");
const { socketHelper } = require("../socket/Helper");

// Exported module containing various controllers for project and task management
module.exports = {
  /**
   * Controller for creating a new project.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  createProject: async (req, res, next) => {
    // Extract relevant information from the request body
    const { name, description } = req.body;

    // Call the project service to create a new project
    const project = await projectService.createProject({
      name,
      description,
      createdBy: req.user.id,
    });

    // Check if the project creation was successful
    if (project) {
      // Respond with success and the created project data
      return res.status(httpStatusCode.CREATED).json({
        success: true,
        message: "Project created successfully.",
        data: project,
      });
    }

    throw next({ message: "Failed to create a project." });
  },

  /**
   * Controller for retrieving all projects with pagination.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getAllProjects: async (req, res, next) => {
    // Extract pagination parameters and project name from request query
    const { page, limit, name } = req.query;
    const currentPagination = getCurrentPagination({ page, limit });

    // Call the project service to retrieve all projects
    const projects = await projectService.getAllProjects({
      offset: currentPagination.offset,
      limit: currentPagination.limit,
      name,
      userId: req.user.id,
    });

    // Check if project retrieval was successful
    if (projects) {
      // Respond with success and the retrieved projects
      return res.json({
        success: true,
        message: "Projects retrieved successfully.",
        totalRows: projects.count,
        data: projects.rows,
      });
    }

    // If no projects are found, trigger the error middleware
    throw next({ message: "No projects found." });
  },

  /**
   * Controller for retrieving a project by ID.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getProjectById: async (req, res, next) => {
    // Extract project ID from request parameters
    const { projectId } = req.params;

    // Call the project service to retrieve a project by ID
    const project = await projectService.getProjectById({
      projectId,
    });

    // Check if the project was found
    if (project) {
      // Respond with success and the retrieved project
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Project retrieved successfully.",
        data: project,
      });
    }

    // If the project is not found, trigger the error middleware
    return next({ message: "Project not found." });
  },

  /**
   * Controller for updating an existing project.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  updateProject: async (req, res, next) => {
    // Extract relevant information from the request body
    const { name, description, projectId } = req.body;

    // Parse user id to integer
    const userId = parseInt(req.user.id);

    // Call the project services to retrieve project details
    const project = await projectService.getProjectById({ projectId });

    // Call the project service to update an existing project
    const updatedProject = await projectService.updateProject({
      projectId,
      name,
      description,
      updatedBy: req.user.id,
    });

    // Check if the project update was successful
    if (updatedProject) {
      // If the project existed, notify contributors about the update
      if (project) {
        // Retrieve contributor ids excluding the current user using the function
        const broadcastIds = helpers.getContributorIds(
          project.toJSON(),
          userId,
        );

        // If there are contributors to notify, push a general notification
        if (broadcastIds.length > 0) {
          socketHelper.pushNotification({
            type: "General",
            content: name
              ? `The project "${project.name}" has been renamed to "${name}".`
              : `Descriptions for the project "${project.name}" have been updated.`,
            broadcastIds,
            projectId,
            author: req.user.id,
          });
        }
      }

      // Respond with success and information about the update
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Successfully updated project details.",
        data: [{ updated: Boolean(updatedProject) }],
      });
    }

    // If project update fails, throw an error to trigger the error middleware
    throw next({ message: "Failed to update the project." });
  },

  /**
   * Controller for closing a project by ID.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  closeProjectById: async (req, res, next) => {
    // Extract project ID from request parameters
    const { projectId } = req.params;
    const userId = parseInt(req.user.id);

    // Fetch project by ID
    const project = await projectService.getProjectById({
      projectId,
    });

    // Close the project
    const closeProject = await projectService.closeProjectById({
      projectId,
    });

    // Check if the project was successfully updated and closed
    if (closeProject) {
      // Update closedBy and updatedBy as null
      project.closedBy = req.user.id;
      project.updatedBy = req.user.id;

      // Save the updated project
      await project.save();

      // Retrieve contributor IDs excluding the current user
      const broadcastIds = helpers.getContributorIds(project.toJSON(), userId);

      // If there are contributors to notify, push a general notification
      if (broadcastIds.length > 0) {
        socketHelper.pushNotification({
          type: "General",
          content: `The project "${project.name}" has been closed.`,
          broadcastIds,
          projectId,
          author: userId,
        });
      }

      // Respond with success message
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Project closed successfully.",
      });
    }

    // If project closure fails, trigger the error middleware
    next({
      message: "Project not found or already closed.",
    });
  },

  /**
   * Restores a project by its ID.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} - A promise resolving to the result of the restoration operation.
   * @throws {Error} - Throws an error if the restoration process fails.
   */
  restoreProject: async (req, res, next) => {
    // Extract project ID from request parameters
    const { projectId } = req.params;
    const userId = parseInt(req.user.id);

    // Attempt to restore the closed project
    const reopenClosedProject = await projectService.restoreProject({
      projectId,
    });

    if (reopenClosedProject) {
      // Retrieve the reopened project
      const project = await projectService.getProjectById({
        projectId,
      });

      // Update closedBy to null and set updatedBy to the current user
      project.closedBy = null;
      project.updatedBy = req.user.id;

      // Save the updated project
      await project.save();

      // Retrieve contributor IDs excluding the current user
      const broadcastIds = helpers.getContributorIds(project.toJSON(), userId);

      // If there are contributors to notify, push a general notification
      if (broadcastIds.length > 0) {
        socketHelper.pushNotification({
          type: "General",
          content: `The project "${project.name}" has been reopened.`,
          broadcastIds,
          projectId,
          author: userId,
        });
      }

      // Respond with success message
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Project successfully reopened.",
      });
    }

    // If project reopening fails, trigger the error middleware
    next({
      message: "Project reopening failed.",
    });
  },

  /**
   * Deletes a project by its ID.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} - A promise resolving to the result of the deletion operation.
   * @throws {Error} - Throws an error if the deletion process fails.
   */
  deleteProject: async (req, res, next) => {
    // Extract project ID from request parameters
    const { projectId } = req.params;
    const userId = parseInt(req.user.id);

    // Retrieve project details before deletion
    const project = await projectService.getProjectById({
      projectId,
    });

    // Delete the project by its ID
    const response = await projectService.deleteProject({ projectId });

    // Check if the project deletion was successful
    if (response) {
      // Retrieve contributor IDs excluding the current user
      const broadcastIds = helpers.getContributorIds(project.toJSON(), userId);

      // If there are contributors to notify, push a general notification
      if (broadcastIds.length > 0) {
        socketHelper.pushNotification({
          type: "General",
          content: `The project "${project.name}" has been deleted.`,
          broadcastIds,
          projectId,
          author: userId,
        });
      }

      // Respond with success message
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Project deleted successfully.",
      });
    }

    // If project deletion fails, trigger the error middleware
    next({ message: "Failed to delete project." });
  },

  /**
   * Controller for creating a task within a project.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  createTask: async (req, res, next) => {
    // Extract task details from the request body
    const { statusId, labelId, task, description, assignees } = req.body;

    // Parse user and project IDs to integers
    const authorId = parseInt(req.user.id);
    const projectId = parseInt(req.params.projectId);

    // Prepare the new task object
    const newTask = {
      description,
      labelId,
      task,
      projectId,
      statusId,
      createdBy: authorId,
      assignees,
    };

    // Validate assignees if present
    if (assignees?.length > 0) {
      // Get project members
      const projectMembers = await dataService.getProjectMembers({ projectId });
      const memberIds = projectMembers.map((member) => member.id);

      // Check for redundant assignments
      if (!helpers.isArrayUnique(assignees)) {
        return next({
          message: "Cannot assign task redundantly to a member",
        });
      }

      // Validate assignees against project members
      if (!assignees.every((assignee) => memberIds.includes(assignee))) {
        return next({
          message: "Some assignees not found in the project member list",
        });
      }
    }

    // Call the project service to create a new task
    const response = await projectService.createTask(newTask);

    // Check if the task creation was successful
    if (response) {
      // Notify assigned members if there are assignees
      if (assignees.length > 0) {
        const project = await projectService.getProjectById({ projectId });
        await socketHelper.pushNotification({
          type: "Mention",
          content: `You have been assigned to the task "${task}" in the project "${project.name}".`,
          broadcastIds: assignees,
          projectId,
          author: authorId,
        });
      }

      // Respond with success and the created task data
      return res.status(httpStatusCode.CREATED).json({
        success: true,
        message: "Task created successfully",
        data: response,
      });
    }

    // If task creation fails, trigger the error middleware
    throw next({
      message: "Failed to create a task.",
    });
  },

  /**
   * Controller for retrieving all tasks within a project with pagination.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getAllTasks: async (req, res, next) => {
    // Extract pagination parameters and other filters from request query
    const { labelId, searchKey } = req.query;
    const { projectId } = req.params;

    // Call the project service to retrieve all tasks within a project
    const tasks = await projectService.getAllTasks({
      projectId,
      labelId,
      searchKey,
    });

    // Check if task retrieval was successful
    if (tasks) {
      // Respond with success and the retrieved tasks
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Tasks retrieved successfully.",
        data: tasks,
      });
    }

    // If task retrieval fails, trigger the error middleware
    next({
      message: "Failed to retrieve tasks.",
    });
  },

  /**
   * Controller for retrieving a task by ID within a project.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getTaskById: async (req, res, next) => {
    // Extract task ID from request parameters
    const { taskId } = req.params;

    // Call the project service to retrieve a task by ID
    const task = await projectService.getTaskById({ taskId });

    // Check if the task was found
    if (task) {
      // Respond with success and the retrieved task
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Task retrieved successfully.",
        data: task,
      });
    }

    // If the task is not found, trigger the error middleware
    return next({ message: "Task not found." });
  },

  /**
   * Controller for updating a task within a project.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  updateTask: async (req, res, next) => {
    const { labelId, task, statusId, description, taskId, assignees } =
      req.body;
    const authorId = parseInt(req.user.id);
    const projectId = parseInt(req.params.projectId);

    // Validate assignees if provided
    if (assignees?.length > 0) {
      const projectMembers = await dataService.getProjectMembers({
        projectId: req.params.projectId,
      });
      const memberIds = projectMembers.map((member) => member.id);

      if (!helpers.isArrayUnique(assignees)) {
        return next({ message: "Cannot assign task redundantly to a member" });
      }

      if (!assignees.every((assignee) => memberIds.includes(assignee))) {
        return next({
          message: "Some assignees not found in the project member list",
        });
      }
    }

    const taskDetails = await projectService.getTaskById({ taskId });

    // Call the project service to update an existing task
    const isUpdated = await projectService.updateTask({
      taskId,
      labelId,
      task,
      statusId,
      assignees,
      updatedBy: req.user.id,
      description,
    });

    // Check if the task update was successful
    if (isUpdated) {
      // Notify assignees about task updates
      if (taskDetails?.assignees.length > 0) {
        await helpers.notifyAssigneesAboutTaskUpdates(
          taskDetails,
          projectId,
          authorId,
          taskDetails?.assignees,
        );
      }

      // Respond with success and information about the update
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Successfully updated task details.",
      });
    }

    // If the task is not found, trigger the error middleware
    throw next({ message: "Failed to update the task." });
  },

  /**
   * Deletes a task by its ID within a project.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} - A promise resolving to the result of the deletion operation.
   * @throws {Error} - Throws an error if the deletion process fails.
   */
  deleteTask: async (req, res, next) => {
    const { projectId, taskId } = req.params;

    const authorId = parseInt(req.user.id);

    const task = await projectService.getTaskById({ taskId });

    // Delete the task by its ID and project ID
    const response = await projectService.deleteTask({
      projectId,
      taskId,
    });

    if (response) {
      if (task.assignee.length > 0) {
        // Notify assignees about the task deletion
        await helpers.notifyAssigneesAboutTaskDeletion(
          task,
          projectId,
          authorId,
        );
      }

      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Task deleted successfully",
      });
    }

    // Propagate an error if the deletion process fails
    throw next({ message: "Failed to delete task" });
  },

  /**
   * Adds a member to a project and sends a JSON response based on the success of the operation.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  addMember: async (req, res, next) => {
    // Extract relevant information from the request body and params
    const { userId, permissionId } = req.body;
    const { projectId } = req.params;
    const authorId = parseInt(req.user.id);

    // Validate user permission to add members
    const project = await helpers.validateIsUserAddAsSuperAdmin({
      next,
      permissionId,
      projectId,
      userId,
    });

    // Retrieve the team ID associated with the project
    const teamId = await project.getTeamId();

    // If no team ID is found, indicate that the project was not found
    if (!teamId) {
      throw next({
        message: "Project not found",
      });
    }

    // Attempt to add the member to the project
    const [member, created] = await projectService.addMember({
      projectId,
      userId,
      teamId,
      permissionId,
    });

    // Check if the member was successfully created
    if (created && member) {
      // Notify the user about the invitation
      const project = await projectService.getProjectById({
        projectId,
      });

      await socketHelper.pushNotification({
        type: "Invite",
        content: `You have been invited to join the project "${project.name}"!`,
        broadcastIds: [userId],
        projectId: project.id,
        author: authorId,
      });

      // Send a successful response if the member is created
      return res.status(httpStatusCode.CREATED).json({
        success: true,
        message: "Member creation successful",
      });
    }

    // If the member is not created (likely already a member), send an error response
    throw next({ message: "This user is already a member" });
  },

  /**
   * Retrieves project members with pagination.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} - Asynchronous function.
   */
  getProjectMembers: async (req, res, next) => {
    // Extract pagination parameters and project ID from request
    const { limit, page } = req.body;
    const { projectId } = req.params;

    // Calculate pagination details
    const pagination = helpers.getCurrentPagination({ page, limit, projectId });

    // Retrieve project members with pagination
    const members = await projectService.getProjectMembers({
      limit: pagination.limit,
      offset: pagination.offset,
      projectId,
    });

    // Send a success response with retrieved project members
    if (members) {
      return res.status(httpStatusCode.OK).json({
        success: true,
        totalRows: members.count,
        message: "Retrieved project members successfully.",
        data: members.rows,
      });
    }

    // If members are not found, trigger the error handler
    throw next({ message: "Failed to find project members." });
  },

  /**
   * Updates a member in a project and sends a JSON response based on the success of the operation.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  updateMember: async (req, res, next) => {
    const { memberId, userId, permissionId } = req.body;
    const { projectId } = req.params;
    const authorId = parseInt(req.user.id);

    // Validate user permission to update member
    const project = await helpers.validateIsUserAddAsSuperAdmin({
      next,
      permissionId,
      projectId,
      userId,
    });

    // Update the member in the project
    const response = await projectService.updateMember({
      projectId,
      memberId,
      permissionId,
    });

    // Check if the member update was successful
    if (response && project) {
      // Notify the user about the permission update
      await socketHelper.pushNotification({
        type: "Mention",
        content: `Your permissions on the project "${project.name}" have been updated.`,
        broadcastIds: [userId],
        projectId: project.id,
        author: authorId,
      });

      // Send a successful response if the member update is successful
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Successfully updated member permission",
      });
    }

    // If the member update fails, send an error response
    throw next({ message: "Member update failed" });
  },

  /**
   * Removes a member from a project.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  removeMember: async (req, res, next) => {
    const { projectId, memberId } = req.params;
    const userId = parseInt(req.query.userId);
    const authorId = parseInt(req.user.id);

    // Retrieve the project by ID
    const project = await projectService.getProjectById({ projectId });

    // Check if the user being removed is an admin of the project
    const isAdmin = await project.checkIsAdmin(userId);

    // If the user is an admin, prevent removing them as a member
    if (isAdmin) {
      throw next({
        message: "Super admin permission can't be removed",
      });
    }

    // Remove the member from the project
    const response = await projectService.removeMember({
      projectId,
      memberId,
    });

    // Check if the member removal was successful
    if (response) {
      // Notify the removed user about their removal from the project
      await socketHelper.pushNotification({
        type: "Mention",
        content: `You have been removed from the project "${project.name}".`,
        broadcastIds: [userId],
        projectId: project.id,
        author: authorId,
      });

      // Send a successful response if the member removal is successful
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Successfully removed member from the project",
      });
    }

    // If the member removal fails, send an error response
    throw next({ message: "Failed to remove member from the project" });
  },

  /**
   * Controller for retrieving team projects with pagination.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getTeamProjects: async (req, res, next) => {
    // Extract pagination parameters and project name from request query
    const { page, limit, name } = req.query;
    const currentPagination = getCurrentPagination({ page, limit });

    // Call the project service to retrieve all projects
    const projects = await projectService.getTeamProjects({
      offset: currentPagination.offset,
      limit: currentPagination.limit,
      teamId: req.params.teamId,
      userId: req.user.id,
      name,
    });

    // Check if project retrieval was successful
    if (projects) {
      // Respond with success and the retrieved projects
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Projects retrieved successfully.",
        totalRows: projects.count,
        data: projects.rows,
      });
    }

    // If project retrieval fails, send an error response
    throw next({ message: "Projects are empty." });
  },

  /**
   * Creates a new label.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  createLabel: async (req, res, next) => {
    // Extract relevant information from the request body
    const { name, color } = req.body;
    const { projectId } = req.params;

    // Attempt to create a new label using the project service
    const response = await projectService.createLabel({
      name,
      color,
      projectId,
    });

    // Check if the label was successfully created
    if (response) {
      // Send a successful response if the permission is created
      return res.status(httpStatusCode.CREATED).json({
        success: true,
        message: "Label created successfully",
        data: response,
      });
    }

    // If the label is not created, send an error response
    throw next({ message: "Label creation failed" });
  },

  /**
   * Retrieves project labels with pagination.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} - Asynchronous function.
   */
  getAllProjectLabels: async (req, res, next) => {
    // Extract pagination parameters and project ID from request
    const { limit, page } = req.body;
    const { projectId } = req.params;

    // Calculate pagination details
    const pagination = helpers.getCurrentPagination({ page, limit, projectId });

    // Retrieve project members with pagination
    const labels = await projectService.getProjectLabels({
      limit: pagination.limit,
      offset: pagination.offset,
      projectId,
    });

    // Send a success response with retrieved project members
    if (labels) {
      return res.status(httpStatusCode.OK).json({
        success: true,
        totalRows: labels.count,
        message: "Retrieved project labels successfully.",
        data: labels.rows,
      });
    }

    // If members are not found, trigger the error handler
    throw next({ message: "Failed to find project labels." });
  },

  /**
   * Update a label by projectId and labelId.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  updateLabel: async (req, res, next) => {
    const { projectId, labelId } = req.params;
    const { name, color } = req.body;

    // Call service to update label
    const response = await projectService.updateLabel({
      name,
      color,
      projectId,
      labelId,
    });

    if (response) {
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Label updated successfully",
      });
    }

    // If update fails, throw an error to be caught by next middleware
    throw next({ message: "Failed to update the Label" });
  },

  /**
   * Delete a label by projectId and labelId.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  deleteLabel: async (req, res, next) => {
    const { projectId, labelId } = req.params;

    // Call service to delete label
    const response = await projectService.deleteLabel({
      projectId,
      labelId,
    });

    if (response) {
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Label deleted successfully",
      });
    }

    // If deletion fails, throw an error to be caught by next middleware
    throw next({ message: "Label deletion failed" });
  },

  /**
   * Creates a new status.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  createStatus: async (req, res, next) => {
    // Extract relevant information from the request body
    const { name, color } = req.body;
    const { projectId } = req.params;

    // Attempt to create a new status using the project service
    const response = await projectService.createStatus({
      name,
      color,
      projectId,
    });

    // Check if the status was successfully created
    if (response) {
      // Send a successful response if the permission is created
      return res.status(httpStatusCode.CREATED).json({
        success: true,
        message: "Status created successfully",
        data: response,
      });
    }

    // If the label is not created, send an error response
    throw next({ message: "Status creation failed" });
  },

  /**
   * Retrieves project statuses with pagination.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} - Asynchronous function.
   */
  getAllProjectStatuses: async (req, res, next) => {
    // Extract pagination parameters and project ID from request
    const { limit, page } = req.body;
    const { projectId } = req.params;

    // Calculate pagination details
    const pagination = helpers.getCurrentPagination({ page, limit, projectId });

    // Retrieve project members with pagination
    const labels = await projectService.getProjectStatuses({
      limit: pagination.limit,
      offset: pagination.offset,
      projectId,
    });

    // Send a success response with retrieved project members
    if (labels) {
      return res.status(httpStatusCode.OK).json({
        success: true,
        totalRows: labels.count,
        message: "Retrieved project statuses successfully.",
        data: labels.rows,
      });
    }

    // If members are not found, trigger the error handler
    throw next({ message: "Failed to find project statuses." });
  },

  /**
   * Update a status by projectId and statusId.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  updateStatus: async (req, res, next) => {
    const { projectId, statusId } = req.params;
    const { name, color } = req.body;

    // Call service to update status
    const response = await projectService.updateStatus({
      name,
      color,
      projectId,
      statusId,
    });

    if (response) {
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Status updated successfully",
      });
    }

    // If update fails, throw an error to be caught by next middleware
    throw next({ message: "Failed to update the status" });
  },

  /**
   * Delete a status by projectId and statusId.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  deleteStatus: async (req, res, next) => {
    const { projectId, statusId } = req.params;

    // Call service to delete status
    const response = await projectService.deleteStatus({
      projectId,
      statusId,
    });

    if (response) {
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Status deleted successfully",
      });
    }

    // If deletion fails, trigger next middleware with an error
    throw next({ message: "Status deletion failed" });
  },

  /**
   * Accepts a project invitation and sends a JSON response based on the success of the operation.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  acceptProjectInvitation: async (req, res, next) => {
    const { projectId } = req.params;
    const userId = parseInt(req.user.id);

    // Call project services to retrieve member ids
    const member = await projectService.getMemberId({ projectId, userId });

    // Check if the user is already a member of the project
    if (member?.id) {
      const [response] = await projectService.updateMember({
        projectId,
        memberId: member.id,
        status: "Member",
      });

      // Check if the member status update was successful
      if (response) {
        return res.status(httpStatusCode.OK).json({
          success: true,
          message: "You have successfully accepted the project invitation.",
        });
      }
    }

    // If the member status update fails, send an error response
    next({ message: "Failed to process the project invitation acceptance." });
  },

  /**
   * Rejects a project invitation and sends a JSON response based on the success of the operation.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  rejectProjectInvitation: async (req, res, next) => {
    const { projectId } = req.params;
    const userId = parseInt(req.user.id);

    // Call project services to retrieve member ids
    const member = await projectService.getMemberId({ projectId, userId });

    // Check if the user is already a member of the project
    if (member?.id) {
      const response = await projectService.removeMember({
        projectId,
        memberId: member.id,
      });

      // Check if the member removal was successful
      if (response) {
        return res.status(httpStatusCode.OK).json({
          success: true,
          message: "You have successfully rejected the project invitation.",
        });
      }
    }

    // If the member removal fails, send an error response
    throw next({
      message: "Failed to process the project invitation rejection.",
    });
  },
};
