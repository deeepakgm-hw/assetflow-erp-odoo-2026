import api from "./api";

const departmentService = {
  getAll: async () => {
    const response = await api.get("/departments");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/departments", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/departments/${id}/status`, { status });
    return response.data;
  },

  updateHead: async (id, headId) => {
    const response = await api.patch(`/departments/${id}/head`, { headId });
    return response.data;
  }
};

export default departmentService;
