const express = require("express");
const categoriesController = require("./categories.controller");
const {
  createCategoryValidation,
  updateCategoryValidation
} = require("./categories.validation");

const router = express.Router();

router.get("/", categoriesController.getAll);
router.post("/", createCategoryValidation, categoriesController.create);
router.put("/:id", updateCategoryValidation, categoriesController.update);
router.delete("/:id", categoriesController.delete);

module.exports = router;
