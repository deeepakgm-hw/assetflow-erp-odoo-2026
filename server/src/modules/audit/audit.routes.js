const express = require("express");
const controller = require("./audit.controller");

const router = express.Router();

// POST /api/audit-cycles — create a new audit cycle
router.post("/", controller.createCycle);

// GET /api/audit-cycles — list all cycles with discrepancy info
router.get("/", controller.listCycles);

// GET /api/audit-cycles/:id — get a single cycle with all items
router.get("/:id", controller.getCycle);

// PATCH /api/audit-cycles/:id/items/:itemId — mark item Verified/Missing/Damaged
router.patch("/:id/items/:itemId", controller.updateItem);

// GET /api/audit-cycles/:id/discrepancies — get discrepancy report for a cycle
router.get("/:id/discrepancies", controller.getDiscrepancyReport);

// POST /api/audit-cycles/:id/close — lock cycle and update asset statuses
router.post("/:id/close", controller.closeCycle);

module.exports = router;
