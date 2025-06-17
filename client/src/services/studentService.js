import api from './api'

const studentService = {
  getAllStudents: async () => {
    try {
      const response = await api.get('/students')
      return response.data
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error
    }
  },
  
  getStudentById: async (id) => {
    try {
      const response = await api.get(`/students/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error)
      throw error
    }
  },
  
  addStudent: async (studentData) => {
    try {
      const response = await api.post('/students', studentData)
      return response.data
    } catch (error) {
      console.error('Error adding student:', error)
      throw error
    }
  },
  
  updateStudent: async (id, studentData) => {
    try {
      const response = await api.put(`/students/${id}`, studentData)
      return response.data
    } catch (error) {
      console.error(`Error updating student ${id}:`, error)
      throw error
    }
  },
  
  deleteStudent: async (id) => {
    try {
      const response = await api.delete(`/students/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting student ${id}:`, error)
      throw error
    }
  },
  
  refreshCodeforcesData: async (id) => {
    try {
      const response = await api.post(`/students/${id}/refresh-cf-data`)
      return response.data
    } catch (error) {
      console.error(`Error refreshing CF data for student ${id}:`, error)
      throw error
    }
  },
  
  getStudentContestHistory: async (id, filter) => {
    try {
      const response = await api.get(`/students/${id}/contest-history?filter=${filter}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching contest history for student ${id}:`, error)
      throw error
    }
  },
  
  getStudentProblemData: async (id, filter) => {
    try {
      const response = await api.get(`/students/${id}/problem-data?filter=${filter}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching problem data for student ${id}:`, error)
      throw error
    }
  },
  
  toggleEmailNotifications: async (id, enabled) => {
    try {
      const response = await api.patch(`/students/${id}/email-notifications`, { enabled })
      return response.data
    } catch (error) {
      console.error(`Error updating email notifications for student ${id}:`, error)
      throw error
    }
  },
  
  getEmailHistory: async (id) => {
    try {
      const response = await api.get(`/students/${id}/email-history`)
      return response.data
    } catch (error) {
      console.error(`Error fetching email history for student ${id}:`, error)
      throw error
    }
  }
}

export default studentService