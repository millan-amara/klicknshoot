import api from './api'

export const clientService = {
  getClientById: async (clientId) => {
    try {
      const response = await api.get(`/clients/${clientId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  updateClient: async (clientId, clientData) => {
    try {
      const response = await api.put(`/clients/${clientId}`, clientData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getClientRequests: async (clientId, params = {}) => {
    try {
      const response = await api.get(`/clients/${clientId}/requests`, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getClientStats: async (clientId) => {
    try {
      const response = await api.get(`/clients/${clientId}/stats`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}