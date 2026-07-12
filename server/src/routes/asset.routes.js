const express = require("express");
const assetController = require("../controllers/asset.controller");
const upload = require("../middleware/upload");
const { createAssetValidation, updateAssetValidation } = require("../middleware/asset.validation");

const router = express.Router();

router.route("/")
  .get(assetController.getAllAssets)
  .post(upload.single("attachment"), createAssetValidation, assetController.createAsset);

router.route("/:id")
  .get(assetController.getAssetById)
  .put(upload.single("attachment"), updateAssetValidation, assetController.updateAsset)
  .delete(assetController.deleteAsset);

module.exports = router;
