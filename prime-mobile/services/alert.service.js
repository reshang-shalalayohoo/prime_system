import api from './api';

const alertService = {
  async getAll(params = {}) {
    const { data } = await api.get('/alerts', { params });
    return data;
  },

  async markAsRead(id) {
    const { data } = await api.patch(`/alerts/${id}/read`);
    return data;
  },

  async markAllAsRead() {
    const { data } = await api.patch('/alerts/mark-all-read');
    return data;
  },

  async getUnreadCount() {
    const { data } = await api.get('/alerts/unread-count');
    return data;
  },
};

export default alertService;
