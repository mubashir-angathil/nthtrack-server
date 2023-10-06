const app = require("./app");
const configs = require("./configs/configs");
const syncDatabase = require("./configs/connection/connection.config");

// Sync database
syncDatabase()
  .then(() => {
    const PORT = configs.PORT || 4000;

    // Listening app
    app.listen(PORT || 8000, () => {
      console.info(`🚀 Server started on port ${PORT} !!`);
    });
  })
  .catch((err) => console.error(err));
