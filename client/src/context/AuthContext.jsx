import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a production app, implement proper token-based authentication
    // For this exercise, we'll create a dummy user for demonstration
    const dummyUser = {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin'
    }
    
    setUser(dummyUser)
    setIsLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      // In a real app, this would make an API call
      // const response = await api.post('/auth/login', credentials)
      // setUser(response.data.user)
      console.log('Login with credentials:', credentials)
      setUser({
        id: '1',
        name: 'Admin User',
        email: credentials.email,
        role: 'admin'
      })
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    // In a real app, this would clear tokens
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
