import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { generateHeatmapData } from '@/utils/chartUtils'
import { formatDate } from '@/utils/dateUtils'

export default function SubmissionHeatmap({ submissions }) {
  const svgRef = useRef(null)
  const tooltipRef = useRef(null)
  const [data, setData] = useState([])
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'

  useEffect(() => {
    if (!submissions || submissions.length === 0) return
    setData(generateHeatmapData(submissions))
  }, [submissions])

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    const margin = { top: 20, right: 20, bottom: 20, left: 40 }
    const cellSize = 12
    const cellMargin = 2
    const width = 53 * (cellSize + cellMargin) + margin.left + margin.right
    const height = 7 * (cellSize + cellMargin) + margin.top + margin.bottom

    // Clear previous content
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Set up the tooltip
    const tooltip = d3.select(tooltipRef.current)

    // Set SVG size
    svg
      .attr('width', width)
      .attr('height', height)

    // Find the max count for color scaling
    const maxCount = Math.max(...data.map(d => d.count), 1)

    // Create color scale
    const colorScale = d3.scaleSequential()
      .domain([0, maxCount])
      .interpolator(isDarkMode ? d3.interpolateBlues : d3.interpolateGreens)

    // Group data by week and day
    const dayGroups = {}
    data.forEach(d => {
      const date = new Date(d.date)
      const day = date.getDay() // 0 (Sunday) to 6 (Saturday)
      
      // Calculate week number from the past year (0 to 52)
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      const diffTime = date - oneYearAgo
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const week = Math.floor(diffDays / 7)
      
      if (!dayGroups[week]) dayGroups[week] = {}
      dayGroups[week][day] = { date: d.date, count: d.count }
    })

    // Function to show tooltip
    const showTooltip = (event, d) => {
      const date = new Date(d.date)
      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 30) + 'px')
        .style('opacity', 1)
        .html(`
          <div class="bg-card p-2 rounded shadow-md border border-border">
            <div class="font-medium">${formatDate(date, 'MMM d, yyyy')}</div>
            <div>${d.count} submission${d.count !== 1 ? 's' : ''}</div>
          </div>
        `)
    }

    // Function to hide tooltip
    const hideTooltip = () => {
      tooltip.style('opacity', 0)
    }

    // Create cells for each day
    const weeks = Object.keys(dayGroups).sort((a, b) => a - b)
    weeks.forEach((week, i) => {
      const weekData = dayGroups[week]
      
      for (let day = 0; day < 7; day++) {
        const dayData = weekData[day] || { count: 0, date: null }
        
        if (dayData.date) {
          svg.append('rect')
            .attr('x', margin.left + i * (cellSize + cellMargin))
            .attr('y', margin.top + day * (cellSize + cellMargin))
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('class', 'heatmap-day')
            .attr('fill', dayData.count > 0 ? colorScale(dayData.count) : isDarkMode ? '#2c2c2c' : '#ebedf0')
            .on('mouseover', (event) => showTooltip(event, dayData))
            .on('mouseout', hideTooltip)
        }
      }
    })

    // Add day labels
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    days.forEach((day, i) => {
      if (i % 2 === 0) { // Only show every other day for better spacing
        svg.append('text')
          .attr('x', margin.left - 10)
          .attr('y', margin.top + i * (cellSize + cellMargin) + cellSize / 2 + 4)
          .attr('text-anchor', 'end')
          .attr('font-size', '10px')
          .attr('fill', isDarkMode ? '#aaa' : '#666')
          .text(day)
      }
    })

    // Add month labels
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let currentMonth = -1
    
    data.forEach((d, i) => {
      const date = new Date(d.date)
      const month = date.getMonth()
      
      // Check if we've moved to a new month
      if (month !== currentMonth) {
        currentMonth = month
        const weekIndex = Math.floor(i / 7)
        
        svg.append('text')
          .attr('x', margin.left + weekIndex * (cellSize + cellMargin))
          .attr('y', margin.top - 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', isDarkMode ? '#aaa' : '#666')
          .text(months[month])
      }
    })

  }, [data, isDarkMode])

  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-muted-foreground">No submission data available</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-auto">
      <svg ref={svgRef} />
      <div 
        ref={tooltipRef} 
        className="absolute opacity-0 pointer-events-none z-50 transition-opacity"
      />
    </div>
  )
}