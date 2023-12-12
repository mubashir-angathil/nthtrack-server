const app = require("./app");
const configs = require("./configs/configs");
const syncDatabase = require("./configs/connection/connection.config");
const { consola } = require("consola");
const http = require("http");
const socketServer = require("./socket/socket");

const startServer = async () => {
  try {
    const PORT = configs.PORT;

    // Set up server
    const httpServer = http.createServer(app);

    // Sync database
    await syncDatabase();

    // Attach the Socket.IO server to the HTTP server
    socketServer.attach(httpServer);

    // Listening app
    httpServer.listen(PORT, () => {
      consola.success({
        message: `🚀 Server started on port ${PORT} !!`,
        badge: true,
      });
    });
  } catch (error) {
    consola.error({ message: error, badge: true });
  }
};

// Call the async function
startServer();
