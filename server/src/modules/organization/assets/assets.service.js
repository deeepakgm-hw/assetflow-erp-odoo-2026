const prisma = require("../../../lib/prisma");

class AssetsService {
  async getAllAssets() {
    return await prisma.asset.findMany({
      include: {
        currentHolder: {
          select: {
            id: true,
            name: true,
            email: true,
            departmentId: true,
            department: true
          }
        }
      },
      orderBy: { id: "asc" }
    });
  }
}

module.exports = new AssetsService();
