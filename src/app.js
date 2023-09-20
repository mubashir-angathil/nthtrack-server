const express = require("express");
const cors = require("cors");
const authRoute = require("./routes/auth.routes")

// Assign express
const app = express();


// app.use(express.json());
// app.use(
//   express.urlencoded({
//     extended: true,
//   })
// );

app.use(cors({}))
app.use('/auth', authRoute)

module.exports = app;

