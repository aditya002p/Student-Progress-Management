import { useCallback } from "react"

export const useToast = () => {
  const toast = useCallback(({ title, description, variant, duration = 5000 }) => {
    const id = Math.random().toString(36).slice(2, 9)
    
    const toastEvent = new CustomEvent('toast-add', {
      detail: {
        toast: {
          id,
          title,
          description,
          variant,
          duration
        }
      }
    })
    
    document.dispatchEvent(toastEvent)
    
    if (duration !== Infinity) {
      setTimeout(() => {
        const dismissEvent = new CustomEvent('toast-remove', {
          detail: { id }
        })
        document.dispatchEvent(dismissEvent)
      }, duration)
    }
    
    return id
  }, [])
  
  const dismiss = useCallback((id) => {
    const dismissEvent = new CustomEvent('toast-remove', {
      detail: { id }
    })
    document.dispatchEvent(dismissEvent)
  }, [])
  
  return { toast, dismiss }
}
