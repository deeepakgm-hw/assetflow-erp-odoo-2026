const employeesService = require("./employees.service");
const logActivity = require("../../../helpers/logActivity");

class EmployeesController {
  getAll = async (req, res, next) => {
    try {
      const { search, departmentId, role, page, limit } = req.query;
      const result = await employeesService.getAllEmployees({
        search,
        departmentId,
        role,
        page,
        limit
      });

      return res.status(200).json({
        success: true,
        message: "Employees retrieved successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  updateRole = async (req, res, next) => {
    try {
      const { id } = req.params;
      const idInt = parseInt(id);
      const { role } = req.body;
      const employee = await employeesService.updateRole(idInt, role);

      // Log activity
      await logActivity({
        userId: req.user.id,
        action: `Updated role of employee ${employee.name} to ${role}`,
        entityType: "Employee",
        entityId: employee.id
      });

      return res.status(200).json({
        success: true,
        message: `Employee role updated to ${role} successfully`,
        data: employee
      });
    } catch (error) {
      next(error);
    }
  };

  updateDepartment = async (req, res, next) => {
    try {
      const { id } = req.params;
      const idInt = parseInt(id);
      const { departmentId } = req.body;
      const employee = await employeesService.updateDepartment(idInt, departmentId);

      const deptName = employee.department ? employee.department.name : "None";

      // Log activity
      await logActivity({
        userId: req.user.id,
        action: `Assigned employee ${employee.name} to department: ${deptName}`,
        entityType: "Employee",
        entityId: employee.id
      });

      return res.status(200).json({
        success: true,
        message: "Employee department updated successfully",
        data: employee
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new EmployeesController();
