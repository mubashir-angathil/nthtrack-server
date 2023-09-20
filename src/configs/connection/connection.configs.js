
const database = require("../../models/sequelize.models")
const configs = require("../configs")

// Initialize database connection
module.exports = () => {
    return database.sequelize.sync()
        .then(() => console.log(`✅ Database synced successfully (${configs.DATABASE})`))
        .catch(err => console.error('Error syncing database:', err))
}