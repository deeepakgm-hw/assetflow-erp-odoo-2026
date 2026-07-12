const resourcesService = require("./resources.service");

class ResourcesController {
  getAll = async (req, res, next) => {
    try {
      const resources = await resourcesService.getAllResources();
      return res.status(200).json({
        success: true,
        message: "Resources retrieved successfully",
        data: resources
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ResourcesController();
