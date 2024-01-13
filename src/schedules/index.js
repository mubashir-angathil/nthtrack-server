// Import required modules
const schedule = require("node-schedule");
const { default: consola } = require("consola");
const indexServices = require("../services/index.services");

// Define and export a function for scheduling a job
module.exports = () => {
  // Schedule a job to run every 15 minutes
  schedule.scheduleJob("0 */15 * * *", async () => {
    try {
      // Execute the function to delete old notifications
      await indexServices.getNotifications();
      consola.success({
        message: "Successfully deleted old notifications:",
        badge: true,
      });
    } catch (error) {
      // Log errors if deleting old notifications fails
      consola.error("Error deleting old notifications:", error);
    }
  });
};
