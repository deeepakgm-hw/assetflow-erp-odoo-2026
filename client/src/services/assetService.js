import api from "./api";

const assetService = {
  getAll: async (params) => {
    const response = await api.get("/assets", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  create: async (formData) => {
    const response = await api.post("/assets", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  update: async (id, formData) => {
    const response = await api.put(`/assets/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  }
};

export default assetService;
