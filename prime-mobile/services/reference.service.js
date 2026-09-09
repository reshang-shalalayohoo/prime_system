import api from './api';

const referenceService = {
  async getAll() {
    const { data } = await api.get('/reference');
    return data;
  },

  async update(values) {
    const { data } = await api.put('/reference', { values });
    return data;
  },
};

export default referenceService;
