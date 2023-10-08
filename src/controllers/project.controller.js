const projectService = require("../services/project.service");

module.exports = {
  createProject: async (req, res) => {
    const { projectName, description, status } = req.body;

    try {
      const project = await projectService.createProject({
        projectName,
        description,
        status,
      });

      if (project === null) return res.status(400);

      return res.json(project);
    } catch (error) {
      res.status(400).json(error);
    }
  },
};
