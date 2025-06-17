export const generateRatingColors = () => {
  return {
    // Codeforces rating colors by range
    'Newbie': '#CCCCCC',
    'Pupil': '#77FF77',
    'Specialist': '#77DDBB',
    'Expert': '#AAAAFF',
    'Candidate Master': '#FF88FF',
    'Master': '#FFCC88',
    'International Master': '#FFBB55',
    'Grandmaster': '#FF7777',
    'International Grandmaster': '#FF3333',
    'Legendary Grandmaster': '#AA0000'
  }
}

export const getRatingColor = (rating) => {
  if (!rating) return '#CCCCCC' // Default gray
  
  if (rating < 1200) return '#CCCCCC' // Newbie
  if (rating < 1400) return '#77FF77' // Pupil
  if (rating < 1600) return '#77DDBB' // Specialist
  if (rating < 1900) return '#AAAAFF' // Expert
  if (rating < 2100) return '#FF88FF' // Candidate Master
  if (rating < 2300) return '#FFCC88' // Master
  if (rating < 2400) return '#FFBB55' // International Master
  if (rating < 2600) return '#FF7777' // Grandmaster
  if (rating < 3000) return '#FF3333' // International Grandmaster
  return '#AA0000' // Legendary Grandmaster
}

export const getRatingLabel = (rating) => {
  if (!rating) return 'Unrated'
  
  if (rating < 1200) return 'Newbie'
  if (rating < 1400) return 'Pupil'
  if (rating < 1600) return 'Specialist'
  if (rating < 1900) return 'Expert'
  if (rating < 2100) return 'Candidate Master'
  if (rating < 2300) return 'Master'
  if (rating < 2400) return 'International Master'
  if (rating < 2600) return 'Grandmaster'
  if (rating < 3000) return 'International Grandmaster'
  return 'Legendary Grandmaster'
}

export const generateRatingChartOptions = (darkMode = false) => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#fff' : '#666'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      x: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: darkMode ? '#fff' : '#666'
        }
      },
      y: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: darkMode ? '#fff' : '#666'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }
}

export const generateHeatmapData = (submissions) => {
  const today = new Date()
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(today.getFullYear() - 1)
  
  // Initialize all days in the past year with 0 submissions
  const heatmapData = {}
  for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().slice(0, 10) // YYYY-MM-DD format
    heatmapData[dateKey] = 0
  }
  
  // Count submissions by day
  submissions.forEach(submission => {
    const submissionDate = new Date(submission.creationTimeSeconds * 1000)
    const dateKey = submissionDate.toISOString().slice(0, 10)
    
    // Only count if it's within our one year range
    if (heatmapData[dateKey] !== undefined) {
      heatmapData[dateKey]++
    }
  })
  
  // Convert to array format for visualization
  return Object.entries(heatmapData).map(([date, count]) => ({
    date,
    count
  }))
}

export const generateBarChartData = (problems, darkMode = false) => {
  // Group problems by rating
  const ratingGroups = {}
  
  problems.forEach(problem => {
    const rating = problem.rating || 'Unrated'
    if (!ratingGroups[rating]) {
      ratingGroups[rating] = 0
    }
    ratingGroups[rating]++
  })
  
  // Sort ratings in ascending order
  const labels = Object.keys(ratingGroups)
    .filter(rating => rating !== 'Unrated')
    .map(r => parseInt(r, 10))
    .sort((a, b) => a - b)
    
  if (ratingGroups['Unrated']) {
    labels.push('Unrated')
  }
  
  const data = labels.map(label => ratingGroups[label])
  const backgroundColor = labels.map(label => {
    if (label === 'Unrated') return '#CCCCCC'
    return getRatingColor(parseInt(label, 10))
  })
  
  return {
    labels,
    datasets: [
      {
        label: 'Problems Solved',
        data,
        backgroundColor,
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1
      }
    ]
  }
}
