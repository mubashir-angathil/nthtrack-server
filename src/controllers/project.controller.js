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
    const { projectName, description, statusId } = req.body;

    try {
      const project = await projectService.createProject({
        projectName,
        description,
        statusId,
      });

      if (!project) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to create project." });
      }

      return res.json({ success: true, data: project });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error creating project.", error });
    }
  },
  updateProject: async (req, res) => {
    const { projectName, description, statusId, projectId } = req.body;

    try {
      const updatedProject = await projectService.updateProject({
        projectId,
        projectName,
        description,
        statusId,
      });

      if (!updatedProject) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to update the project." });
      }

      return res.json({
        success: true,
        data: [{ updated: Boolean(updatedProject) }],
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error updating the project.",
        error,
      });
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
      const { page, limit, projectName } = req.query;
      const currentPagination = getCurrentPagination({ page, limit });
      const projects = await projectService.getAllProjects({
        offset: currentPagination.offset,
        limit: currentPagination.limit,
        projectName,
      });

      if (!projects) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to retrieve projects." });
      }

      return res.json({ success: true, data: projects });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error retrieving projects.", error });
    }
  },

  /**
   * Controller method for retrieving a project by ID.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} - A promise representing the completion of the operation.
   */
  getProjectById: async (req, res) => {
    try {
      const { projectId } = req.params;
      const project = await projectService.getProjectById({ projectId });

      if (!project) {
        return res
          .status(404)
          .json({ success: false, message: "Project not found." });
      }

      return res.json({ success: true, data: project });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error retrieving project.", error });
    }
  },
  /**
   * Controller method for closing a project by ID.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} - A promise representing the completion of the operation.
   */
  closeProjectById: async (req, res) => {
    try {
      const { projectId } = req.body;

      const openIssuesCount =
        await projectService.getOpenIssuesCountByProjectId({
          projectId,
        });

      if (openIssuesCount !== 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot close project with open issues.",
        });
      }

      const updatedProject = await projectService.updateProject({
        projectId,
        statusId: 2,
      }); // as per statuses table id of closed is 2

      const closeProject = await projectService.closeProjectById({ projectId });

      if (!updatedProject || !closeProject) {
        return res.status(404).json({
          success: false,
          message: "Project not found or already closed.",
        });
      }

      return res.json({
        success: true,
        message: "Project closed successfully.",
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error.", error });
    }
  },

  /**
   * Controller method for creating an issue within a project.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} - A promise representing the completion of the operation.
   */
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

      if (!issue) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to create issue." });
      }

      return res.json({ success: true, data: issue });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error creating issue.", error });
    }
  },

  /**
   * Controller method for retrieving all issues within a project with pagination.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} - A promise representing the completion of the operation.
   */
  getAllIssues: async (req, res) => {
    try {
      const { page, limit } = req.query;
      const { projectId } = req.params;

      const currentPagination = getCurrentPagination({ page, limit });
      const issues = await projectService.getAllIssues({
        offset: currentPagination.offset,
        limit: currentPagination.limit,
        projectId,
      });

      if (!issues) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to retrieve issues." });
      }

      return res.json({ success: true, data: issues });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error retrieving issues.", error });
    }
  },

  /**
   * Controller method for retrieving an issue by ID.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} - A promise representing the completion of the operation.
   */
  getIssueById: async (req, res) => {
    try {
      const { issueId } = req.params;
      const issue = await projectService.getIssueById({ issueId });

      if (!issue) {
        return res
          .status(404)
          .json({ success: false, message: "Issue not found." });
      }

      return res.json({ success: true, data: issue });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error.", error });
    }
  },

  /**
   * Controller method for closing an issue by ID.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} - A promise representing the completion of the operation.
   */
  closeIssueById: async (req, res) => {
    try {
      const { issueId } = req.body;
      const issue = await projectService.closeIssueById({ issueId });

      if (issue) {
        return res.json({
          success: true,
          message: "Issue closed successfully.",
        });
      }

      return res.status(404).json({
        success: false,
        message: "Issue not found or already closed.",
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error.", error });
    }
  },
};
