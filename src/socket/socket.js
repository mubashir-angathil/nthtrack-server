// socket.js

// Import required modules
const { Server } = require("socket.io");
const { consola } = require("consola");
const dataService = require("../services/data.service");
const projectService = require("../services/project.service");

// Create a new Socket.IO server instance with CORS configuration
const io = new Server(null, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Handle connection event
io.on("connection", (socket) => {
  // Log the connection information
  consola.success({
    message: `🔗 Socket connected on Id (${socket.id}) !!`,
    badge: true,
  });

  // Handle joining a room event
  socket.on("join-room", async ({ roomIds, userId }) => {
    // Join the specified rooms
    socket.join(roomIds);

    // Get the new notification count asynchronously
    const newNotificationCount = await dataService.getNotificationCount({
      roomIds,
      userId,
    });

    // Emit the new notification count to the connected socket
    socket.emit("receive-notifications", newNotificationCount);
  });

  // Handle pushing a notification event
  socket.on("push-notification", async ({ message, userId, broadcastId }) => {
    // Check the validity of the input data
    if (
      typeof broadcastId === "number" &&
      typeof message === "string" &&
      typeof userId === "number"
    ) {
      try {
        // Create a new notification and broadcast the count to the room
        await projectService.createNotification({
          message,
          broadcastId,
          createdBy: userId,
        });
        socket.to(broadcastId).emit("receive-notifications", 1);
      } catch (err) {
        // Log errors if notification creation fails
        consola.log(err);
      }
    }
  });

  // Handle disconnection event
  socket.on("disconnect", () => {
    // Log disconnection information
    consola.info({ message: "disconnected", badge: false });
  });
});

// Export the Socket.IO server instance
module.exports = io;
