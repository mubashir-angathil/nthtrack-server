const { Project, Issue } = require("../models/sequelize.model");
const { formattedError } = require("../utils/helpers/helpers");
const { Op } = require("sequelize");

module.exports = {
  createProject: async ({ projectName, description, statusId }) => {
    try {
      const newProject = await Project.create({
        project_name: projectName,
        status_id: statusId,
        description,
      });
      return newProject;
    } catch (error) {
      throw formattedError(error);
    }
  },
  updateProject: async ({ projectName, description, statusId, projectId }) => {
    try {
      const [updatedProject] = await Project.update(
        {
          project_name: projectName,
          status_id: statusId,
          description,
        },
        {
          where: {
            id: projectId,
          },
        },
      );
      return updatedProject;
    } catch (error) {
      throw formattedError(error);
    }
  },
  getAllProjects: async ({ offset, limit, projectName }) => {
    try {
      const whereClause = {};

      if (projectName) {
        whereClause.project_name = {
          [Op.like]: `%${projectName}%`,
        };
      }

      const projects = await Project.findAll({
        offset,
        limit,
        paranoid: false,
        where: whereClause,
      });
      return projects;
    } catch (error) {
      throw formattedError(error);
    }
  },
  getProjectById: async ({ projectId }) => {
    try {
      const project = await Project.findByPk(projectId, { paranoid: false });
      return project;
    } catch (error) {
      throw formattedError(error);
    }
  },
  closeProjectById: async ({ projectId }) => {
    try {
      const project = await Project.destroy({
        where: {
          id: projectId,
        },
      });
      return project;
    } catch (error) {
      throw formattedError(error);
    }
  },
  createIssue: async (newIssue) => {
    try {
      const newProject = await Issue.create(newIssue);
      return newProject;
    } catch (error) {
      throw formattedError(error);
    }
  },
  getAllIssues: async ({ offset, limit, projectId }) => {
    try {
      const issues = await Issue.findAll({
        where: {
          project_id: projectId,
        },
        offset,
        limit,
        paranoid: false,
      });
      return issues;
    } catch (error) {
      throw formattedError(error);
    }
  },
  getIssueById: async ({ issueId }) => {
    try {
      const issues = await Issue.findByPk(issueId, { paranoid: false });
      return issues;
    } catch (error) {
      throw formattedError(error);
    }
  },
  closeIssueById: async ({ issueId }) => {
    try {
      const issue = await Issue.destroy({
        where: {
          id: issueId,
        },
      });
      return issue;
    } catch (error) {
      throw formattedError(error);
    }
  },
  getOpenIssuesCountByProjectId: async ({ projectId }) => {
    try {
      const issuesCount = await Issue.count({
        where: {
          project_Id: projectId,
          closedAt: {
            [Op.eq]: null,
          },
        },
      });
      return issuesCount;
    } catch (error) {
      throw formattedError(error);
    }
  },
};
