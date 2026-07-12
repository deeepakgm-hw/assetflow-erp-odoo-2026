const bcrypt = require("bcrypt");
const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AssetFlow database...");

  // ---------------- Departments ----------------
  const engineering = await prisma.department.upsert({
    where: { name: "Engineering" },
    update: {},
    create: { name: "Engineering" },
  });

  const hr = await prisma.department.upsert({
    where: { name: "HR" },
    update: {},
    create: { name: "HR" },
  });

  const finance = await prisma.department.upsert({
    where: { name: "Finance" },
    update: {},
    create: { name: "Finance" },
  });

  // ---------------- Categories ----------------
  await prisma.category.upsert({
    where: { name: "Laptop" },
    update: {},
    create: {
      name: "Laptop",
      customFields: { warranty: "3 Years" },
    },
  });

  await prisma.category.upsert({
    where: { name: "Monitor" },
    update: {},
    create: {
      name: "Monitor",
      customFields: { size: "27 Inch" },
    },
  });

  await prisma.category.upsert({
    where: { name: "Furniture" },
    update: {},
    create: {
      name: "Furniture",
      customFields: { material: "Wood" },
    },
  });

  // ---------------- Admin User ----------------
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  await prisma.user.upsert({
    where: { email: "admin@assetflow.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@assetflow.com",
      passwordHash,
      role: "Admin",
      departmentId: engineering.id,
    },
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
