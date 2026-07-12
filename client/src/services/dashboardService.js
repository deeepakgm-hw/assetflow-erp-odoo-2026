import api from "./api";

const dashboardService = {
  getKPIs: async () => {
    const response = await api.get("/dashboard/kpis");
    return response.data;
  },

  getOverdue: async () => {
    const response = await api.get("/dashboard/overdue");
    return response.data;
  },

  getDetails: async () => {
    const response = await api.get("/dashboard/details");
    return response.data;
  }
};

export default dashboardService;
