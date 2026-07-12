// Mock Prisma client singleton before requiring services
const prismaMock = {
  category: {
    findUnique: async ({ where }) => {
      console.log(`🔍 [Mock Prisma] category.findUnique called for ID: ${where.id}`);
      if (where.id === 999) return null; // category not found test case
      return { id: where.id, name: "Mock Laptop", customFields: { warranty: "3 Years" } };
    },
    findMany: async () => {
      console.log("🔍 [Mock Prisma] category.findMany called");
      return [
        { id: 1, name: "Mock Laptop" }
      ];
    }
  },
  department: {
    findUnique: async ({ where }) => {
      console.log(`🔍 [Mock Prisma] department.findUnique called for ID: ${where.id}`);
      if (where.id === 999) return null; // department not found test case
      return { id: where.id, name: "Mock Engineering" };
    },
    findMany: async () => {
      console.log("🔍 [Mock Prisma] department.findMany called");
      return [
        { id: 1, name: "Engineering" },
        { id: 2, name: "HR" }
      ];
    }
  },
  activityLog: {
    create: async ({ data }) => {
      console.log("🔍 [Mock Prisma] activityLog.create called with:", data);
      return { id: 123, ...data, timestamp: new Date() };
    },
    findMany: async (args) => {
      console.log("🔍 [Mock Prisma] activityLog.findMany called");
      return [];
    }
  }
};

// Override config/prisma exports in require cache
const path = require("path");
const prismaPath = path.resolve(__dirname, "./config/prisma.js");
require.cache[prismaPath] = {
  id: prismaPath,
  filename: prismaPath,
  loaded: true,
  exports: prismaMock
};

const assert = require("assert");
const fs = require("fs");
const assetService = require("./services/asset.service");
const dashboardService = require("./services/dashboard.service");

// Clear existing assets mock file first
const dbPath = path.join(__dirname, "uploads/assets.json");
if (fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([]));
}

async function runTests() {
  console.log("🧪 Starting Backend Service Logic Tests...");

  // 1. Create Asset (using snake_case parameters)
  console.log("\n--- Test: Create Asset ---");
  const asset1 = await assetService.createAsset({
    name: "MacBook Pro 16",
    serial_number: "SN-MAC-12345",
    acquisition_cost: "2499.99",
    category_id: "1",
    department_id: "1",
    is_bookable: true
  }, null, 42);

  assert.strictEqual(asset1.name, "MacBook Pro 16");
  assert.strictEqual(asset1.serialNumber, "SN-MAC-12345");
  assert.strictEqual(asset1.purchaseCost, 2499.99);
  assert.strictEqual(asset1.assetTag, "AF-0001"); // Custom Tag Generation Check
  assert.strictEqual(asset1.isBookable, true); // Bookable field check
  assert.strictEqual(asset1.category.name, "Mock Laptop");
  assert.strictEqual(asset1.department.name, "Mock Engineering");
  console.log("✅ Asset Creation successful!");

  // 2. Validate Duplicate Serial Number throws Error
  console.log("\n--- Test: Duplicate Serial Number Protection ---");
  try {
    await assetService.createAsset({
      name: "Another MacBook",
      serial_number: "SN-MAC-12345",
      category_id: "1"
    });
    assert.fail("Should have failed on duplicate serial number");
  } catch (error) {
    assert.ok(error.message.includes("already exists"));
    console.log("✅ Duplicate Serial Number correctly rejected!");
  }

  // 3. Validate Invalid Category ID throws Error
  console.log("\n--- Test: Invalid Category Check ---");
  try {
    await assetService.createAsset({
      name: "Ghost Laptop",
      serial_number: "SN-GHOST",
      category_id: "999" // returns null in mock
    });
    assert.fail("Should have failed on invalid categoryId");
  } catch (error) {
    assert.ok(error.message.includes("does not exist"));
    console.log("✅ Invalid Category ID correctly rejected!");
  }

  // 4. Retrieve All Assets (checking N+1 bulk loader)
  console.log("\n--- Test: Get All Assets ---");
  const allAssets = await assetService.getAllAssets({ search: "MacBook" });
  assert.strictEqual(allAssets.length, 1);
  assert.strictEqual(allAssets[0].name, "MacBook Pro 16");
  assert.strictEqual(allAssets[0].assetTag, "AF-0001");
  console.log("✅ Assets listing, search, and bulk resolver works!");

  // 5. Update Asset
  console.log("\n--- Test: Update Asset ---");
  const updated = await assetService.updateAsset(asset1.id, {
    name: "MacBook Pro 16 M3 Max",
    acquisition_cost: "3499.99"
  }, null, 42);

  assert.strictEqual(updated.name, "MacBook Pro 16 M3 Max");
  assert.strictEqual(updated.purchaseCost, 3499.99);
  console.log("✅ Asset Update successful!");

  // 6. Dashboard aggregations
  console.log("\n--- Test: Dashboard Summary Stats ---");
  const summary = await dashboardService.getSummaryStats();
  assert.strictEqual(summary.totalAssets, 1);
  assert.strictEqual(summary.totalValue, 3499.99);
  console.log("✅ Dashboard summary stats aggregate successfully!");

  console.log("\n--- Test: Dashboard KPIs ---");
  const kpis = await dashboardService.getKPIs();
  assert.strictEqual(kpis.assetsAvailable, 1); // Asset status 'Active' (fallback maps active to available)
  assert.strictEqual(kpis.assetsAllocated, 0);
  console.log("✅ Dashboard KPIs (Available/Allocated) calculated correctly!");

  console.log("\n--- Test: Dashboard Department Stats ---");
  const deptStats = await dashboardService.getDepartmentStats();
  // We have 2 departments from mock + Engineering has ID 1
  const engDept = deptStats.find(d => d.departmentName === "Engineering");
  assert.ok(engDept);
  assert.strictEqual(engDept.assetCount, 1);
  assert.strictEqual(engDept.totalValue, 3499.99);
  console.log("✅ Dashboard department-wise stats calculated correctly!");

  // 7. Delete Asset
  console.log("\n--- Test: Delete Asset ---");
  const deleted = await assetService.deleteAsset(asset1.id, 42);
  assert.ok(deleted);

  const emptyList = await assetService.getAllAssets({});
  assert.strictEqual(emptyList.length, 0);
  console.log("✅ Asset Deletion successful!");

  console.log("\n🎉 ALL SERVICES LOGIC TESTS PASSED SUCCESSFULLY! 🎉");
}

runTests().catch(err => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
