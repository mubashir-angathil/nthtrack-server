
const database = require("../../models/sequelize.modals")
const configs = require("../configs")
// Initialize database connection
const syncDatabase = async () => {
    return database.sequelize.sync()
        .then(() => console.log(`✅ Database synced successfully (${configs.DATABASE})`))
        .catch(err => console.error('Error syncing database:', err))
}
module.exports = syncDatabase