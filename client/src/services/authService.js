import api from "./api";

const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  signup: async ({ name, email, password }) => {
    const response = await api.post("/auth/signup", { name, email, password });
    return response.data;
  },

  forgotPassword: async () => {
    const response = await api.post("/auth/forgot-password");
    return response.data;
  }
};

export default authService;
