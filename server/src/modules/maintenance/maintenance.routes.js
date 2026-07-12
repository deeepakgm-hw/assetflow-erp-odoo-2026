const express = require("express");
const controller = require("./maintenance.controller");
const upload = require("../../middleware/upload");

const router = express.Router();

// POST /api/maintenance-requests — raise a new request (supports photo upload)
router.post("/", upload.single("photo"), controller.createRequest);

// GET /api/maintenance-requests — grouped by status (kanban)
router.get("/", controller.listRequests);

// GET /api/maintenance-requests/asset/:assetId — history for a specific asset
router.get("/asset/:assetId", controller.getAssetHistory);

// PATCH /api/maintenance-requests/:id/approve
router.patch("/:id/approve", controller.approveRequest);

// PATCH /api/maintenance-requests/:id/reject
router.patch("/:id/reject", controller.rejectRequest);

// PATCH /api/maintenance-requests/:id/assign — assign technician (body: { technicianId })
router.patch("/:id/assign", controller.assignTechnician);

// PATCH /api/maintenance-requests/:id/progress — move to InProgress
router.patch("/:id/progress", controller.markInProgress);

// PATCH /api/maintenance-requests/:id/resolve — mark as Resolved
router.patch("/:id/resolve", controller.resolveRequest);

module.exports = router;
