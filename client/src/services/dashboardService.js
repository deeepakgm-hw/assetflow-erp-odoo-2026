import api from "./api";

const dashboardService = {
<<<<<<< HEAD
  getKPIs: async () => {
    const response = await api.get("/dashboard/kpis");
    return response.data;
  },

  getOverdue: async () => {
    const response = await api.get("/dashboard/overdue");
=======
  getDetails: async () => {
    const response = await api.get("/dashboard/details");
>>>>>>> 8e81198 (feat: redesign dashboard with premium glassmorphism and real-time metrics)
    return response.data;
  }
};

export default dashboardService;
