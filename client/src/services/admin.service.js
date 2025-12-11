import api from './api'

export const adminService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getVerificationQueue: async (params = {}) => {
    try {
      const response = await api.get('/admin/verification-queue', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  approveVerification: async (queueId, notes) => {
    try {
      const response = await api.post(`/admin/verification/${queueId}/approve`, { notes })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  rejectVerification: async (queueId, data) => {
    try {
      const response = await api.post(`/admin/verification/${queueId}/reject`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  verifyUser: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/verify`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getAllRequests: async (params = {}) => {
    try {
      const response = await api.get('/admin/requests', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getAllProposals: async (params = {}) => {
    try {
      const response = await api.get('/admin/proposals', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getAllSubscriptions: async (params = {}) => {
    try {
      const response = await api.get('/admin/subscriptions', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/admin/analytics', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}