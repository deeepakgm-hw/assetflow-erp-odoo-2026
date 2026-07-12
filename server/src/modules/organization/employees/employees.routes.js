const express = require("express");
const employeesController = require("./employees.controller");
const {
  updateRoleValidation,
  updateDepartmentValidation,
  listQueryValidation
} = require("./employees.validation");

const router = express.Router();

router.get("/", listQueryValidation, employeesController.getAll);
router.patch("/:id/role", updateRoleValidation, employeesController.updateRole);
router.patch("/:id/department", updateDepartmentValidation, employeesController.updateDepartment);

module.exports = router;
