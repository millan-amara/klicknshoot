import api from './api'

export const creativeService = {
  getCreatives: async (params = {}) => {
    try {
      const response = await api.get('/creatives', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getCreativeById: async (creativeId) => {
    try {
      const response = await api.get(`/creatives/${creativeId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  updateCreative: async (creativeId, creativeData) => {
    try {
      const response = await api.put(`/creatives/${creativeId}`, creativeData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  addPortfolioItem: async (creativeId, portfolioData) => {
    try {
      const response = await api.post(`/creatives/${creativeId}/portfolio`, portfolioData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  removePortfolioItem: async (creativeId, itemId) => {
    try {
      const response = await api.delete(`/creatives/${creativeId}/portfolio/${itemId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  submitForVerification: async (creativeId) => {
    try {
      const response = await api.post(`/creatives/${creativeId}/verify`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getCreativeProposals: async (creativeId, params = {}) => {
    try {
      const response = await api.get(`/creatives/${creativeId}/proposals`, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}