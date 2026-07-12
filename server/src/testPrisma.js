const prisma = require("./lib/prisma");

async function test() {
  try {
    await prisma.$connect();
    console.log("✅ Database Connected Successfully");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
