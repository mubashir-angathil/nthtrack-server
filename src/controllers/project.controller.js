// Import necessary modules and services
const projectService = require("../services/project.service");
const { getCurrentPagination } = require("../utils/helpers/helpers");

// Exported module containing various controllers for project and task management
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
      return res.json({
        success: true,
        message: "Projects retrieved successfully.",
        totalRows: projects.count,
        data: projects.rows,
      });
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

      // Check the count of open tasks related to the project
      const openTasksCount = await projectService.getOpenTasksCountByProjectId({
        projectId,
      });

      // If there are open tasks, prevent closing the project
      if (openTasksCount !== 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot close the project with open tasks.",
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

  // Controller for creating an task within a project
  createTask: async (req, res) => {
    const { projectId } = req.params;
    const { trackerId, statusId, description } = req.body;

    // Prepare the new task object
    const newTask = {
      description,
      trackerId,
      statusId,
      projectId,
    };

    try {
      // Call the project service to create a new task
      const task = await projectService.createTask(newTask);

      // Check if the task creation was successful
      if (!task) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to create an task." });
      }

      // Respond with success and the created task data
      return res.json({ success: true, data: task });
    } catch (error) {
      // Handle errors during task creation
      res
        .status(400)
        .json({ success: false, message: "Error creating an task.", error });
    }
  },

  // Controller for updating an task within a project
  updateTask: async (req, res) => {
    const { trackerId, statusId, description, taskId } = req.body;

    try {
      // Call the project service to update an existing task
      const updatedTask = await projectService.updateTask({
        taskId,
        trackerId,
        description,
        statusId,
      });

      // Check if the task update was successful
      if (!updatedTask) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to update the task." });
      }

      // Respond with success and information about the update
      return res.json({
        success: true,
        data: [{ updated: Boolean(updatedTask) }],
      });
    } catch (error) {
      // Handle errors during task update
      res
        .status(400)
        .json({ success: false, message: "Error updating the task.", error });
    }
  },

  // Controller for retrieving all tasks within a project with pagination
  getAllTasks: async (req, res) => {
    try {
      // Extract pagination parameters and other filters from request query
      const { page, limit, trackerId, statusId, searchKey } = req.query;
      const { projectId } = req.params;

      // Prepare pagination data
      const currentPagination = getCurrentPagination({
        page,
        limit,
      });

      // Call the project service to retrieve all tasks within a project
      const tasks = await projectService.getAllTasks({
        offset: currentPagination.offset,
        limit: currentPagination.limit,
        projectId,
        trackerId,
        statusId,
        searchKey,
      });

      // Check if task retrieval was successful
      if (!tasks) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to retrieve tasks." });
      }

      // Respond with success and the retrieved tasks
      return res.json({ success: true, data: tasks });
    } catch (error) {
      // Handle errors during task retrieval
      res
        .status(400)
        .json({ success: false, message: "Error retrieving tasks.", error });
    }
  },

  // Controller for retrieving an task by ID within a project
  getTaskById: async (req, res) => {
    try {
      // Extract task ID from request parameters
      const { taskId } = req.params;

      // Call the project service to retrieve an task by ID
      const task = await projectService.getTaskById({ taskId });

      // Check if the task was found
      if (!task) {
        return res
          .status(404)
          .json({ success: false, message: "task not found." });
      }

      // Respond with success and the retrieved task
      return res.json({ success: true, data: task });
    } catch (error) {
      // Handle errors during task retrieval by ID
      res
        .status(500)
        .json({ success: false, message: "Internal server error.", error });
    }
  },

  // Controller for closing an task by ID within a project
  closeTaskById: async (req, res) => {
    try {
      // Extract task ID from request body
      const { taskId } = req.body;

      // Update the task status to closed
      const updateTask = await projectService.updateTask({
        taskId,
        statusId: 2, // Assuming 2 represents the 'closed' status
      });

      // Close the task
      const task = await projectService.closeTaskById({ taskId });

      // Check if the task was successfully updated and closed
      if (!updateTask || !task) {
        return res.status(404).json({
          success: false,
          message: "task not found or already closed.",
        });
      }

      // Respond with success message
      return res.json({
        success: true,
        message: "task closed successfully.",
      });
    } catch (error) {
      // Handle errors during task closure
      res
        .status(500)
        .json({ success: false, message: "Internal server error.", error });
    }
  },
};
