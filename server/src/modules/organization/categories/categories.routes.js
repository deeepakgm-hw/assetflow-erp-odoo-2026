const express = require("express");
const categoriesController = require("./categories.controller");
const authorize = require("../../../middleware/role.middleware");
const {
  createCategoryValidation,
  updateCategoryValidation
} = require("./categories.validation");

const router = express.Router();

router.get("/", categoriesController.getAll);
router.post("/", authorize("Admin"), createCategoryValidation, categoriesController.create);
router.put("/:id", authorize("Admin"), updateCategoryValidation, categoriesController.update);
router.delete("/:id", authorize("Admin"), categoriesController.delete);

module.exports = router;
