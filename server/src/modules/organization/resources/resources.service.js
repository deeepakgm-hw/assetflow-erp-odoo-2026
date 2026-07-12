const prisma = require("../../../lib/prisma");

class ResourcesService {
  async getAllResources() {
    return await prisma.resource.findMany({
      orderBy: { id: "asc" }
    });
  }
}

module.exports = new ResourcesService();
