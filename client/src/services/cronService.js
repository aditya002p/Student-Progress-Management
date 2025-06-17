import api from './api'

const cronService = {
  getCronSettings: async () => {
    try {
      const response = await api.get('/cron/settings')
      return response.data
    } catch (error) {
      console.error('Error fetching cron settings:', error)
      throw error
    }
  },
  
  updateCronSettings: async (settings) => {
    try {
      const response = await api.put('/cron/settings', settings)
      return response.data
    } catch (error) {
      console.error('Error updating cron settings:', error)
      throw error
    }
  },
  
  getSyncStatus: async () => {
    try {
      const response = await api.get('/cron/sync-status')
      return response.data
    } catch (error) {
      console.error('Error fetching sync status:', error)
      throw error
    }
  },
  
  triggerManualSync: async () => {
    try {
      const response = await api.post('/cron/manual-sync')
      return response.data
    } catch (error) {
      console.error('Error triggering manual sync:', error)
      throw error
    }
  }
}

export default cronService
