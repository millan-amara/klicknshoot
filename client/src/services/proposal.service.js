import api from './api'

export const proposalService = {
  submitProposal: async (proposalData) => {
    try {
      const response = await api.post('/proposals', proposalData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  getProposalById: async (proposalId) => {
    try {
      const response = await api.get(`/proposals/${proposalId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  updateProposal: async (proposalId, proposalData) => {
    try {
      const response = await api.put(`/proposals/${proposalId}`, proposalData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  acceptProposal: async (proposalId) => {
    try {
      const response = await api.post(`/proposals/${proposalId}/accept`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  rejectProposal: async (proposalId) => {
    try {
      const response = await api.post(`/proposals/${proposalId}/reject`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  withdrawProposal: async (proposalId) => {
    try {
      const response = await api.post(`/proposals/${proposalId}/withdraw`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  generateWhatsAppLink: async (proposalId) => {
    try {
      const response = await api.post(`/proposals/${proposalId}/whatsapp`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}