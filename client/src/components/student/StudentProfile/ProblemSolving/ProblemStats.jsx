import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/UI/Card";

export default function ProblemStats({ problemData, filter }) {
  if (!problemData) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
                <p>No data available for this period.</p>
            </CardContent>
        </Card>
    );
  }

  const stats = [
    { label: 'Most Difficult Problem', value: problemData.mostDifficultProblem?.problem.name || 'N/A', rating: problemData.mostDifficultProblem?.problem.rating },
    { label: 'Total Problems Solved', value: problemData.totalProblemsSolved || 0 },
    { label: 'Average Problem Rating', value: Math.round(problemData.averageRating) || 0 },
    { label: 'Average Problems/Day', value: problemData.averageProblemsPerDay || 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.label}>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value} {stat.rating ? `(${stat.rating})` : ''}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
