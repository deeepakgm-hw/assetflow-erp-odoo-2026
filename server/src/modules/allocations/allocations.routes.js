const express = require("express");
const allocationsController = require("./allocations.controller");
const { allocateAssetValidation, returnAssetValidation } = require("./allocations.validation");
const authenticate = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, allocationsController.getAll);
router.post("/", authenticate, allocateAssetValidation, allocationsController.allocate);
router.post("/:id/return", authenticate, returnAssetValidation, allocationsController.returnAsset);

module.exports = router;
