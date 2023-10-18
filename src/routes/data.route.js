const express = require("express");
const router = express.Router();

const dataController = require("../controllers/data.controller");
const verifyToken = require("../middlewares/verifyToken.middleware");

/**
 * Route for retrieving trackers. Requires a valid token for authentication.
 * GET /api/trackers
 */
router.get("/trackers", verifyToken, dataController.getTrackers);

/**
 * Route for retrieving statuses. Requires a valid token for authentication.
 * GET /api/statuses
 */
router.get("/statuses", verifyToken, dataController.getStatuses);

module.exports = router;
