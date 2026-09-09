import api from './api';

const sensorService = {
  async getReadings(params = {}) {
    const { data } = await api.get('/sensors/readings', { params });
    return data;
  },

  async getLatest(params = {}) {
    const { data } = await api.get('/sensors/readings/latest', { params });
    return data;
  },

  async getStats(params = {}) {
    const { data } = await api.get('/sensors/readings/stats', { params });
    return data;
  },
};

export default sensorService;
