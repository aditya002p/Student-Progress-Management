import api from './api'

const exportService = {
  exportStudentsAsCSV: async () => {
    try {
      const response = await api.get('/export/students-csv', {
        responseType: 'blob'
      })
      
      // Create and download the file
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `students_export_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      return true
    } catch (error) {
      console.error('Error exporting students as CSV:', error)
      throw error
    }
  },
  
  exportStudentDataAsCSV: async (id) => {
    try {
      const response = await api.get(`/export/student/${id}/csv`, {
        responseType: 'blob'
      })
      
      // Get student name
      const filenameHeader = response.headers['content-disposition']
      let filename = `student_${id}_export_${new Date().toISOString().slice(0, 10)}.csv`
      
      if (filenameHeader) {
        const matches = /filename="(.+)"/.exec(filenameHeader)
        if (matches && matches[1]) {
          filename = matches[1]
        }
      }
      
      // Create and download the file
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      return true
    } catch (error) {
      console.error(`Error exporting data for student ${id}:`, error)
      throw error
    }
  }
}

export default exportService