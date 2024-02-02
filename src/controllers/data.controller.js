const dataService = require("../services/data.service");
const projectService = require("../services/project.service");
const { httpStatusCode } = require("../utils/constants/Constants");
const { getCurrentPagination } = require("../utils/helpers/helpers");

module.exports = {
  /**
   * Retrieves a list of labels and sends a JSON response based on the success of the operation.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getLabels: async (req, res, next) => {
    const { projectId } = req.params;
    // Retrieve list of labels from the data service
    const labels = await dataService.getLabels({ projectId });

    // Check if the retrieval was successful
    if (!labels) {
      // If not successful, send an error response
      throw next({ message: "Failed to retrieve labels." });
    }

    // Send a successful response with the retrieved data
    return res.status(httpStatusCode.OK).json({ success: true, data: labels });
  },

  /**
   * Retrieves a list of task categories and sends a JSON response based on the success of the operation.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getTaskCategoriesByProjectId: async (req, res, next) => {
    try {
      const { projectId } = req.params;
      // Retrieve list of task categories from the data service
      const statuses = await dataService.getTaskCategoriesByProjectId({
        projectId,
      });

      // Check if the retrieval was successful
      if (!statuses) {
        // If not successful, send an error response
        throw next({
          message: "Failed to retrieve task categories.",
        });
      }

      // Send a successful response with the retrieved data
      return res
        .status(httpStatusCode.OK)
        .json({ success: true, data: statuses });
    } catch (error) {
      // Handle any errors that occurred during the operation
      res.status(400).json({
        success: false,
        message: "Error retrieving categories.",
        error,
      });
    }
  },

  /**
   * Retrieves teams associated with a member and sends a JSON response based on the success of the operation.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getMemberTeams: async (req, res, next) => {
    // Retrieve teams associated with the current user
    const teams = await dataService.getMemberTeams({ userId: req.user.id });

    // Check if the retrieval was successful
    if (!teams) {
      // If not successful, invoke the next middleware with an error
      return next({ success: false, message: "Failed to retrieve teams." });
    }

    // Send a successful response with the retrieved data
    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Successfully retrieved teams",
      data: teams,
    });
  },

  /**
   * Retrieves members of a project and sends a JSON response based on the success of the operation.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getProjectMembers: async (req, res, next) => {
    // Retrieve members of the specified project
    const members = await dataService.getProjectMembers({
      projectId: req.params.projectId,
    });

    // Check if the retrieval was successful
    if (!members) {
      // If not successful, invoke the next middleware with an error
      return next({ message: "Failed to retrieve members." });
    }

    // Send a successful response with the retrieved data
    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Successfully retrieved members",
      data: members,
    });
  },

  /**
   * Retrieves assignees of a task and sends a JSON response based on the success of the operation.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getTaskAssignees: async (req, res, next) => {
    // Retrieve the task by ID
    const tasks = await projectService.getTaskById({
      taskId: req.params.taskId,
    });

    // Retrieve assignees of the task
    const assignees = await tasks.getAssignees();

    // Check if the retrieval was successful
    if (!assignees) {
      // If not successful, invoke the next middleware with an error
      return next({ message: "Failed to retrieve assignees." });
    }

    // Retrieve user data for the assignees
    const users = await dataService.getUsersByIds({ userIds: assignees });

    // Send a successful response with the retrieved data
    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Successfully retrieved assignees",
      data: users,
    });
  },

  /**
   * Retrieves permissions and sends a JSON response based on the success of the operation.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next function.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getPermissions: async (req, res, next) => {
    // Retrieve permissions from the data service
    const permissions = await dataService.getPermissions();

    // Check if the retrieval was successful
    if (permissions) {
      // Send a successful response with the retrieved data
      res.status(httpStatusCode.OK).json({
        success: true,
        message: "Permission retrieved successfully",
        data: permissions,
      });
    }
  },

  /**
   * Retrieves users with optional pagination and search functionality.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - Asynchronous function.
   */
  getUsers: async (req, res, next) => {
    // Extract parameters from the request body
    const { limit, page, searchKey, projectId } = req.body;

    // Calculate pagination based on provided limit and page
    const pagination = getCurrentPagination({ page, limit });

    // Retrieve users based on the provided parameters
    const response = await dataService.getUsers({
      limit: pagination.limit,
      offset: pagination.offset,
      searchKey,
      projectId,
    });

    // Check if users were successfully retrieved
    if (response) {
      // Send a success response with user data and pagination information
      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Successfully retrieved users.",
        totalRows: response.count,
        data: response.rows,
      });
    }

    // If retrieval fails, call the next middleware with an error message
    return next({ message: "Failed to retrieve users." });
  },

  /**
   * Retrieves project IDs in which the user is enrolled.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} - Asynchronous function.
   */
  getEnrolledProjectIds: async (req, res) => {
    // Retrieve enrolled project IDs for the user
    const projectIds = await dataService.getEnrolledProjectIds({
      userId: req.user.id, // Assuming user ID is stored in req.user
    });

    // Send a success response with retrieved project IDs
    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Project IDs retrieved successfully.",
      data: projectIds,
    });
  },
};
