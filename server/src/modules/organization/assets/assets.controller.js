const assetsService = require("./assets.service");

class AssetsController {
  getAll = async (req, res, next) => {
    try {
      const assets = await assetsService.getAllAssets();
      return res.status(200).json({
        success: true,
        message: "Assets retrieved successfully",
        data: assets
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AssetsController();
