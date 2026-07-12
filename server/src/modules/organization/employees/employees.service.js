const prisma = require("../../../lib/prisma");

class EmployeesService {
  async getAllEmployees({ search, departmentId, role, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (role) {
      where.role = role;
    }

    if (departmentId !== undefined) {
      where.departmentId = departmentId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }

    const [employees, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          departmentId: true,
          department: {
            select: {
              id: true,
              name: true
            }
          },
          createdAt: true,
          updatedAt: true
        },
        skip,
        take: limit,
        orderBy: { name: "asc" }
      }),
      prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      employees,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  async updateRole(id, role) {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    if (!user) {
      const error = new Error("Employee not found");
      error.statusCode = 404;
      throw error;
    }

    return await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async updateDepartment(id, departmentId) {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    if (!user) {
      const error = new Error("Employee not found");
      error.statusCode = 404;
      throw error;
    }

    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId }
      });
      if (!department) {
        const error = new Error("Department not found");
        error.statusCode = 404;
        throw error;
      }
    }

    return await prisma.user.update({
      where: { id },
      data: { departmentId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });
  }
}

module.exports = new EmployeesService();
