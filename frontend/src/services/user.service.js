import { api } from './auth.service'

const userService = {
  async getAll() {
    const { data } = await api.get('/users')
    return data
  },
  async create(userData) {
    const { data } = await api.post('/users', userData)
    return data
  },
  async updateStatus(id, isActive) {
    const { data } = await api.patch(`/users/${id}/status`, { is_active: isActive })
    return data
  }
}

export default userService
