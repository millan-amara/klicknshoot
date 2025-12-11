import api from './api'

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}