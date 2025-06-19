import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useToast } from "@/components/common/UI/Toast/useToast"
import studentService from '../services/studentService'

const StudentContext = createContext()

export function StudentProvider({ children }) {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  const fetchStudents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await studentService.getAllStudents()
      setStudents(response.data)
    } catch (err) {
      setError(err.message || 'Failed to fetch students')
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const addStudent = async (studentData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await studentService.addStudent(studentData)
      setStudents(prev => [...prev, response.data.data])
      toast({
        title: "Success",
        description: "Student added successfully",
      })
      return response
    } catch (err) {
      setError(err.message || 'Failed to add student')
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to add student. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateStudent = async (id, studentData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await studentService.updateStudent(id, studentData)
      setStudents(prev => 
        prev.map(student => student._id === id ? response.data.data : student)
      )
      toast({
        title: "Success",
        description: "Student updated successfully",
      })
      return response
    } catch (err) {
      setError(err.message || 'Failed to update student')
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update student. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteStudent = async (id) => {
    setIsLoading(true)
    setError(null)
    try {
      await studentService.deleteStudent(id)
      setStudents(prev => prev.filter(student => student._id !== id))
      toast({
        title: "Success",
        description: "Student deleted successfully",
      })
      return true
    } catch (err) {
      setError(err.message || 'Failed to delete student')
      toast({
        title: "Error",
        description: err.message || "Failed to delete student. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const refreshStudentData = async (id) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await studentService.refreshCodeforcesData(id)
      setStudents(prev => 
        prev.map(student => student._id === id ? response.data.data : student)
      )
      toast({
        title: "Success",
        description: "Student data refreshed successfully",
      })
      return response
    } catch (err) {
      setError(err.message || 'Failed to refresh student data')
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to refresh student data. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <StudentContext.Provider 
      value={{ 
        students, 
        isLoading, 
        error, 
        fetchStudents, 
        addStudent, 
        updateStudent, 
        deleteStudent,
        refreshStudentData
      }}
    >
      {children}
    </StudentContext.Provider>
  )
}

export const useStudentContext = () => {
  const context = useContext(StudentContext)
  if (!context) {
    throw new Error('useStudentContext must be used within a StudentProvider')
  }
  return context
}
