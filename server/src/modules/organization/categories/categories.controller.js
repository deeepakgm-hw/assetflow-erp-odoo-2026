const categoriesService = require("./categories.service");
const logActivity = require("../../../helpers/logActivity");

class CategoriesController {
  getAll = async (req, res, next) => {
    try {
      const categories = await categoriesService.getAllCategories();
      return res.status(200).json({
        success: true,
        message: "Categories retrieved successfully",
        data: categories
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const { name, customFields } = req.body;
      const category = await categoriesService.createCategory({ name, customFields });

      // Audit log
      await logActivity({
        userId: req.user.id,
        action: `Created category: ${category.name}`,
        entityType: "Category",
        entityId: category.id
      });

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const idInt = parseInt(id);
      const { name, customFields } = req.body;
      const category = await categoriesService.updateCategory(idInt, { name, customFields });

      // Audit log
      await logActivity({
        userId: req.user.id,
        action: `Updated category: ${category.name}`,
        entityType: "Category",
        entityId: category.id
      });

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const idInt = parseInt(id);
      await categoriesService.deleteCategory(idInt);

      // Audit log
      await logActivity({
        userId: req.user.id,
        action: `Deleted category with ID: ${id}`,
        entityType: "Category",
        entityId: idInt
      });

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
        data: { id: idInt }
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new CategoriesController();
