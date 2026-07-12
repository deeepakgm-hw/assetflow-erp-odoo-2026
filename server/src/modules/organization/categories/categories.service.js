const prisma = require("../../../lib/prisma");

class CategoriesService {
  async getAllCategories() {
    return await prisma.category.findMany();
  }

  async createCategory({ name, customFields }) {
    const existing = await prisma.category.findUnique({
      where: { name }
    });
    if (existing) {
      const error = new Error("Category name must be unique");
      error.statusCode = 409;
      throw error;
    }

    return await prisma.category.create({
      data: {
        name,
        customFields: customFields || {}
      }
    });
  }

  async updateCategory(id, { name, customFields }) {
    const category = await prisma.category.findUnique({
      where: { id }
    });
    if (!category) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }

    if (name && name !== category.name) {
      const existing = await prisma.category.findUnique({
        where: { name }
      });
      if (existing) {
        const error = new Error("Category name must be unique");
        error.statusCode = 409;
        throw error;
      }
    }

    return await prisma.category.update({
      where: { id },
      data: {
        name,
        customFields: customFields !== undefined ? customFields : category.customFields
      }
    });
  }

  async deleteCategory(id) {
    const category = await prisma.category.findUnique({
      where: { id }
    });
    if (!category) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }

    return await prisma.category.delete({
      where: { id }
    });
  }
}

module.exports = new CategoriesService();
