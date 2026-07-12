const activityService = require("./activity.service");

class ActivityController {
  getAll = async (req, res, next) => {
    try {
      const { search, entityType, page, limit } = req.query;

      const pageInt = page ? parseInt(page) : 1;
      const limitInt = limit ? parseInt(limit) : 10;

      const result = await activityService.getAllActivityLogs({
        search,
        entityType,
        page: pageInt,
        limit: limitInt
      });

      return res.status(200).json({
        success: true,
        message: "Activity logs retrieved successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ActivityController();
