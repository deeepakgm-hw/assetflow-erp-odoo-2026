import api from "./api";

const notificationService = {
  getAll: async (params) => {
    const response = await api.get("/notifications", { params });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  }
};

export default notificationService;
