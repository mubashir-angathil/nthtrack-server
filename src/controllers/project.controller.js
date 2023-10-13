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
      if (project === null) return res.status(400).json(project);

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
      if (project === null) return res.status(400).json(project);

      return res.json(project);
    } catch (error) {
      // Handle errors by sending a 400 status with the error details
      res.status(400).json(error);
    }
  },

  createIssue: async (req, res) => {
    const { projectId } = req.params;
    const { trackerId, statusId, description } = req.body;

    const newIssue = {
      description,
      tracker_id: trackerId,
      status_id: statusId,
      project_id: projectId,
    };
    try {
      const issue = await projectService.createIssue(newIssue);

      // Check if issue creation was not successful
      if (issue === null) {
        return res.status(400).json(issue);
      }

      return res.json(issue);
    } catch (error) {
      // Handle errors by sending a 400 status with the error details
      res.status(400).json(error);
    }
  },
  getAllIssues: async (req, res) => {
    try {
      // Extract pagination parameters from the query string
      const { page, limit } = req.query;
      const { projectId } = req.params;

      const currentPagination = getCurrentPagination({ page, limit });

      const issues = await projectService.getAllIssues({
        offset: currentPagination.offset,
        limit: currentPagination.limit,
        projectId,
      });

      if (issues === null) return res.res.status(400).json(issues);

      return res.json(issues);
    } catch (error) {
      // Handle errors by sending a 400 status with the error details
      res.status(400).json(error);
    }
  },
  getIssueById: async (req, res) => {
    try {
      const { issueId } = req.params;

      const issue = await projectService.getIssueById({ issueId });

      if (issue === null) return res.status(400).json(issue);

      return res.json(issue);
    } catch (error) {
      // Handle errors by sending a 400 status with the error details
      res.status(400).json(error);
    }
  },
  getProjectById: async (req, res) => {
    try {
      const { projectId } = req.params;

      const project = await projectService.getProjectById({ projectId });

      if (project === null) return res.status(400).json(project);

      return res.json(project);
    } catch (error) {
      // Handle errors by sending a 400 status with the error details
      res.status(400).json(error);
    }
  },
};
