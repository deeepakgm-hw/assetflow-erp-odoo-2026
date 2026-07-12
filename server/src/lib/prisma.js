const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

module.exports = prisma;
