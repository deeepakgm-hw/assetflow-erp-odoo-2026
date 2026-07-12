import api from "./api";

const maintenanceService = {
  getAll: (params) => api.get("/maintenance-requests", { params }),
  create: (formData) => api.post("/maintenance-requests", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  approve: (id, data) => api.patch(`/maintenance-requests/${id}/approve`, data),
  reject: (id, data) => api.patch(`/maintenance-requests/${id}/reject`, data),
  assign: (id, technicianId) => api.patch(`/maintenance-requests/${id}/assign`, { technicianId }),
  markInProgress: (id) => api.patch(`/maintenance-requests/${id}/progress`),
  resolve: (id) => api.patch(`/maintenance-requests/${id}/resolve`),
  getAssetHistory: (assetId) => api.get(`/maintenance-requests/asset/${assetId}`),
};

export default maintenanceService;
