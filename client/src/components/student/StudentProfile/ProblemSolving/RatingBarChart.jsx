import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RatingBarChart({ problems }) {
  if (!problems || problems.length === 0) {
    return <p className="text-muted-foreground">No problems solved in this period.</p>;
  }

  const ratingData = problems.reduce((acc, p) => {
    const rating = p.problem.rating || 0;
    const ratingBucket = Math.floor(rating / 100) * 100;
    const key = ratingBucket > 0 ? `${ratingBucket}` : 'Unrated';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(ratingData)
    .map(([rating, count]) => ({ rating, count }))
    .sort((a, b) => parseInt(a.rating) - parseInt(b.rating));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="rating" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#8884d8" name="Problems Solved" />
      </BarChart>
    </ResponsiveContainer>
  );
}
