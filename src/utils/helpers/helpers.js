const { Sequelize } = require("../../models/sequelize.model");
const indexServices = require("../../services/index.services");
const projectService = require("../../services/project.service");
const { socketHelper } = require("../../socket/Helper");
const { httpStatusCode } = require("../constants/Constants");

// /**
//  * Calculate the project progress
//  * @param {Object} projects - The projects containing array of project
//  * @returns {array} - Returns the projects with current progress
//  */

module.exports = {
  /**
   * A function to format a Sequelize SQL error for consistent error handling.
   * @param {Error} error - The original error object.
   * @returns {Object} - A formatted error object containing name, message, and SQL error details.
   */
  formattedError: (error) => {
    const formattedErrorPrototype = {
      getError: function () {
        const data = {
          success: false,
          message: this.error.message || "Something went wrong",
          error: {
            name: this.error.name || "Error",
            query: this.error.sql,
            fieldErrors: this.error.fieldErrors,
          },
        };
        return { data };
      },
    };
    const formattedError = Object.create(formattedErrorPrototype);

    if (error instanceof Sequelize.ValidationError) {
      formattedError.error = {
        message: error.message,
        query: error,
        name: error.name,
      };
      if (error?.errors) {
        formattedError.error.fieldErrors = [];

        error.errors.forEach((item) => {
          const fieldError = {
            field: item.path,
            message: item.message,
          };
          formattedError.error.fieldErrors.push(fieldError);
        });
      }
      return formattedError.getError();
    } else {
      formattedError.error = {
        message: error.message,
      };
    }

    return formattedError.getError();
  },

  /**
   * Get pagination options based on the provided page and limit values.
   * @param {Object} options - Pagination options.
   * @param {number} options.page - The current page.
   * @param {number} options.limit - The number of items per page.
   * @returns {Object} - Pagination configuration with offset and limit.
   */
  getCurrentPagination: ({ page, limit }) => {
    // Check if both page and limit are provided
    if (page && limit) {
      // Parse page and limit to integers
      page = parseInt(page);
      limit = parseInt(limit);

      // Calculate offset based on page and limit
      const pagination = {
        offset: (page - 1) * limit,
        limit,
      };
      return pagination;
    } else {
      // If either page or limit is not provided, set default values
      return {
        offset: page ? parseInt(page) : 0,
        limit: limit ? parseInt(limit) : undefined,
      };
    }
  },

  /**
   * Wraps a controller function with a try-catch block for structured error handling.
   * @function tryCatch
   * @param {Function} controller - The controller function to be wrapped.
   * @returns {Function} - The wrapped controller function.
   */
  tryCatch: (controller) => async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Checks if a specific permission is included in the path based on the HTTP method.
   * @function isPathPermissionIncluded
   * @param {Object} options - The options containing permission, path, and method.
   * @returns {boolean} - Returns true if the permission is included, false otherwise.
   */
  isPathPermissionIncluded: async ({ permission, path, method }) => {
    const keys = path.split(".");
    let current = permission;
    for (const key of keys) {
      if (!current[key]) {
        return false;
      }

      current = current[key];
    }
    return current[method === "PATCH" ? "PUT" : method] === true;
  },

  /**
   * Checks if an array contains only unique elements.
   * @function isArrayUnique
   * @param {Array} arr - The array to be checked for uniqueness.
   * @returns {boolean} - Returns true if all elements are unique, false otherwise.
   */
  isArrayUnique: (arr) => {
    const uniqueSet = new Set(arr);
    return uniqueSet.size === arr.length;
  },

  /**
   * Validates whether a user can be added as a super admin based on project, user, and permission information.
   * @function validateIsUserAddAsSuperAdmin
   * @param {Object} options - The options containing projectId, userId, permissionId, and next.
   * @throws {Error} - Throws an error with specific messages and HTTP codes based on validation results.
   * @returns {Object} - Returns the project if validation is successful.
   */
  validateIsUserAddAsSuperAdmin: async ({
    projectId,
    userId,
    permissionId,
    next,
  }) => {
    const project = await projectService.getProjectById({ projectId });
    const isAdmin = await project.checkIsAdmin(userId);
    const superAdminPermission = await indexServices.getPermissionByName({
      permission: "Super Admin",
    });

    if (isAdmin && superAdminPermission.id !== permissionId) {
      throw next({
        message: "This user is an admin of the project! Add as a super admin.",
        httpCode: httpStatusCode.BAD_REQUEST,
      });
    }

    if (!isAdmin && superAdminPermission.id === permissionId) {
      throw next({
        message: "Can't add multiple super admins",
        httpCode: httpStatusCode.BAD_REQUEST,
      });
    }

    return project;
  },

  /**
   * Get contributor IDs excluding the current user.
   *
   * @param {Object} project - Project object.
   * @param {number} userId - ID of the current user.
   * @returns {Array<number>} An array of contributor IDs.
   */
  getContributorIds: (project, userId) => {
    return project.contributors
      .map((user) => (user.id !== userId ? user.id : undefined))
      .filter((id) => id !== undefined);
  },

  /**
   * Gets the broadcast IDs of assignees, excluding the author.
   *
   * @param {Array} assignees - The array of assignees.
   * @param {number} authorId - The author's user ID.
   * @returns {Array} - An array of broadcast IDs.
   */
  getAssigneesBroadcastIds: (assignees, authorId) => {
    return assignees
      .map((assignee) => (assignee.id !== authorId ? assignee.id : undefined))
      .filter((broadcastId) => broadcastId !== undefined);
  },

  /**
   * Notifies assignees about the deletion of a task.
   *
   * @param {Object} task - The task object.
   * @param {string} projectId - The project ID.
   * @param {number} authorId - The author's user ID.
   * @returns {Promise<void>} - A promise resolving once the notifications are sent.
   */
  notifyAssigneesAboutTaskDeletion: async (task, projectId, authorId) => {
    const broadcastIds = module.exports.getAssigneesBroadcastIds(
      task.assignees,
      authorId,
    );

    await socketHelper.pushNotification({
      type: "General",
      content: `The task "${task.task}" in the project "${task.project.name}" has been deleted.`,
      broadcastIds,
      projectId,
      author: authorId,
    });
  },

  /**
   * Notifies assignees about updates to a task.
   *
   * @param {Object} task - The task object.
   * @param {string} projectId - The project ID.
   * @param {number} authorId - The author's user ID.
   * @param {Array} assignees - The updated array of assignees.
   * @returns {Promise<void>} - A promise resolving once the notifications are sent.
   */
  notifyAssigneesAboutTaskUpdates: async (
    task,
    projectId,
    authorId,
    assignees,
  ) => {
    const assigneesIds = task.assignees.map((assignee) => assignee.id);

    if (assigneesIds.length > assignees?.length) {
      // Some assignees have been unassigned
      const unAssignedAssigneesIds = assigneesIds.filter(
        (assigneeId) => !assignees.includes(assigneeId),
      );
      await socketHelper.pushNotification({
        type: "Mention",
        content: `You have been unassigned from the task "${task.task}" in the project "${task.project.name}".`,
        broadcastIds: unAssignedAssigneesIds,
        projectId,
        author: authorId,
      });
    } else if (assigneesIds.length < assignees.length) {
      // New assignees have been added
      const newAssignees = assignees.filter(
        (assigneesId) => !assigneesIds.includes(assigneesId),
      );

      await socketHelper.pushNotification({
        type: "Mention",
        content: `You have been assigned to the task "${task.task}" in the project "${task.project.name}".`,
        broadcastIds: newAssignees,
        projectId,
        author: authorId,
      });
    } else {
      // Task details have been updated
      await socketHelper.pushNotification({
        type: "Mention",
        content: `Your assigned task "${task.task}" in the project "${task.project.name}" has been updated.`,
        broadcastIds: assigneesIds,
        projectId,
        author: authorId,
      });
    }
  },
};
