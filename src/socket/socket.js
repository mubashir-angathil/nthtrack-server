// socket.js

// Import required modules
const { Server } = require("socket.io");
const { consola } = require("consola");
// const dataService = require("../services/data.service");
// const indexServices = require("../services/index.services");

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
  socket.on("join-room", async ({ roomIds, broadcastIds }) => {
    // Join the specified rooms
    socket.join(roomIds);
    // Get the new notification count asynchronously
    // const newNotificationCount = await dataService.getNotificationCount({
    //   roomIds,
    //   broadcastIds,
    // });

    // Emit the new notification count to the connected socket
    socket.emit("push-notifications", 1);
  });

  // Handle disconnection event
  socket.on("disconnect", () => {
    // Log disconnection information
    consola.info({ message: "disconnected", badge: false });
  });
});

// Export the Socket.IO server instance
module.exports = io;
