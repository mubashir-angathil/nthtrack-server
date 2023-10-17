// Import necessary modules and services
const projectService = require("../services/project.service");
const { getCurrentPagination } = require("../utils/helpers/helpers");

// Exported module containing various controllers for project and issue management
module.exports = {
  // Controller for creating a new project
  createProject: async (req, res) => {
    const { projectName, description, statusId } = req.body;

    try {
      // Call the project service to create a new project
      const project = await projectService.createProject({
        projectName,
        description,
        statusId,
      });

      // Check if the project creation was successful
      if (!project) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to create a project." });
      }

      // Respond with success and the created project data
      return res.json({ success: true, data: project });
    } catch (error) {
      // Handle errors during project creation
      res
        .status(400)
        .json({ success: false, message: "Error creating a project.", error });
    }
  },

  // Controller for updating an existing project
  updateProject: async (req, res) => {
    const { projectName, description, statusId, projectId } = req.body;

    try {
      // Call the project service to update an existing project
      const updatedProject = await projectService.updateProject({
        projectId,
        projectName,
        description,
        statusId,
      });

      // Check if the project update was successful
      if (!updatedProject) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to update the project." });
      }

      // Respond with success and information about the update
      return res.json({
        success: true,
        data: [{ updated: Boolean(updatedProject) }],
      });
    } catch (error) {
      // Handle errors during project update
      res.status(400).json({
        success: false,
        message: "Error updating the project.",
        error,
      });
    }
  },

  // Controller for retrieving all projects with pagination
  getAllProjects: async (req, res) => {
    try {
      // Extract pagination parameters and project name from request query
      const { page, limit, projectName } = req.query;
      const currentPagination = getCurrentPagination({ page, limit });

      // Call the project service to retrieve all projects
      const projects = await projectService.getAllProjects({
        offset: currentPagination.offset,
        limit: currentPagination.limit,
        projectName,
      });

      // Check if project retrieval was successful
      if (!projects) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to retrieve projects." });
      }

      // Respond with success and the retrieved projects
      return res.json({ success: true, data: projects });
    } catch (error) {
      // Handle errors during project retrieval
      res
        .status(400)
        .json({ success: false, message: "Error retrieving projects.", error });
    }
  },

  // Controller for retrieving a project by ID
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
      return res.json({ success: true, data: project });
    } catch (error) {
      // Handle errors during project retrieval by ID
      res.status(400).json({
        success: false,
        message: "Error retrieving the project.",
        error,
      });
    }
  },

  // Controller for closing a project by ID
  closeProjectById: async (req, res) => {
    try {
      // Extract project ID from request body
      const { projectId } = req.body;

      // Check the count of open issues related to the project
      const openIssuesCount =
        await projectService.getOpenIssuesCountByProjectId({
          projectId,
        });

      // If there are open issues, prevent closing the project
      if (openIssuesCount !== 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot close the project with open issues.",
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
        return res.status(404).json({
          success: false,
          message: "Project not found or already closed.",
        });
      }

      // Respond with success message
      return res.json({
        success: true,
        message: "Project closed successfully.",
      });
    } catch (error) {
      // Handle errors during project closure
      res
        .status(500)
        .json({ success: false, message: "Internal server error.", error });
    }
  },

  // Controller for creating an issue within a project
  createIssue: async (req, res) => {
    const { projectId } = req.params;
    const { trackerId, statusId, description } = req.body;

    // Prepare the new issue object
    const newIssue = {
      description,
      tracker_id: trackerId,
      status_id: statusId,
      project_id: projectId,
    };

    try {
      // Call the project service to create a new issue
      const issue = await projectService.createIssue(newIssue);

      // Check if the issue creation was successful
      if (!issue) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to create an issue." });
      }

      // Respond with success and the created issue data
      return res.json({ success: true, data: issue });
    } catch (error) {
      // Handle errors during issue creation
      res
        .status(400)
        .json({ success: false, message: "Error creating an issue.", error });
    }
  },

  // Controller for updating an issue within a project
  updateIssue: async (req, res) => {
    const { trackerId, statusId, description, issueId } = req.body;

    try {
      // Call the project service to update an existing issue
      const updatedIssue = await projectService.updateIssue({
        issueId,
        trackerId,
        description,
        statusId,
      });

      // Check if the issue update was successful
      if (!updatedIssue) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to update the issue." });
      }

      // Respond with success and information about the update
      return res.json({
        success: true,
        data: [{ updated: Boolean(updatedIssue) }],
      });
    } catch (error) {
      // Handle errors during issue update
      res
        .status(400)
        .json({ success: false, message: "Error updating the issue.", error });
    }
  },

  // Controller for retrieving all issues within a project with pagination
  getAllIssues: async (req, res) => {
    try {
      // Extract pagination parameters and other filters from request query
      const { page, limit, trackerId, statusId, searchKey } = req.query;
      const { projectId } = req.params;

      // Prepare pagination data
      const currentPagination = getCurrentPagination({
        page,
        limit,
      });

      // Call the project service to retrieve all issues within a project
      const issues = await projectService.getAllIssues({
        offset: currentPagination.offset,
        limit: currentPagination.limit,
        projectId,
        trackerId,
        statusId,
        searchKey,
      });

      // Check if issue retrieval was successful
      if (!issues) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to retrieve issues." });
      }

      // Respond with success and the retrieved issues
      return res.json({ success: true, data: issues });
    } catch (error) {
      // Handle errors during issue retrieval
      res
        .status(400)
        .json({ success: false, message: "Error retrieving issues.", error });
    }
  },

  // Controller for retrieving an issue by ID within a project
  getIssueById: async (req, res) => {
    try {
      // Extract issue ID from request parameters
      const { issueId } = req.params;

      // Call the project service to retrieve an issue by ID
      const issue = await projectService.getIssueById({ issueId });

      // Check if the issue was found
      if (!issue) {
        return res
          .status(404)
          .json({ success: false, message: "Issue not found." });
      }

      // Respond with success and the retrieved issue
      return res.json({ success: true, data: issue });
    } catch (error) {
      // Handle errors during issue retrieval by ID
      res
        .status(500)
        .json({ success: false, message: "Internal server error.", error });
    }
  },

  // Controller for closing an issue by ID within a project
  closeIssueById: async (req, res) => {
    try {
      // Extract issue ID from request body
      const { issueId } = req.body;

      // Update the issue status to closed
      const updateIssue = await projectService.updateIssue({
        issueId,
        statusId: 2, // Assuming 2 represents the 'closed' status
      });

      // Close the issue
      const issue = await projectService.closeIssueById({ issueId });

      // Check if the issue was successfully updated and closed
      if (!updateIssue || !issue) {
        return res.status(404).json({
          success: false,
          message: "Issue not found or already closed.",
        });
      }

      // Respond with success message
      return res.json({
        success: true,
        message: "Issue closed successfully.",
      });
    } catch (error) {
      // Handle errors during issue closure
      res
        .status(500)
        .json({ success: false, message: "Internal server error.", error });
    }
  },
};
