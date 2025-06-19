import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/UI/Select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/UI/Card'
import { useToast } from '@/components/common/UI/Toast/useToast'
import ProblemStats from './ProblemStats'
import RatingBarChart from './RatingBarChart'
import SubmissionHeatmap from './SubmissionHeatmap'
import studentService from '@/services/studentService'
import { PROBLEM_DATA_FILTERS } from '@/utils/constants'

export default function ProblemSolving({ studentId }) {
  const [filter, setFilter] = useState('30days')
  const [problemData, setProblemData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProblemData = async () => {
      setIsLoading(true)
      try {
        const data = await studentService.getStudentProblemData(studentId, filter)
        setProblemData(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch problem solving data',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (studentId) {
      fetchProblemData()
    } else {
      setIsLoading(false)
      setProblemData(null)
    }
  }, [studentId, filter, toast])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Problem Solving Data</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {PROBLEM_DATA_FILTERS.map((option) => (
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
          <ProblemStats problemData={problemData} filter={filter} />

          <Card>
            <CardHeader>
              <CardTitle>Problems by Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {problemData?.solvedProblems?.length > 0 ? (
                  <RatingBarChart problems={problemData.solvedProblems} />
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-muted-foreground">No problem data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submission Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                {problemData?.submissions?.length > 0 ? (
                  <SubmissionHeatmap submissions={problemData.submissions} />
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-muted-foreground">No submission data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}