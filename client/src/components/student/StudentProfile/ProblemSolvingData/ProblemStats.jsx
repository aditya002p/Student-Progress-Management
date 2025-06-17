import { Card, CardContent } from '@/components/common/UI/Card'
import { getRatingColor } from '@/utils/chartUtils'

export default function ProblemStats({ problemData, filter }) {
  if (!problemData) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center">
            <p className="text-muted-foreground">No problem data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const stats = [
    {
      title: 'Most Difficult Problem',
      value: problemData.hardestProblem ? (
        <a
          href={`https://codeforces.com/problemset/problem/${problemData.hardestProblem.contestId}/${problemData.hardestProblem.index}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold hover:underline"
          style={{ color: getRatingColor(problemData.hardestProblem.rating) }}
        >
          {problemData.hardestProblem.name} ({problemData.hardestProblem.rating})
        </a>
      ) : (
        <span className="text-muted-foreground">None</span>
      ),
    },
    {
      title: 'Total Problems Solved',
      value: <span className="text-lg font-semibold">{problemData.totalProblems || 0}</span>,
    },
    {
      title: 'Average Rating',
      value: problemData.averageRating ? (
        <span 
          className="text-lg font-semibold" 
          style={{ color: getRatingColor(problemData.averageRating) }}
        >
          {Math.round(problemData.averageRating)}
        </span>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      ),
    },
    {
      title: 'Average Problems Per Day',
      value: problemData.averagePerDay ? (
        <span className="text-lg font-semibold">
          {problemData.averagePerDay.toFixed(2)}
        </span>
      ) : (
        <span className="text-muted-foreground">0</span>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-card hover:bg-accent/50 transition-colors">
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <div className="text-lg">{stat.value}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}