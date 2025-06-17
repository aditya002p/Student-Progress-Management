import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  // Get stored value or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return initialValue
    }
  })
  
  // Update localStorage when state changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }, [key, storedValue])
  
  return [storedValue, setStoredValue]
}
