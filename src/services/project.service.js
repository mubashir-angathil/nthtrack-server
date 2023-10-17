// Import Sequelize models and helper functions
const { Project, Issue } = require("../models/sequelize.model");
const { formattedError } = require("../utils/helpers/helpers");
const { Op } = require("sequelize");

// Exported module containing functions for project and issue management
module.exports = {
  /**
   * Function to create a new project.
   *
   * @param {Object} projectData - The project data, including projectName, description, and statusId.
   * @returns {Promise<Object>} - A promise resolving to the created project.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  createProject: async ({ projectName, description, statusId }) => {
    try {
      // Use Sequelize model to create a new project
      const newProject = await Project.create({
        project_name: projectName,
        status_id: statusId,
        description,
      });
      return newProject;
    } catch (error) {
      // Handle errors and format the error message
      throw formattedError(error);
    }
  },

  /**
   * Function to update an existing project.
   *
   * @param {Object} projectData - The project data, including projectName, description, statusId, and projectId.
   * @returns {Promise<Object>} - A promise resolving to the updated project.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  updateProject: async ({ projectName, description, statusId, projectId }) => {
    try {
      // Use Sequelize model to update an existing project
      const [updatedProject] = await Project.update(
        {
          project_name: projectName,
          status_id: statusId,
          description,
        },
        {
          where: { id: projectId },
        },
      );
      return updatedProject;
    } catch (error) {
      // Handle errors and format the error message
      throw formattedError(error);
    }
  },

  /**
   * Function to get all projects with optional pagination and filtering by name.
   *
   * @param {Object} options - Options for pagination and filtering, including offset, limit, and projectName.
   * @returns {Promise<Array>} - A promise resolving to an array of projects.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  getAllProjects: async ({ offset, limit, projectName }) => {
    try {
      // Define a where clause based on the presence of projectName
      const whereClause = projectName
        ? { project_name: { [Op.like]: `%${projectName}%` } }
        : undefined;

      // Use Sequelize model to retrieve all projects
      const projects = await Project.findAll({
        offset,
        limit,
        paranoid: false, // Include soft-deleted records
        where: whereClause,
      });

      return projects;
    } catch (error) {
      // Handle errors and format the error message
      throw formattedError(error);
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
      const project = await Project.findByPk(projectId, { paranoid: false });
      return project;
    } catch (error) {
      // Handle errors and format the error message
      throw formattedError(error);
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
      throw formattedError(error);
    }
  },

  /**
   * Function to create a new issue within a project.
   *
   * @param {Object} newIssue - The new issue data.
   * @returns {Promise<Object>} - A promise resolving to the created issue.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  createIssue: async (newIssue) => {
    try {
      // Use Sequelize model to create a new issue
      const issue = await Issue.create(newIssue);
      return issue;
    } catch (error) {
      // Handle errors and format the error message
      throw formattedError(error);
    }
  },

  /**
   * Function to update an issue within a project.
   *
   * @param {Object} options - Options including the issueId, trackerId, description, and statusId.
   * @returns {Promise<Object>} - A promise resolving to the updated issue.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  updateIssue: async ({ issueId, trackerId, description, statusId }) => {
    try {
      // Use Sequelize model to update an existing issue
      const [updatedIssue] = await Issue.update(
        {
          tracker_id: trackerId,
          status_id: statusId,
          description,
        },
        {
          where: { id: issueId },
        },
      );
      return updatedIssue;
    } catch (error) {
      // Handle errors and format the error message
      throw formattedError(error);
    }
  },

  /**
   * Function to get all issues within a project with optional filters and pagination.
   *
   * @param {Object} options - Options including offset, limit, trackerId, statusId, searchKey, and projectId.
   * @returns {Promise<Array>} - A promise resolving to an array of issues.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  getAllIssues: async ({
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
        project_id: projectId,
        tracker_id: trackerId || undefined,
        status_id: statusId || undefined,
      };

      // Add a search filter if searchKey is provided
      if (searchKey) {
        whereClause.description = { [Op.like]: `%${searchKey}%` };
      }

      // Use Sequelize model to retrieve all issues within a project
      const issues = await Issue.findAll({
        where: whereClause,
        offset,
        limit,
        paranoid: false, // Include soft-deleted records
      });

      return issues;
    } catch (error) {
      // Handle errors and format the error message
      throw formattedError(error);
    }
  },

  /**
   * Function to get an issue by ID within a project.
   *
   * @param {Object} options - Options including the issueId.
   * @returns {Promise<Object>} - A promise resolving to the retrieved issue.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  getIssueById: async ({ issueId }) => {
    try {
      // Use Sequelize model to retrieve an issue by ID
      const issue = await Issue.findByPk(issueId, { paranoid: false });
      return issue;
    } catch (error) {
      // Handle errors and format the error message
      throw formattedError(error);
    }
  },

  /**
   * Function to close an issue by ID within a project (soft delete).
   *
   * @param {Object} options - Options including the issueId.
   * @returns {Promise<Object>} - A promise resolving to the closed issue.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  closeIssueById: async ({ issueId }) => {
    try {
      // Use Sequelize model to soft delete an issue by setting deletedAt
      const issue = await Issue.destroy({
        where: { id: issueId },
      });
      return issue;
    } catch (error) {
      // Handle errors and format the error message
      throw formattedError(error);
    }
  },

  /**
   * Function to get the count of open issues within a project.
   *
   * @param {Object} options - Options including the projectId.
   * @returns {Promise<number>} - A promise resolving to the count of open issues.
   * @throws {Object} - Throws a formatted error in case of failure.
   */
  getOpenIssuesCountByProjectId: async ({ projectId }) => {
    try {
      // Use Sequelize model to count open issues based on the absence of closedAt
      const issuesCount = await Issue.count({
        where: {
          project_id: projectId,
          closedAt: { [Op.eq]: null },
        },
      });
      return issuesCount;
    } catch (error) {
      // Handle errors and format the error message
      throw formattedError(error);
    }
  },
};
