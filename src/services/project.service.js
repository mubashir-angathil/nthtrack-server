const { Project } = require("../models/sequelize.model");
const { formattedError } = require("../utils/helpers/helpers");

module.exports = {
  /**
   * Creates a new project in the database.
   * @param {Object} projectDetails - Details of the project.
   * @param {string} projectDetails.projectName - The name of the project.
   * @param {string} projectDetails.description - The description of the project.
   * @param {string} projectDetails.status - The status of the project.
   * @returns {Promise<Object>} - A promise that resolves to the created project.
   * @throws {Error} - Throws an error if the creation fails.
   */
  createProject: async ({ projectName, description, status }) => {
    try {
      const newProject = await Project.create({
        project_name: projectName,
        description,
        status,
      });
      return newProject;
    } catch (error) {
      // If an error occurs during project creation, format and rethrow the error
      throw formattedError(error);
    }
  },
  /**
   * Retrieves all projects from the database with pagination options.
   * @param {Object} paginationOptions - Options for pagination.
   * @param {number} paginationOptions.offset - The offset for pagination.
   * @param {number} paginationOptions.limit - The limit for the number of projects to retrieve.
   * @returns {Promise<Array<Object>>} - A promise that resolves to an array of projects.
   * @throws {Error} - Throws an error if the retrieval fails.
   */
  getAllProjects: async ({ offset, limit }) => {
    try {
      const projects = await Project.findAll({
        offset,
        limit,
      });
      return projects;
    } catch (error) {
      // If an error occurs during project retrieval, format and rethrow the error
      throw formattedError(error);
    }
  },
};
