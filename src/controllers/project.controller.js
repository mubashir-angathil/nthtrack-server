const projectService = require("../services/project.service");
const { getCurrentPagination } = require("../utils/helpers/helpers");

module.exports = {
  /**
   * Controller method for creating a new project.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} - A promise representing the completion of the operation.
   */
  createProject: async (req, res) => {
    // Extract pagination parameters from the query string
    const { projectName, description, status } = req.body;

    try {
      const project = await projectService.createProject({
        projectName,
        description,
        status,
      });

      // Check if project creation was successful
      if (project === null) return res.status(400);

      return res.json(project);
    } catch (error) {
      // Handle errors by sending a 400 status with the error details
      res.status(400).json(error);
    }
  },
  /**
   * Controller method for retrieving all projects with pagination.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} - A promise representing the completion of the operation.
   */
  getAllProjects: async (req, res) => {
    try {
      // Extract pagination parameters from the query string
      const { page, limit } = req.query;

      // Calculate pagination options using the utility function
      const currentPagination = getCurrentPagination({ page, limit });

      // Retrieve projects with pagination options
      const project = await projectService.getAllProjects({
        offset: currentPagination.offset,
        limit: currentPagination.limit,
      });

      // Check if project retrieval was successful
      if (project === null) return res.status(400);

      return res.json(project);
    } catch (error) {
      // Handle errors by sending a 400 status with the error details
      res.status(400).json(error);
    }
  },
};
