import api from './api';

const activityService = {
  async getAll(params = {}) {
    const { data } = await api.get('/activity', { params });
    return data;
  },

  async getRecent(params = {}) {
    const { data } = await api.get('/activity/recent', { params });
    return data;
  },
};

export default activityService;
