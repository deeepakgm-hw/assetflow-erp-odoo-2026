const express = require("express");
const employeesController = require("./employees.controller");
const authorize = require("../../../middleware/role.middleware");
const {
  updateRoleValidation,
  updateDepartmentValidation,
  listQueryValidation
} = require("./employees.validation");

const router = express.Router();

router.get("/", listQueryValidation, employeesController.getAll);
router.patch("/:id/role", authorize("Admin"), updateRoleValidation, employeesController.updateRole);
router.patch("/:id/department", authorize("Admin"), updateDepartmentValidation, employeesController.updateDepartment);

module.exports = router;
