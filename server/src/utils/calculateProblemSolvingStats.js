const calculateProblemSolvingStats = (submissions) => {
  if (!submissions || submissions.length === 0) {
    return {
      mostDifficultProblem: null,
      totalProblemsSolved: 0,
      averageRating: 0,
      averageProblemsPerDay: 0,
      problemsPerRating: {},
      submissionHeatmap: {}
    };
  }

  const solvedProblems = submissions.filter(sub => sub.verdict === 'OK');
  const uniqueProblems = [...new Map(solvedProblems.map(item => [item.problem.name, item])).values()];

  const mostDifficultProblem = uniqueProblems.reduce((max, p) => p.problem.rating > max.problem.rating ? p : max, uniqueProblems[0]);

  const firstSubmissionDate = new Date(Math.min(...submissions.map(s => s.creationTimeSeconds * 1000)));
  const daysActive = (new Date() - firstSubmissionDate) / (1000 * 60 * 60 * 24);
  const averageProblemsPerDay = daysActive > 0 ? uniqueProblems.length / daysActive : 0;

  const averageRating = uniqueProblems.reduce((sum, p) => sum + p.problem.rating, 0) / uniqueProblems.length;

  const problemsPerRating = uniqueProblems.reduce((acc, p) => {
    const rating = p.problem.rating || 'unrated';
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});

  const submissionHeatmap = solvedProblems.reduce((acc, p) => {
    const date = new Date(p.creationTimeSeconds * 1000).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return {
    mostDifficultProblem,
    totalProblemsSolved: uniqueProblems.length,
    averageRating: Math.round(averageRating),
    averageProblemsPerDay: parseFloat(averageProblemsPerDay.toFixed(2)),
    problemsPerRating,
    submissionHeatmap
  };
};

module.exports = { calculateProblemSolvingStats };
