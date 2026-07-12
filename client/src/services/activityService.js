import api from "./api";

const activityService = {
  getAll: async (params) => {
    const response = await api.get("/activity", { params });
    return response.data;
  }
};

export default activityService;
