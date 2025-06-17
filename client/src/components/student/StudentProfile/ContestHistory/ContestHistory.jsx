import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/UI/Select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/UI/Card'
import { useToast } from '@/components/common/UI/Toast/useToast'
import RatingGraph from './RatingGraph'
import ContestList from './ContestList'
import studentService from '@/services/studentService'
import { CONTEST_HISTORY_FILTERS } from '@/utils/constants'

export default function ContestHistory({ studentId }) {
  const [filter, setFilter] = useState('30days')
  const [contestHistory, setContestHistory] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchContestHistory = async () => {
      setIsLoading(true)
      try {
        const history = await studentService.getStudentContestHistory(studentId, filter)
        setContestHistory(history)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch contest history',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchContestHistory()
  }, [studentId, filter, toast])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Contest History</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {CONTEST_HISTORY_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Rating Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {contestHistory?.contests?.length > 0 ? (
                  <RatingGraph contests={contestHistory.contests} />
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-muted-foreground">No contest data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contests</CardTitle>
            </CardHeader>
            <CardContent>
              <ContestList contests={contestHistory?.contests || []} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}