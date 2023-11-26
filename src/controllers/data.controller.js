const dataService = require("../services/data.service");
const projectService = require("../services/project.service");

module.exports = {
  /**
   * Retrieves a list of trackers and sends a JSON response based on the success of the operation.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getTrackers: async (req, res) => {
    try {
      // Retrieve list of trackers from the data service
      const trackers = await dataService.getTrackers();

      // Check if the retrieval was successful
      if (!trackers) {
        // If not successful, send an error response
        return res
          .status(400)
          .json({ success: false, message: "Failed to retrieve trackers." });
      }

      // Send a successful response with the retrieved data
      return res.json({ success: true, data: trackers });
    } catch (error) {
      // Handle any errors that occurred during the operation
      res
        .status(400)
        .json({ success: false, message: "Error retrieving trackers.", error });
    }
  },
  /**
   * Retrieves a list of status and sends a JSON response based on the success of the operation.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} A promise that resolves once the response is sent.
   */
  getStatuses: async (req, res) => {
    try {
      // Retrieve list of statuses from the data service
      const statuses = await dataService.getStatuses();

      // Check if the retrieval was successful
      if (!statuses) {
        // If not successful, send an error response
        return res
          .status(400)
          .json({ success: false, message: "Failed to retrieve statuses." });
      }

      // Send a successful response with the retrieved data
      return res.json({ success: true, data: statuses });
    } catch (error) {
      // Handle any errors that occurred during the operation
      res
        .status(400)
        .json({ success: false, message: "Error retrieving statuses.", error });
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
    return res.json({
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
    return res.json({
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
    return res.json({
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
      res.json({
        success: true,
        message: "Permission retrieved successfully",
        data: permissions,
      });
    }
  },
};
