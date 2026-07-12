const assetService = require("../services/asset.service");
const { APIError } = require("../middleware/error.middleware");

const getAllAssets = async (req, res, next) => {
  try {
    const assets = await assetService.getAllAssets(req.query);
    res.status(200).json({
      status: "success",
      results: assets.length,
      data: { assets }
    });
  } catch (error) {
    next(error);
  }
};

const getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const asset = await assetService.getAssetById(parseInt(id, 10));
    if (!asset) {
      throw new APIError(`Asset with ID ${id} not found`, 404);
    }
    res.status(200).json({
      status: "success",
      data: { asset }
    });
  } catch (error) {
    next(error);
  }
};

const createAsset = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1; // Fallback to 1 if auth middleware not run yet
    const asset = await assetService.createAsset(req.body, req.file, userId);
    res.status(201).json({
      status: "success",
      data: { asset }
    });
  } catch (error) {
    next(error);
  }
};

const updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 1;
    const asset = await assetService.updateAsset(parseInt(id, 10), req.body, req.file, userId);
    res.status(200).json({
      status: "success",
      data: { asset }
    });
  } catch (error) {
    next(error);
  }
};

const deleteAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 1;
    await assetService.deleteAsset(parseInt(id, 10), userId);
    res.status(204).json({
      status: "success",
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset
};
