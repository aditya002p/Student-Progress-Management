import { useState, useCallback } from 'react'
import { useToast } from '@/components/common/UI/Toast/useToast'

export function useApi() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  const request = useCallback(async (apiCall, { 
    successMessage = '', 
    errorMessage = 'An error occurred. Please try again.',
    showSuccessToast = true,
    showErrorToast = true
  } = {}) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiCall()
      
      if (showSuccessToast && successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
          variant: 'default'
        })
      }
      
      return response
    } catch (err) {
      const message = err.response?.data?.message || err.message || errorMessage
      setError(message)
      
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive'
        })
      }
      
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  return { request, isLoading, error }
}
