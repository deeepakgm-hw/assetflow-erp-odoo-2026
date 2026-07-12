const prisma = require("../../lib/prisma");

class ActivityService {
  async getAllActivityLogs({ search, entityType, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (entityType) {
      where.entityType = entityType;
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } }
            ]
          }
        }
      ];
    }

    const [logs, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { timestamp: "desc" }
      }),
      prisma.activityLog.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }
}

module.exports = new ActivityService();
