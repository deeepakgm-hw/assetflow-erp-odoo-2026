import api from "./api";

const categoryService = {
  getAll: async () => {
    const response = await api.get("/categories");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/categories", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export default categoryService;
