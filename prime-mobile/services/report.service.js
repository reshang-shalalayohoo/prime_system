import api from './api';

const reportService = {
  async getFarmerReport(params = {}) {
    const { data } = await api.get('/reports/farmer', { params });
    return data;
  },

  async getAdminReport() {
    const { data } = await api.get('/reports/admin');
    return data;
  },
};

export default reportService;
