import api from './api'

const codeforcesService = {
  getUserSubmissions: async (handle) => {
    try {
      const response = await api.get(`/codeforces/user/${handle}/submissions`)
      return response.data
    } catch (error) {
      console.error(`Error fetching submissions for ${handle}:`, error)
      throw error
    }
  },
  
  getUserContests: async (handle) => {
    try {
      const response = await api.get(`/codeforces/user/${handle}/contests`)
      return response.data
    } catch (error) {
      console.error(`Error fetching contests for ${handle}:`, error)
      throw error
    }
  },
  
  validateHandle: async (handle) => {
    try {
      const response = await api.get(`/codeforces/validate-handle/${handle}`)
      return response.data.valid
    } catch (error) {
      console.error(`Error validating handle ${handle}:`, error)
      return false
    }
  }
}

export default codeforcesService