import api from './api'

export const subscriptionService = {
  getPlans: async () => {
    try {
      const response = await api.get('/subscriptions/plans')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getUserSubscriptions: async (userId) => {
    try {
      const response = await api.get(`/subscriptions?user=${userId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  createSubscription: async (subscriptionData) => {
    try {
      const response = await api.post('/subscriptions', subscriptionData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  cancelSubscription: async (subscriptionId) => {
    try {
      const response = await api.post(`/subscriptions/${subscriptionId}/cancel`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  upgradeSubscription: async (subscriptionId, upgradeData) => {
    try {
      const response = await api.post(`/subscriptions/${subscriptionId}/upgrade`, upgradeData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // In subscription.service.js
  verifyPayment: async (data) => {
    try {
          console.log('Sending subscription data:', data) // Debug log

      const response = await api.post('/subscriptions/verify-payment', data)
          console.log('Service response:', response.data) // Debug log
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getSubscriptionLimits: async (subscriptionId) => {
    try {
      const response = await api.get(`/subscriptions/${subscriptionId}/limits`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}