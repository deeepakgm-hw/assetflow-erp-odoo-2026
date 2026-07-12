import api from "./api";

const reportService = {
  utilizationByDepartment: () => api.get("/reports/utilization-by-department"),
  maintenanceFrequency: () => api.get("/reports/maintenance-frequency"),
  mostUsedIdleAssets: () => api.get("/reports/most-used-idle-assets"),
  dueForMaintenanceOrRetirement: () => api.get("/reports/due-for-maintenance-or-retirement"),
  bookingHeatmap: () => api.get("/reports/booking-heatmap"),
  export: (type = "utilizationByDepartment") =>
    api.get("/reports/export", { params: { type }, responseType: "blob" }),
};

export default reportService;
