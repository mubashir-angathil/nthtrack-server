const database = require("../../models/sequelize.model");
const configs = require("../configs");

// Initialize database connection
module.exports = () =>
  database.sequelize
    .sync()
    .then(() =>
      console.log(`✅ Database synced successfully (${configs.DATABASE})`),
    )
    .catch((err) => console.error("Error syncing database:", err));
