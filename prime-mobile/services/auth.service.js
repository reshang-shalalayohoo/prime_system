import api from './api';

const authService = {
  async login(username, password) {
    const { data } = await api.post('/auth/login', { username, password });
    return data;
  },

  async register(userData) {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

export default authService;
