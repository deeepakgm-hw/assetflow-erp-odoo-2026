import api from "./api";

const employeeService = {
  getAll: async (params) => {
    const response = await api.get("/employees", { params });
    return response.data;
  },

  promoteRole: async (id, role) => {
    const response = await api.patch(`/employees/${id}/role`, { role });
    return response.data;
  },

  assignDepartment: async (id, departmentId) => {
    const response = await api.patch(`/employees/${id}/department`, { departmentId });
    return response.data;
  }
};

export default employeeService;
