export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^(\+254|0)?[71]\d{8}$/
  return re.test(phone.replace(/\s/g, ''))
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const validateBudget = (min, max) => {
  return min > 0 && max > 0 && max >= min
}

export const validateDate = (date) => {
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selectedDate >= today
}

export const validateFile = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'], maxSize = 50 * 1024 * 1024) => {
  if (!file) return 'No file selected'
  
  if (!allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`
  }
  
  if (file.size > maxSize) {
    return `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
  }
  
  return null
}