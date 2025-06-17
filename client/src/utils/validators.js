export const validateEmail = (email) => {
  if (!email) return 'Email is required'
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  
  return null
}

export const validatePhone = (phone) => {
  if (!phone) return null // Phone is optional
  
  // Simple phone number validation (allowing various formats)
  const phoneRegex = /^[\d\s+()-]{10,15}$/
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number'
  }
  
  return null
}

export const validateCodeforcesHandle = (handle) => {
  if (!handle) return 'Codeforces handle is required'
  
  // Codeforces handles can contain only Latin letters, digits, underscores, or hyphens
  // and must start with a Latin letter
  const handleRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/
  if (!handleRegex.test(handle)) {
    return 'Invalid Codeforces handle format'
  }
  
  // Handle length between 3 and 24 characters
  if (handle.length < 3 || handle.length > 24) {
    return 'Codeforces handle must be between 3 and 24 characters'
  }
  
  return null
}

export const validateRequired = (value, fieldName) => {
  if (!value) {
    return `${fieldName} is required`
  }
  return null
}
