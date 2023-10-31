const app = require("./app");
const configs = require("./configs/configs");
const syncDatabase = require("./configs/connection/connection.config");
const { consola } = require("consola");

const startServer = async () => {
  try {
    // Sync database
    await syncDatabase();

    const PORT = configs.PORT;

    // Listening app
    app.listen(PORT, () => {
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
