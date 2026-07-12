const prisma = require("../../../lib/prisma");

class DepartmentsService {
  async getAllDepartments() {
    return await prisma.department.findMany({
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        },
        parentDepartment: {
          select: {
            id: true,
            name: true
          }
        },
        childDepartments: {
          select: {
            id: true,
            name: true
          }
        },
        users: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async createDepartment({ name, parentDepartmentId, headId }) {
    // Check unique name
    const existing = await prisma.department.findUnique({
      where: { name }
    });
    if (existing) {
      const error = new Error("Department name must be unique");
      error.statusCode = 409;
      throw error;
    }

    // Check parent exists
    if (parentDepartmentId) {
      const parent = await prisma.department.findUnique({
        where: { id: parentDepartmentId }
      });
      if (!parent) {
        const error = new Error("Parent department not found");
        error.statusCode = 404;
        throw error;
      }
    }

    // Check head active
    if (headId) {
      const headUser = await prisma.user.findUnique({
        where: { id: headId }
      });
      if (!headUser) {
        const error = new Error("Employee assigned as head not found");
        error.statusCode = 404;
        throw error;
      }
      if (headUser.status !== "Active") {
        const error = new Error("Cannot assign inactive employee as head");
        error.statusCode = 400;
        throw error;
      }

      // Check unique head constraint (User can head at most one department)
      const currentHeaded = await prisma.department.findUnique({
        where: { headId }
      });
      if (currentHeaded) {
        const error = new Error("This employee is already heading another department");
        error.statusCode = 409;
        throw error;
      }
    }

    return await prisma.department.create({
      data: {
        name,
        parentDepartmentId,
        headId,
        status: "Active"
      },
      include: {
        head: true,
        parentDepartment: true
      }
    });
  }

  async updateDepartment(id, { name, parentDepartmentId, headId }) {
    const dept = await prisma.department.findUnique({
      where: { id }
    });
    if (!dept) {
      const error = new Error("Department not found");
      error.statusCode = 404;
      throw error;
    }

    // Check unique name
    if (name && name !== dept.name) {
      const existing = await prisma.department.findUnique({
        where: { name }
      });
      if (existing) {
        const error = new Error("Department name must be unique");
        error.statusCode = 409;
        throw error;
      }
    }

    // Check parent and circular hierarchy
    if (parentDepartmentId) {
      if (parentDepartmentId === id) {
        const error = new Error("A department cannot be its own parent");
        error.statusCode = 400;
        throw error;
      }
      const parent = await prisma.department.findUnique({
        where: { id: parentDepartmentId }
      });
      if (!parent) {
        const error = new Error("Parent department not found");
        error.statusCode = 404;
        throw error;
      }

      const circular = await this.wouldCreateCircularHierarchy(id, parentDepartmentId);
      if (circular) {
        const error = new Error("Cannot create circular parent hierarchy");
        error.statusCode = 400;
        throw error;
      }
    }

    // Check head active
    if (headId && headId !== dept.headId) {
      const headUser = await prisma.user.findUnique({
        where: { id: headId }
      });
      if (!headUser) {
        const error = new Error("Employee assigned as head not found");
        error.statusCode = 404;
        throw error;
      }
      if (headUser.status !== "Active") {
        const error = new Error("Cannot assign inactive employee as head");
        error.statusCode = 400;
        throw error;
      }

      // Check unique head constraint
      const currentHeaded = await prisma.department.findUnique({
        where: { headId }
      });
      if (currentHeaded && currentHeaded.id !== id) {
        const error = new Error("This employee is already heading another department");
        error.statusCode = 409;
        throw error;
      }
    }

    return await prisma.department.update({
      where: { id },
      data: {
        name,
        parentDepartmentId: parentDepartmentId !== undefined ? parentDepartmentId : dept.parentDepartmentId,
        headId: headId !== undefined ? headId : dept.headId
      },
      include: {
        head: true,
        parentDepartment: true
      }
    });
  }

  async deleteDepartment(id) {
    const dept = await prisma.department.findUnique({
      where: { id }
    });
    if (!dept) {
      const error = new Error("Department not found");
      error.statusCode = 404;
      throw error;
    }

    // Standard cascade behavior (nullify links first to prevent breaking DB schemas)
    await prisma.$transaction([
      prisma.user.updateMany({
        where: { departmentId: id },
        data: { departmentId: null }
      }),
      prisma.department.updateMany({
        where: { parentDepartmentId: id },
        data: { parentDepartmentId: null }
      }),
      prisma.department.delete({
        where: { id }
      })
    ]);

    return { id };
  }

  async updateStatus(id, status) {
    const dept = await prisma.department.findUnique({
      where: { id }
    });
    if (!dept) {
      const error = new Error("Department not found");
      error.statusCode = 404;
      throw error;
    }

    return await prisma.department.update({
      where: { id },
      data: { status }
    });
  }

  async updateHead(id, headId) {
    const dept = await prisma.department.findUnique({
      where: { id }
    });
    if (!dept) {
      const error = new Error("Department not found");
      error.statusCode = 404;
      throw error;
    }

    if (headId) {
      const headUser = await prisma.user.findUnique({
        where: { id: headId }
      });
      if (!headUser) {
        const error = new Error("Employee assigned as head not found");
        error.statusCode = 404;
        throw error;
      }
      if (headUser.status !== "Active") {
        const error = new Error("Cannot assign inactive employee as head");
        error.statusCode = 400;
        throw error;
      }

      // Check unique head constraint
      const currentHeaded = await prisma.department.findUnique({
        where: { headId }
      });
      if (currentHeaded && currentHeaded.id !== id) {
        const error = new Error("This employee is already heading another department");
        error.statusCode = 409;
        throw error;
      }
    }

    return await prisma.department.update({
      where: { id },
      data: { headId },
      include: { head: true }
    });
  }

  async wouldCreateCircularHierarchy(departmentId, parentId) {
    if (!parentId) return false;
    if (departmentId === parentId) return true;

    let currentParentId = parentId;
    while (currentParentId) {
      const parent = await prisma.department.findFirst({
        where: { id: currentParentId },
        select: { parentDepartmentId: true }
      });

      if (!parent) break;
      if (parent.parentDepartmentId === departmentId) {
        return true;
      }
      currentParentId = parent.parentDepartmentId;
    }
    return false;
  }
}

module.exports = new DepartmentsService();
