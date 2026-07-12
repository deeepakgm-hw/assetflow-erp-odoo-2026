const express = require("express");
const transfersController = require("./transfers.controller");
const { createTransferValidation, approveTransferValidation } = require("./transfers.validation");
const authenticate = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, transfersController.getAll);
router.post("/", authenticate, createTransferValidation, transfersController.create);
router.patch("/:id/approve", authenticate, approveTransferValidation, transfersController.approve);
router.patch("/:id/reject", authenticate, approveTransferValidation, transfersController.reject);

module.exports = router;
