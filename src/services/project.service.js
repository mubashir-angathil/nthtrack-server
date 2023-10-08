const { Project } = require("../models/sequelize.model");
const { formattedError } = require("../utils/helpers/helpers");

module.exports = {
  createProject: async ({ projectName, description, status }) => {
    try {
      const newProject = await Project.create({
        project_name: projectName,
        description,
        status,
      });
      return newProject;
    } catch (error) {
      throw formattedError(error);
    }
  },
};
