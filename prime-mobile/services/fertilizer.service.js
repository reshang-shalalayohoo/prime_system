import api from './api';

const fertilizerService = {
  async create(logData) {
    const { data } = await api.post('/fertilizer', logData);
    return data;
  },

  async getLogs(params = {}) {
    const { data } = await api.get('/fertilizer', { params });
    return data;
  },
};

export default fertilizerService;
