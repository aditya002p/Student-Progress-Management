import { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { useTheme } from '@/hooks/useTheme'
import { generateBarChartData } from '@/utils/chartUtils'

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function RatingBarChart({ problems }) {
  const { theme } = useTheme()
  const [chartData, setChartData] = useState(null)
  const isDarkMode = theme === 'dark'

  useEffect(() => {
    if (!problems || problems.length === 0) return
    
    setChartData(generateBarChartData(problems, isDarkMode))
  }, [problems, isDarkMode])

  if (!chartData) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="loading-spinner" />
      </div>
    )
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const rating = tooltipItems[0].label
            return rating === 'Unrated' ? 'Unrated' : `Rating: ${rating}`
          },
          label: (tooltipItem) => {
            return `Problems: ${tooltipItem.raw}`
          },
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          precision: 0,
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }

  return <Bar data={chartData} options={options} />
}