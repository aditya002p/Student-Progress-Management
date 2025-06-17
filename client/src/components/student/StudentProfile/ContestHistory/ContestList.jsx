import { formatDate } from '@/utils/dateUtils'
import { getRatingColor } from '@/utils/chartUtils'
import { Badge } from '@/components/common/UI/Badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/UI/Table'

export default function ContestList({ contests }) {
  if (!contests || contests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No contests found in this time period</p>
      </div>
    )
  }

  // Sort contests by date (newest first)
  const sortedContests = [...contests].sort((a, b) => 
    b.ratingUpdateTimeSeconds - a.ratingUpdateTimeSeconds
  )

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contest</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Rank</TableHead>
            <TableHead className="text-center">Rating Change</TableHead>
            <TableHead className="text-center">New Rating</TableHead>
            <TableHead className="text-center">Unsolved Problems</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedContests.map((contest) => {
            const ratingChange = contest.newRating - contest.oldRating
            const ratingChangeColor = ratingChange > 0 ? 'text-green-500' : ratingChange < 0 ? 'text-red-500' : ''
            const ratingChangePrefix = ratingChange > 0 ? '+' : ''
            
            return (
              <TableRow key={contest.contestId}>
                <TableCell className="font-medium">
                  <a 
                    href={`https://codeforces.com/contest/${contest.contestId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {contest.contestName}
                  </a>
                </TableCell>
                <TableCell>
                  {formatDate(new Date(contest.ratingUpdateTimeSeconds * 1000))}
                </TableCell>
                <TableCell className="text-center">{contest.rank}</TableCell>
                <TableCell className={`text-center ${ratingChangeColor}`}>
                  {ratingChangePrefix}{ratingChange}
                </TableCell>
                <TableCell className="text-center">
                  <span style={{ color: getRatingColor(contest.newRating) }}>
                    {contest.newRating}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={contest.unsolvedProblems > 0 ? "secondary" : "outline"}>
                    {contest.unsolvedProblems}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}