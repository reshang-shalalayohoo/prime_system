import api from './api';

const deviceService = {
  async getAll() {
    const { data } = await api.get('/devices');
    return data;
  },

  async create(deviceData) {
    const { data } = await api.post('/devices', deviceData);
    return data;
  },

  async update(id, deviceData) {
    const { data } = await api.patch(`/devices/${id}`, deviceData);
    return data;
  },

  async getOnlineCount() {
    const { data } = await api.get('/devices/online-count');
    return data;
  },
};

export default deviceService;
