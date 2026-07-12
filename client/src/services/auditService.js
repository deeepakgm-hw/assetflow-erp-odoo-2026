import api from "./api";

const auditService = {
  getAll: () => api.get("/audit-cycles"),
  getById: (id) => api.get(`/audit-cycles/${id}`),
  create: (data) => api.post("/audit-cycles", data),
  updateItem: (cycleId, itemId, data) => api.patch(`/audit-cycles/${cycleId}/items/${itemId}`, data),
  close: (id) => api.post(`/audit-cycles/${id}/close`),
  getDiscrepancies: (id) => api.get(`/audit-cycles/${id}/discrepancies`),
};

export default auditService;
