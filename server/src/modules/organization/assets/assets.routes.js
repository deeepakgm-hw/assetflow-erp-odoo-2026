const express = require("express");
const assetsController = require("./assets.controller");
const authenticate = require("../../../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, assetsController.getAll);

module.exports = router;
