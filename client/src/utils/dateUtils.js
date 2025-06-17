import { format, formatDistance, parseISO, isValid, differenceInDays } from 'date-fns'

export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return ''
  
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date
    
    if (!isValid(parsedDate)) {
      return 'Invalid date'
    }
    
    return format(parsedDate, formatStr)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date
    
    if (!isValid(parsedDate)) {
      return 'Invalid date'
    }
    
    return formatDistance(parsedDate, new Date(), { addSuffix: true })
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return 'Invalid date'
  }
}

export const getDaysDifference = (date1, date2 = new Date()) => {
  if (!date1) return null
  
  try {
    const parsedDate1 = typeof date1 === 'string' ? parseISO(date1) : date1
    const parsedDate2 = typeof date2 === 'string' ? parseISO(date2) : date2
    
    if (!isValid(parsedDate1) || !isValid(parsedDate2)) {
      return null
    }
    
    return Math.abs(differenceInDays(parsedDate1, parsedDate2))
  } catch (error) {
    console.error('Error calculating days difference:', error)
    return null
  }
}

export const getFilterDateRange = (filter) => {
  const now = new Date()
  let startDate

  switch (filter) {
    case '7days':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
      
    case '30days':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 30)
      break
      
    case '90days':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 90)
      break
      
    case '365days':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 365)
      break
      
    default:
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 30) // Default to 30 days
  }

  return { startDate, endDate: now }
}
