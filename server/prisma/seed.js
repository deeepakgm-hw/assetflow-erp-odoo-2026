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

  const operations = await prisma.department.upsert({
    where: { name: "Operations" },
    update: {},
    create: { name: "Operations" },
  });

  const design = await prisma.department.upsert({
    where: { name: "Design" },
    update: {},
    create: { name: "Design" },
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

  await prisma.category.upsert({
    where: { name: "Tablet" },
    update: {},
    create: {
      name: "Tablet",
      customFields: { os: "iPadOS" },
    },
  });

  await prisma.category.upsert({
    where: { name: "Projector" },
    update: {},
    create: {
      name: "Projector",
      customFields: { brightness: "3000 Lumens" },
    },
  });

  // ---------------- Admin User ----------------
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
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

  const raj = await prisma.user.upsert({
    where: { email: "raj@assetflow.com" },
    update: {},
    create: {
      name: "Raj Patel",
      email: "raj@assetflow.com",
      passwordHash,
      role: "AssetManager",
      departmentId: operations.id,
    },
  });

  const deepa = await prisma.user.upsert({
    where: { email: "deepa@assetflow.com" },
    update: {},
    create: {
      name: "Deepa Sen",
      email: "deepa@assetflow.com",
      passwordHash,
      role: "DeptHead",
      departmentId: design.id,
    },
  });

  const nishant = await prisma.user.upsert({
    where: { email: "nishant@assetflow.com" },
    update: {},
    create: {
      name: "Nishant Sharma",
      email: "nishant@assetflow.com",
      passwordHash,
      role: "Employee",
      departmentId: engineering.id,
    },
  });

  // ---------------- Assets ----------------
  const assets = [
    {
      id: "AF-0001",
      name: "MacBook Pro M3 Max",
      type: "Laptop",
      serialNumber: "SN-MBP-9872",
      specification: "64GB RAM, 2TB SSD, 16-inch, Space Black",
      department: "Engineering",
      status: "Available",
    },
    {
      id: "AF-0002",
      name: "Dell XPS 15",
      type: "Laptop",
      serialNumber: "SN-DELL-8832",
      specification: "32GB RAM, 1TB SSD, OLED Touch Screen",
      department: "Engineering",
      status: "Allocated",
      currentHolderId: nishant.id,
      allocatedDate: new Date("2026-07-01"),
      expectedReturnDate: new Date("2026-07-31"),
    },
    {
      id: "AF-0003",
      name: "ThinkPad X1 Carbon",
      type: "Laptop",
      serialNumber: "SN-THINK-4411",
      specification: "16GB RAM, 512GB SSD, Ultra-lightweight",
      department: "Design",
      status: "Overdue",
      currentHolderId: deepa.id,
      allocatedDate: new Date("2026-06-10"),
      expectedReturnDate: new Date("2026-07-10"),
    },
    {
      id: "AF-0004",
      name: "LG UltraFine 27\" 4K",
      type: "Monitor",
      serialNumber: "SN-LG-0012",
      specification: "27-inch 4K IPS Panel, USB-C Power Delivery",
      department: "Design",
      status: "Available",
    },
    {
      id: "AF-0005",
      name: "LG UltraFine 27\" 4K",
      type: "Monitor",
      serialNumber: "SN-LG-0013",
      specification: "27-inch 4K IPS Panel, USB-C Power Delivery",
      department: "Engineering",
      status: "Allocated",
      currentHolderId: admin.id,
      allocatedDate: new Date("2026-06-15"),
      expectedReturnDate: new Date("2026-12-15"),
    },
    {
      id: "AF-0006",
      name: "iPad Pro 12.9\" M2",
      type: "Tablet",
      serialNumber: "SN-IPAD-3829",
      specification: "256GB WiFi, Space Gray, Liquid Retina XDR",
      department: "Operations",
      status: "Maintenance",
    },
    {
      id: "AF-0007",
      name: "Epson 4K Projector",
      type: "Projector",
      serialNumber: "SN-EPSON-5522",
      specification: "3000 Lumens, Wireless HDR, Smart TV apps",
      department: "Operations",
      status: "Available",
    },
    {
      id: "AF-0008",
      name: "Aeron Office Chair",
      type: "Furniture",
      serialNumber: "SN-AERON-9921",
      specification: "Size B, Graphite Color, Fully Adjustable Arms",
      department: "Engineering",
      status: "Available",
    },
  ];

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { id: asset.id },
      update: asset,
      create: asset,
    });
  }

  const allocationSeeds = [
    {
      assetId: "AF-0003",
      userId: deepa.id,
      allocatedDate: new Date("2026-06-10"),
      expectedReturnDate: new Date("2026-07-10"),
      status: "Overdue",
    },
    {
      assetId: "AF-0002",
      userId: nishant.id,
      allocatedDate: new Date("2026-07-01"),
      expectedReturnDate: new Date("2026-07-31"),
      status: "Allocated",
    },
    {
      assetId: "AF-0005",
      userId: admin.id,
      allocatedDate: new Date("2026-06-15"),
      expectedReturnDate: new Date("2026-12-15"),
      status: "Allocated",
    },
  ];

  for (const allocation of allocationSeeds) {
    const existing = await prisma.allocation.findFirst({
      where: {
        assetId: allocation.assetId,
        userId: allocation.userId,
        returnedDate: null,
      },
    });

    if (!existing) {
      await prisma.allocation.create({ data: allocation });
    }
  }

  // ---------------- Resources & Bookings ----------------
  const resources = [
    {
      id: "RES-001",
      name: "Boardroom Alpha",
      type: "Room",
      capacity: "14 people",
      location: "Floor 4, West Wing",
      status: "Available",
    },
    {
      id: "RES-002",
      name: "Meeting Room Beta",
      type: "Room",
      capacity: "6 people",
      location: "Floor 2, East Wing",
      status: "Available",
    },
    {
      id: "RES-003",
      name: "Focus Pod Gamma",
      type: "Room",
      capacity: "2 people",
      location: "Floor 1, Quiet Zone",
      status: "Available",
    },
    {
      id: "RES-004",
      name: "Tesla Model Y",
      type: "Vehicle",
      capacity: "5 seats",
      location: "Parking Slot B-12",
      status: "Available",
    },
    {
      id: "RES-005",
      name: "Quest 3 VR Headset",
      type: "Equipment",
      capacity: "1 device",
      location: "IT Storage Cabinet 3",
      status: "Available",
    },
  ];

  for (const resource of resources) {
    await prisma.resource.upsert({
      where: { id: resource.id },
      update: resource,
      create: resource,
    });
  }

  const bookingSeeds = [
    ["RES-001", deepa.id, "2026-07-12", "08:00", "10:00", "Q3 Design Review & Planning Session"],
    ["RES-001", nishant.id, "2026-07-12", "10:00", "11:00", "Daily Frontend standup"],
    ["RES-002", admin.id, "2026-07-12", "09:00", "11:00", "Prisma Schema Review & Setup"],
    ["RES-002", raj.id, "2026-07-12", "11:30", "13:00", "Asset Supplier Coordination Sync"],
    ["RES-004", admin.id, "2026-07-12", "14:00", "16:00", "Client On-site Consultation Visit"],
    ["RES-005", nishant.id, "2026-07-12", "16:00", "18:00", "Metaverse Demo & UX Testing"],
  ];

  for (const [resourceId, userId, date, startTime, endTime, purpose] of bookingSeeds) {
    const existing = await prisma.booking.findFirst({
      where: {
        resourceId,
        userId,
        date: new Date(date),
        startTime,
        endTime,
      },
    });

    if (!existing) {
      await prisma.booking.create({
        data: {
          resourceId,
          userId,
          date: new Date(date),
          startTime,
          endTime,
          purpose,
          status: "Upcoming",
        },
      });
    }
  }

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
