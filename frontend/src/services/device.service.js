import { api } from './auth.service'

const deviceService = {
  async getAll() {
    const { data } = await api.get('/devices')
    return data
  },
  async getMapData() {
    const { data } = await api.get('/devices/map-data')
    return data
  },
  async getDetail(id) {
    const { data } = await api.get(`/devices/${id}/detail`)
    return data
  },
  async create(deviceData) {
    const { data } = await api.post('/devices', deviceData)
    return data
  },
  async update(id, deviceData) {
    const { data } = await api.patch(`/devices/${id}`, deviceData)
    return data
  },
  async updateLocation(id, { latitude, longitude }) {
    const { data } = await api.patch(`/devices/${id}/location`, { latitude, longitude })
    return data
  },
  async getOnlineCount() {
    const { data } = await api.get('/devices/online-count')
    return data
  },
  async getFields() {
    const { data } = await api.get('/devices/fields')
    return data
  }
}

export default deviceService
