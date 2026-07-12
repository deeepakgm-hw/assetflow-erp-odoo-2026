const express = require("express");
const departmentsController = require("./departments.controller");
const {
  createDepartmentValidation,
  updateDepartmentValidation,
  statusValidation,
  headValidation
} = require("./departments.validation");

const router = express.Router();

router.get("/", departmentsController.getAll);
router.post("/", createDepartmentValidation, departmentsController.create);
router.put("/:id", updateDepartmentValidation, departmentsController.update);
router.delete("/:id", departmentsController.delete);
router.patch("/:id/status", statusValidation, departmentsController.updateStatus);
router.patch("/:id/head", headValidation, departmentsController.updateHead);

module.exports = router;
