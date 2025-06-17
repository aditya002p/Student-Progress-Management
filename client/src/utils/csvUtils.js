import { formatDate } from './dateUtils'

export const downloadCSV = (csvString, filename) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  // Create link to download
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, filename)
  } else {
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = filename
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export const convertStudentsToCSV = (students) => {
  if (!students || students.length === 0) {
    return ''
  }
  
  // Define headers
  const headers = [
    'Name',
    'Email',
    'Phone Number',
    'Codeforces Handle',
    'Current Rating',
    'Max Rating',
    'Last Updated',
    'Email Notifications'
  ]
  
  // Add headers row
  let csvContent = headers.join(',') + '\n'
  
  // Add data rows
  students.forEach(student => {
    const row = [
      `"${student.name || ''}"`,
      `"${student.email || ''}"`,
      `"${student.phoneNumber || ''}"`,
      `"${student.codeforcesHandle || ''}"`,
      student.currentRating || 0,
      student.maxRating || 0,
      `"${formatDate(student.lastUpdated) || 'Never'}"`,
      student.emailNotificationsEnabled ? 'Enabled' : 'Disabled'
    ]
    
    csvContent += row.join(',') + '\n'
  })
  
  return csvContent
}
