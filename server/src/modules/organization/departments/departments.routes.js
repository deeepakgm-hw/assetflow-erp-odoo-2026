const express = require("express");
const departmentsController = require("./departments.controller");
const authorize = require("../../../middleware/role.middleware");
const {
  createDepartmentValidation,
  updateDepartmentValidation,
  statusValidation,
  headValidation
} = require("./departments.validation");

const router = express.Router();

router.get("/", departmentsController.getAll);
router.post("/", authorize("Admin"), createDepartmentValidation, departmentsController.create);
router.put("/:id", authorize("Admin"), updateDepartmentValidation, departmentsController.update);
router.delete("/:id", authorize("Admin"), departmentsController.delete);
router.patch("/:id/status", authorize("Admin"), statusValidation, departmentsController.updateStatus);
router.patch("/:id/head", authorize("Admin"), headValidation, departmentsController.updateHead);

module.exports = router;
