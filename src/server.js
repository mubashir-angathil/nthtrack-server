const app = require("./app")
const configs = require("./configs/configs")

const PORT = configs.PORT || 4000

// Listening app
app.listen(PORT || 8000 , () => {
    console.log(`🚀 Server started on port ${PORT} !!`)
})

