const express = require("express");
const resourcesController = require("./resources.controller");
const authenticate = require("../../../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, resourcesController.getAll);

module.exports = router;
