import { api } from './auth.service'

const recommendationService = {
  async getAll(params = {}) {
    const { data } = await api.get('/recommendations', { params })
    return data
  },
  async getLatest(params = {}) {
    const { data } = await api.get('/recommendations/latest', { params })
    return data
  },
  async getStats(params = {}) {
    const { data } = await api.get('/recommendations/stats', { params })
    return data
  }
}

export default recommendationService
