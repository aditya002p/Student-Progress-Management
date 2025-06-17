import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { useTheme } from '@/hooks/useTheme'
import { formatDate } from '@/utils/dateUtils'
import { generateRatingChartOptions } from '@/utils/chartUtils'

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function RatingGraph({ contests }) {
  const { theme } = useTheme()
  const [chartData, setChartData] = useState(null)
  const [chartOptions, setChartOptions] = useState(null)

  useEffect(() => {
    if (!contests || contests.length === 0) return
    
    // Sort contests by date
    const sortedContests = [...contests].sort((a, b) => 
      new Date(a.ratingUpdateTimeSeconds * 1000) - new Date(b.ratingUpdateTimeSeconds * 1000)
    )
    
    // Prepare chart data
    const data = {
      labels: sortedContests.map(contest => formatDate(new Date(contest.ratingUpdateTimeSeconds * 1000), 'MMM d, yyyy')),
      datasets: [
        {
          label: 'Rating',
          data: sortedContests.map(contest => contest.newRating),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.1,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }
    
    setChartData(data)
    setChartOptions(generateRatingChartOptions(theme === 'dark'))
  }, [contests, theme])

  if (!chartData || !chartOptions) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="loading-spinner" />
      </div>
    )
  }

  return <Line data={chartData} options={chartOptions} />
}