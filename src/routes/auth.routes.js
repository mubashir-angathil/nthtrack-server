const express = require('express');
const route = express.Router();

route.get('/', (req, res, next) => {
    res.status(200).json({
        success: 'Welcome to issue tracker',
        status: 200
    });
})

module.exports = route