const express = require("express");
const cors = require("cors");
const authRoute = require("./routes/auth.routes")
const {connect} = require("./configs/connection/connection.configs")

// Assign express
const app = express();

// Attempt to connect to the database
connect()

// app.use(express.json());
// app.use(
//   express.urlencoded({
//     extended: true,
//   })
// );

app.use(cors({}))
app.use('/auth', authRoute)

module.exports = app;

