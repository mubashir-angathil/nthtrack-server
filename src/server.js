const app = require("./app")
const configs = require("./configs/configs")
const syncDatabase = require("./configs/connection/connection.configs")
const PORT = configs.PORT || 4000

syncDatabase()
    .then(() => {
        // Listening app
        app.listen(PORT || 8000, () => {
            console.log(`🚀 Server started on port ${PORT} !!`)
        })
    }).catch(err => console.error(err))


