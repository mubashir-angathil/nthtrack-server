// Import necessary modules and services
const projectService = require("../services/project.service");
const { getCurrentPagination } = require("../utils/helpers/helpers");
const { httpStatusCode } = require("../utils/constants/Constants");
const dataService = require("../services/data.service");
const helpers = require("../utils/helpers/helpers");
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

    // Retrieve the default "Opened" status
    const openStatus = await projectService.getStatus({ name: "opened" });

    // Check if the status was found
    if (!openStatus?.id) {
      next({ message: "Status not found!" });
    }

    // Call the project service to create a new project
    const project = await projectService.createProject({
      name,
      description,
      statusId: openStatus.id,
      createdBy: req.user.id,
    });

    // Check if the project creation was successful
    if (!project) {
      next({ message: "Failed to create a project." });
    }

    // Respond with success and the created project data
    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: project,
    });
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
    const { name, description, statusId, projectId } = req.body;

    // Call the project service to update an existing project
    const updatedProject = await projectService.updateProject({
      projectId,
      name,
      description,
      statusId,
    });

    // Check if the project update was successful
    if (!updatedProject) {
      return next({ message: "Failed to update the project." });
    }

    // Respond with success and information about the update
    res.json({
      success: true,
      message: "Successfully updated project details.",
      data: [{ updated: Boolean(updatedProject) }],
    });
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
    if (!projects) {
      throw next({ message: "projects are empty." });
    }

    // Respond with success and the retrieved projects
    return res.json({
      success: true,
      message: "Projects retrieved successfully.",
      totalRows: projects.count,
      data: projects.rows,
    });
  },

  /**
   * Controller for retrieving a project by ID.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getProjectById: async (req, res) => {
    try {
      // Extract project ID from request parameters
      const { projectId } = req.params;

      // Call the project service to retrieve a project by ID
      const project = await projectService.getProjectById({ projectId });

      // Check if the project was found
      if (!project) {
        return res
          .status(404)
          .json({ success: false, message: "Project not found." });
      }

      // Respond with success and the retrieved project
      return res.json({
        success: true,
        message: "Project retrieved successfully.",
        data: project,
      });
    } catch (error) {
      // Handle errors during project retrieval by ID
      res.status(400).json({
        success: false,
        message: "Error retrieving the project.",
        error,
      });
    }
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
    // Extract project ID from request body
    const { projectId } = req.params;

    // Check the count of open tasks related to the project
    const openTasksCount = await projectService.getOpenTasksCountByProjectId({
      projectId,
    });

    // If there are open tasks, prevent closing the project
    if (openTasksCount !== 0) {
      return next({
        httpCode: 400,
        message: "Cannot close the project with open tasks.",
      });
    }

    // Update the project status to closed
    const updatedProject = await projectService.updateProject({
      projectId,
      statusId: 2, // Assuming 2 represents the 'closed' status
    });

    // Close the project
    const closeProject = await projectService.closeProjectById({ projectId });

    // Check if the project was successfully updated and closed
    if (!updatedProject || !closeProject) {
      return next({
        message: "Project not found or already closed.",
      });
    }

    // Respond with success message
    return res.status(200).json({
      success: true,
      message: "Project closed successfully.",
    });
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
    const { projectId } = req.params;
    const { trackerId, description, assignees } = req.body;

    // Assuming "Opened" is the default status name
    const openStatus = await projectService.getStatus({ name: "opened" });

    if (!openStatus?.id) {
      throw new Error("Status not found!");
    }

    // Prepare the new task object
    const newTask = {
      description,
      trackerId,
      projectId: parseInt(projectId),
      statusId: openStatus.id,
      createdBy: req.user.id,
      assignees,
    };

    if (assignees?.length > 0) {
      // Get project members
      const projectMembers = await dataService.getProjectMembers({ projectId });
      const memberIds = projectMembers.map((member) => member.id);

      if (!helpers.isArrayUnique(assignees)) {
        return next({
          message: "Cannot assign task redundantly to a member",
        });
      }

      if (!assignees.every((assignee) => memberIds.includes(assignee))) {
        // Validate assignees against project members
        return next({
          message: "Some assignees not found in the project member list",
        });
      }
    }

    // Call the project service to create a new task
    const task = await projectService.createTask(newTask);

    // Check if the task creation was successful
    if (!task) {
      return next({
        message: "Failed to create a task.",
      });
    }

    // Respond with success and the created task data
    return res.json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
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
    const { trackerId, description, taskId, assignees } = req.body;

    if (assignees?.length > 0) {
      // Get project members
      const projectMembers = await dataService.getProjectMembers({
        projectId: req.params.projectId,
      });
      const memberIds = projectMembers.map((member) => member.id);

      if (!helpers.isArrayUnique(assignees)) {
        return next({
          message: "Cannot assign task redundantly to a member",
        });
      }

      if (!assignees.every((assignee) => memberIds.includes(assignee))) {
        // Validate assignees against project members
        return next({
          message: "Some assignees not found in the project member list",
        });
      }
    }

    // Call the project service to update an existing task
    const updatedTask = await projectService.updateTask({
      taskId,
      trackerId,
      assignees,
      updatedBy: req.user.id,
      description,
    });

    // Check if the task update was successful
    if (!updatedTask) {
      next({ message: "Failed to update the task." });
    }

    // Respond with success and information about the update
    return res.status(200).json({
      success: true,
      message: "Successfully updated task details.",
      data: [{ updated: Boolean(updatedTask) }],
    });
  },

  /**
   * Controller for retrieving all tasks within a project with pagination.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getAllTasks: async (req, res) => {
    try {
      // Extract pagination parameters and other filters from request query
      const { page, limit, trackerId, statusId, searchKey } = req.query;
      const { projectId } = req.params;

      // Prepare pagination data
      const currentPagination = getCurrentPagination({
        page,
        limit,
      });

      // Call the project service to retrieve all tasks within a project
      const tasks = await projectService.getAllTasks({
        offset: currentPagination.offset,
        limit: currentPagination.limit,
        projectId,
        trackerId,
        statusId,
        searchKey,
      });

      // Check if task retrieval was successful
      if (!tasks) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to retrieve tasks." });
      }

      // Respond with success and the retrieved tasks
      return res.json({
        success: true,
        message: "Tasks retrieved successfully.",
        totalRows: tasks.count,
        data: tasks.rows,
      });
    } catch (error) {
      // Handle errors during task retrieval
      res
        .status(400)
        .json({ success: false, message: "Error retrieving tasks.", error });
    }
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
      return res.json({
        success: true,
        message: "Task retrieved successfully.",
        data: task,
      });
    }

    return next({ message: "Task not found." });
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
    const updatedPermission = await projectService.updatePermission({
      name,
      json,
      permissionId,
    });

    // Check if the permission update was successful
    if (!updatedPermission) {
      return next({ message: "Failed to update the permission." });
    }
    // Respond with success and information about the update
    return res.json({
      success: true,
      message: "Successfully updated permission details.",
      data: [{ updated: Boolean(updatedPermission) }],
    });
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
    if (!projects) {
      throw next({ message: "Projects are empty." });
    }

    // Respond with success and the retrieved projects
    return res.json({
      success: true,
      message: "Projects retrieved successfully.",
      totalRows: projects.count,
      data: projects.rows,
    });
  },

  /**
   * Controller for closing a task by ID within a project.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  closeTaskById: async (req, res, next) => {
    // Extract task ID from request parameters
    const { taskId } = req.params;

    // Retrieve the 'closed' status
    const closedStatus = await projectService.getStatus({ name: "closed" });

    if (!closedStatus?.id) {
      return next({ message: "Status not found" });
    }

    // Update the task status to 'closed'
    const isTaskUpdated = await projectService.updateTask({
      taskId,
      closedBy: req.user.id,
      statusId: closedStatus.id,
    });

    // Check if the task was successfully updated and closed
    if (!isTaskUpdated) {
      return next({ message: "Task not updated" });
    }

    // Close the task
    const isTaskClosed = await projectService.closeTaskById({ taskId });

    // Check if the task was successfully closed
    if (!isTaskClosed) {
      return next({ message: "Task not found or already closed" });
    }

    // Respond with a success message
    return res.status(200).json({
      success: true,
      message: "Task is closed successfully",
    });
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
        httpCode: httpStatusCode.BAD_REQUEST,
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
   * Updates  member to a project and sends a JSON response based on the success of the operation.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  updateMember: async (req, res, next) => {
    const { memberId, userId, permissionId } = req.body;
    const { projectId } = req.params;

    await helpers.validateIsUserAddAsSuperAdmin({
      next,
      permissionId,
      projectId,
      userId,
    });

    const response = await projectService.updateMember({
      projectId,
      memberId,
      permissionId,
    });

    if (response) {
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Successfully updated member permission",
      });
    }

    next({ message: "Member updates failed" });
  },

  /**
   * Remove  member from  project.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  removeMember: async (req, res, next) => {
    const { projectId, memberId } = req.params;
    const { userId } = req.query;
    // Retrieve the project by ID
    const project = await projectService.getProjectById({ projectId });

    // Check if the user being added is an admin of the project
    const isAdmin = await project.checkIsAdmin(parseInt(userId));
    // If the user is an admin, prevent adding them as a member
    if (isAdmin) {
      throw next({
        message: "Super admin permission can't be remove",
        httpCode: httpStatusCode.BAD_REQUEST,
      });
    }

    const response = await projectService.removeMember({
      projectId,
      memberId,
    });

    if (response) {
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Successfully removed member from project",
      });
    }

    next({ message: "Failed to remove member from the project" });
  },

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
    const response = await projectService.createPermission({ name, json });

    // Check if the permission was successfully created
    if (response) {
      // Send a successful response if the permission is created
      return res.status(httpStatusCode.CREATED).json({
        success: true,
        message: "Permission created successfully",
      });
    }

    // If the permission is not created, send an error response
    next({ message: "Permission creation failed" });
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
      return res.status(200).json({
        success: true,
        totalRows: members.count,
        message: "Retrieved project members successfully.",
        data: members.rows,
      });
    }

    // If members are not found, trigger the error handler
    next({ message: "Failed to find project members." });
  },

  /**
   * Marks notifications as read for the authenticated user.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} - Asynchronous function.
   */
  markNotificationAsRead: async (req, res, next) => {
    // Extract notificationIds from the request body
    const { notificationIds } = req.body;

    // Call the service to update notifications as read
    const markAsRead = await projectService.updateNotification({
      notificationIds,
      userId: req.user.id,
    });

    // Send a success response if notifications are marked as read
    if (markAsRead) {
      return res.status(200).json({
        success: true,
        message: "Notifications marked as read successfully.",
      });
    }

    // If marking as read fails, trigger the error handler
    next({ message: "Failed to mark notifications as read." });
  },

  /**
   * Restores a project by its ID, updating its status to 'Opened'.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} - A promise resolving to the result of the restoration operation.
   * @throws {Error} - Throws an error if the restoration process fails.
   */
  restoreProject: async (req, res, next) => {
    const { projectId } = req.params;

    // Retrieve the 'Opened' status
    const openedStatus = await projectService.getStatus({ name: "Opened" });
    if (!openedStatus?.id) return next({ message: "Status not found" });

    // Restore the closed project
    const reopenClosedProject = await projectService.restoreProject({
      projectId,
    });

    if (reopenClosedProject) {
      // Update the project status to 'Opened'
      const isProjectUpdated = await projectService.updateProject({
        projectId,
        closedBy: null,
        statusId: openedStatus.id,
      });

      if (isProjectUpdated) {
        return res.status(200).json({
          success: true,
          message: "Project successfully reopened",
        });
      }
    }

    // Propagate an error if the reopening process fails
    next({
      message: "Project reopening failed",
    });
  },

  /**
   * Restores a closed task by its ID, updating its status to 'Opened'.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} - A promise resolving to the result of the restoration operation.
   * @throws {Error} - Throws an error if the restoration process fails.
   */
  restoreClosedTask: async (req, res, next) => {
    const { taskId, projectId } = req.params;

    // Retrieve the 'Opened' status
    const openedStatus = await projectService.getStatus({ name: "Opened" });
    if (!openedStatus?.id) return next({ message: "Status not found" });

    // Restore the closed task
    const reopenClosedTask = await projectService.restoreClosedTask({
      taskId,
      projectId,
    });

    if (reopenClosedTask) {
      // Update the task status to 'Opened'
      const isTaskUpdated = await projectService.updateTask({
        taskId,
        closedBy: null,
        statusId: openedStatus.id,
      });

      if (isTaskUpdated) {
        return res.status(200).json({
          success: true,
          message: "Task successfully reopened",
        });
      }
    }

    // Propagate an error if the reopening process fails
    next({
      message: "Task reopening failed",
    });
  },

  /**
   * Deletes a project by its ID.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} - A promise resolving to the result of the deletion operation.
   * @throws {Error} - Throws an error if the deletion process fails.
   */
  deleteProject: async (req, res, next) => {
    const { projectId } = req.params;

    // Delete the project by its ID
    const response = await projectService.deleteProject({ projectId });

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      });
    }

    // Propagate an error if the deletion process fails
    next({ message: "Failed to delete project" });
  },

  /**
   * Deletes a task by its ID within a project.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   * @returns {Promise<void>} - A promise resolving to the result of the deletion operation.
   * @throws {Error} - Throws an error if the deletion process fails.
   */
  deleteTask: async (req, res, next) => {
    const { projectId, taskId } = req.params;

    // Delete the task by its ID and project ID
    const response = await projectService.deleteTask({ projectId, taskId });

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    }

    // Propagate an error if the deletion process fails
    next({ message: "Failed to delete task" });
  },
};
