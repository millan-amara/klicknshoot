import api from './api'

export const requestService = {
  getRequests: async (params = {}) => {
    try {
      const response = await api.get('/requests', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getRequestById: async (requestId) => {
    try {
      const response = await api.get(`/requests/${requestId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  createRequest: async (requestData) => {
    try {
      const response = await api.post('/requests', requestData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  updateRequest: async (requestId, requestData) => {
    try {
      const response = await api.put(`/requests/${requestId}`, requestData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  deleteRequest: async (requestId) => {
    try {
      const response = await api.delete(`/requests/${requestId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  closeRequest: async (requestId) => {
    try {
      const response = await api.post(`/requests/${requestId}/close`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  reopenRequest: async (requestId) => {
    try {
      const response = await api.post(`/requests/${requestId}/reopen`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getRequestProposals: async (requestId) => {
    try {
      const response = await api.get(`/requests/${requestId}/proposals`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}