import api from './api'

export const userService = {
  getUserById: async (userId) => {
    try {
      console.log(userId)
      const { data } = await api.get(`/users/${userId}`)
      return data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const { data } = await api.put(`/users/${userId}`, userData)
      return data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getUserStats: async (userId) => {
    try {
      console.log(`LOGGING ID: ${userId}`);
      const { data } = await api.get(`/users/${userId}/stats`)
      return data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}
