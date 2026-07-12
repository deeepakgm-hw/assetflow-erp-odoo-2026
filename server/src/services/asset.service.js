const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");
const { logActivity } = require("../utils/activity");
const { APIError } = require("../middleware/errorHandler");

const dbPath = path.join(__dirname, "../uploads/assets.json");

const readAssets = () => {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("❌ Error reading assets.json:", error);
    return [];
  }
};

const writeAssets = (assets) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(assets, null, 2));
  } catch (error) {
    console.error("❌ Error writing assets.json:", error);
    throw new APIError("Failed to write to local storage", 500);
  }
};

/**
 * Retrieve all assets with filtering, pagination, and sorting.
 * @param {Object} query - Express request query parameters
 * @returns {Promise<Array>} - List of assets
 */
const getAllAssets = async (query) => {
  let assets = readAssets();

  const { status, categoryId, departmentId, search, page = 1, limit = 10 } = query;

  // Filter by status
  if (status) {
    assets = assets.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }

  // Filter by categoryId
  if (categoryId) {
    assets = assets.filter(a => a.categoryId === parseInt(categoryId, 10));
  }

  // Filter by departmentId
  if (departmentId) {
    assets = assets.filter(a => a.departmentId === parseInt(departmentId, 10));
  }

  // Search by name or serialNumber
  if (search) {
    const searchLower = search.toLowerCase();
    assets = assets.filter(a => 
      (a.name && a.name.toLowerCase().includes(searchLower)) ||
      (a.serialNumber && a.serialNumber.toLowerCase().includes(searchLower))
    );
  }

  // Pagination
  const startIndex = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const paginatedAssets = assets.slice(startIndex, startIndex + parseInt(limit, 10));

  // Resolve category and department relations from Prisma
  const resolvedAssets = await Promise.all(
    paginatedAssets.map(async (asset) => {
      let category = null;
      let department = null;

      if (asset.categoryId) {
        category = await prisma.category.findUnique({
          where: { id: asset.categoryId }
        }).catch(() => null);
      }

      if (asset.departmentId) {
        department = await prisma.department.findUnique({
          where: { id: asset.departmentId }
        }).catch(() => null);
      }

      return {
        ...asset,
        category,
        department
      };
    })
  );

  return resolvedAssets;
};

/**
 * Retrieve a single asset by its ID.
 * @param {number} id - The ID of the asset
 * @returns {Promise<Object|null>} - The asset object or null
 */
const getAssetById = async (id) => {
  const assets = readAssets();
  const asset = assets.find(a => a.id === id);

  if (!asset) return null;

  let category = null;
  let department = null;

  if (asset.categoryId) {
    category = await prisma.category.findUnique({
      where: { id: asset.categoryId }
    }).catch(() => null);
  }

  if (asset.departmentId) {
    department = await prisma.department.findUnique({
      where: { id: asset.departmentId }
    }).catch(() => null);
  }

  return {
    ...asset,
    category,
    department
  };
};

/**
 * Create a new asset registry entry.
 * @param {Object} data - The asset data from req.body
 * @param {Object} file - Uploaded file metadata from multer (optional)
 * @param {number} userId - The user ID logging this action (from auth)
 * @returns {Promise<Object>} - The created asset object
 */
const createAsset = async (data, file, userId = 1) => {
  const assets = readAssets();

  // Validate serial number uniqueness
  if (data.serialNumber) {
    const exists = assets.some(a => a.serialNumber === data.serialNumber);
    if (exists) {
      throw new APIError(`Asset with serial number ${data.serialNumber} already exists`, 400);
    }
  }

  // Validate Category ID exists in Prisma
  const categoryId = parseInt(data.categoryId, 10);
  if (isNaN(categoryId)) {
    throw new APIError("Valid Category ID is required", 400);
  }
  const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!categoryExists) {
    throw new APIError(`Category with ID ${categoryId} does not exist`, 400);
  }

  // Validate Department ID exists in Prisma (if provided)
  let departmentId = null;
  if (data.departmentId) {
    departmentId = parseInt(data.departmentId, 10);
    if (!isNaN(departmentId)) {
      const deptExists = await prisma.department.findUnique({ where: { id: departmentId } });
      if (!deptExists) {
        throw new APIError(`Department with ID ${departmentId} does not exist`, 400);
      }
    }
  }

  // Handle file uploads
  const attachmentUrl = file ? `/uploads/${file.filename}` : null;

  const newAsset = {
    id: assets.length > 0 ? Math.max(...assets.map(a => a.id)) + 1 : 1,
    name: data.name || "Unnamed Asset",
    serialNumber: data.serialNumber || null,
    status: data.status || "Active",
    purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : new Date().toISOString(),
    purchaseCost: parseFloat(data.purchaseCost) || 0.0,
    categoryId,
    departmentId,
    attachmentUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  assets.push(newAsset);
  writeAssets(assets);

  // Log activity in Prisma
  await logActivity(userId, `Created Asset: ${newAsset.name} (S/N: ${newAsset.serialNumber || "N/A"})`, "Asset", newAsset.id);

  return {
    ...newAsset,
    category: categoryExists,
    department: departmentId ? await prisma.department.findUnique({ where: { id: departmentId } }).catch(() => null) : null
  };
};

/**
 * Update an existing asset registry entry.
 * @param {number} id - Asset ID
 * @param {Object} data - Asset fields to update
 * @param {Object} file - New uploaded file (optional)
 * @param {number} userId - The user ID logging this action
 * @returns {Promise<Object>} - The updated asset object
 */
const updateAsset = async (id, data, file, userId = 1) => {
  const assets = readAssets();
  const assetIndex = assets.findIndex(a => a.id === id);

  if (assetIndex === -1) {
    throw new APIError(`Asset with ID ${id} not found`, 404);
  }

  const existingAsset = assets[assetIndex];

  // Validate serial number uniqueness (if updated)
  if (data.serialNumber && data.serialNumber !== existingAsset.serialNumber) {
    const exists = assets.some(a => a.serialNumber === data.serialNumber);
    if (exists) {
      throw new APIError(`Asset with serial number ${data.serialNumber} already exists`, 400);
    }
  }

  // Validate Category ID exists (if updated)
  let categoryId = existingAsset.categoryId;
  if (data.categoryId) {
    categoryId = parseInt(data.categoryId, 10);
    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      throw new APIError(`Category with ID ${categoryId} does not exist`, 400);
    }
  }

  // Validate Department ID exists (if updated)
  let departmentId = existingAsset.departmentId;
  if (data.departmentId) {
    departmentId = parseInt(data.departmentId, 10);
    const deptExists = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!deptExists) {
      throw new APIError(`Department with ID ${departmentId} does not exist`, 400);
    }
  }

  // Clean up old attachment if new file is uploaded
  let attachmentUrl = existingAsset.attachmentUrl;
  if (file) {
    if (existingAsset.attachmentUrl) {
      const oldPath = path.join(__dirname, "..", existingAsset.attachmentUrl);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (error) {
          console.error("⚠️ Failed to delete old attachment:", error);
        }
      }
    }
    attachmentUrl = `/uploads/${file.filename}`;
  }

  const updatedAsset = {
    ...existingAsset,
    name: data.name !== undefined ? data.name : existingAsset.name,
    serialNumber: data.serialNumber !== undefined ? data.serialNumber : existingAsset.serialNumber,
    status: data.status !== undefined ? data.status : existingAsset.status,
    purchaseDate: data.purchaseDate !== undefined ? new Date(data.purchaseDate).toISOString() : existingAsset.purchaseDate,
    purchaseCost: data.purchaseCost !== undefined ? parseFloat(data.purchaseCost) : existingAsset.purchaseCost,
    categoryId,
    departmentId,
    attachmentUrl,
    updatedAt: new Date().toISOString()
  };

  assets[assetIndex] = updatedAsset;
  writeAssets(assets);

  // Log activity in Prisma
  await logActivity(userId, `Updated Asset: ${updatedAsset.name}`, "Asset", updatedAsset.id);

  return {
    ...updatedAsset,
    category: await prisma.category.findUnique({ where: { id: categoryId } }).catch(() => null),
    department: departmentId ? await prisma.department.findUnique({ where: { id: departmentId } }).catch(() => null) : null
  };
};

/**
 * Delete an asset registry entry.
 * @param {number} id - Asset ID
 * @param {number} userId - The user ID logging this action
 * @returns {Promise<boolean>} - Success confirmation
 */
const deleteAsset = async (id, userId = 1) => {
  const assets = readAssets();
  const assetIndex = assets.findIndex(a => a.id === id);

  if (assetIndex === -1) {
    throw new APIError(`Asset with ID ${id} not found`, 404);
  }

  const asset = assets[assetIndex];

  // Clean up file attachment
  if (asset.attachmentUrl) {
    const filePath = path.join(__dirname, "..", asset.attachmentUrl);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error("⚠️ Failed to delete file during asset deletion:", error);
      }
    }
  }

  assets.splice(assetIndex, 1);
  writeAssets(assets);

  // Log activity in Prisma
  await logActivity(userId, `Deleted Asset: ${asset.name} (S/N: ${asset.serialNumber || "N/A"})`, "Asset", id);

  return true;
};

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset
};
