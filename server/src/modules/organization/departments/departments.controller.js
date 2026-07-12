const departmentsService = require("./departments.service");
const logActivity = require("../../../helpers/logActivity");

class DepartmentsController {
  getAll = async (req, res, next) => {
    try {
      const departments = await departmentsService.getAllDepartments();
      return res.status(200).json({
        success: true,
        message: "Departments retrieved successfully",
        data: departments
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const { name, parentDepartmentId, headId } = req.body;
      const dept = await departmentsService.createDepartment({ name, parentDepartmentId, headId });

      // Log activity
      await logActivity({
        userId: req.user.id,
        action: `Created department: ${dept.name}`,
        entityType: "Department",
        entityId: dept.id
      });

      return res.status(201).json({
        success: true,
        message: "Department created successfully",
        data: dept
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const idInt = parseInt(id);
      const { name, parentDepartmentId, headId } = req.body;
      const dept = await departmentsService.updateDepartment(idInt, { name, parentDepartmentId, headId });

      // Log activity
      await logActivity({
        userId: req.user.id,
        action: `Updated department: ${dept.name}`,
        entityType: "Department",
        entityId: dept.id
      });

      return res.status(200).json({
        success: true,
        message: "Department updated successfully",
        data: dept
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const idInt = parseInt(id);
      await departmentsService.deleteDepartment(idInt);

      // Log activity
      await logActivity({
        userId: req.user.id,
        action: `Deleted department with ID: ${idInt}`,
        entityType: "Department",
        entityId: idInt
      });

      return res.status(200).json({
        success: true,
        message: "Department deleted successfully",
        data: { id: idInt }
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const idInt = parseInt(id);
      const { status } = req.body;
      const dept = await departmentsService.updateStatus(idInt, status);

      // Log activity
      await logActivity({
        userId: req.user.id,
        action: `Changed department ${dept.name} status to ${status}`,
        entityType: "Department",
        entityId: dept.id
      });

      return res.status(200).json({
        success: true,
        message: `Department status updated to ${status} successfully`,
        data: dept
      });
    } catch (error) {
      next(error);
    }
  };

  updateHead = async (req, res, next) => {
    try {
      const { id } = req.params;
      const idInt = parseInt(id);
      const { headId } = req.body;
      const dept = await departmentsService.updateHead(idInt, headId);

      // Log activity
      await logActivity({
        userId: req.user.id,
        action: `Assigned head for department ${dept.name}`,
        entityType: "Department",
        entityId: dept.id
      });

      return res.status(200).json({
        success: true,
        message: "Department head updated successfully",
        data: dept
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new DepartmentsController();
