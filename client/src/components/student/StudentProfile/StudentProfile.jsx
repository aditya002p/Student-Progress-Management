import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useToast } from '@/components/common/UI/Toast/useToast'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/UI/Tabs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/UI/Card'
import StudentActions from '@/components/student/StudentTable/StudentActions'
import ContestHistory from './ContestHistory/ContestHistory'
import ProblemSolvingData from './ProblemSolvingData/ProblemSolvingData'
import studentService from '@/services/studentService'
import { formatRelativeTime } from '@/utils/dateUtils'
import { getRatingColor, getRatingLabel } from '@/utils/chartUtils'

export default function StudentProfile() {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await studentService.getStudentById(id)
        setStudent(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch student data',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudent()
  }, [id, toast])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold">Student not found</h2>
        <p className="text-muted-foreground mt-2">
          The student you're looking for doesn't exist or has been removed.
        </p>
      </div>
    )
  }

  const ratingColor = student.currentRating ? getRatingColor(student.currentRating) : ''
  const ratingLabel = student.currentRating ? getRatingLabel(student.currentRating) : 'Unrated'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <p className="text-muted-foreground">{student.email}</p>
        </div>
        <StudentActions student={student} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Codeforces Handle</p>
              <p className="font-medium">{student.codeforcesHandle || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Current Rating</p>
              <p className="font-medium" style={{ color: ratingColor }}>
                {student.currentRating || '-'} 
                {student.currentRating && <span className="ml-1 text-xs">({ratingLabel})</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Max Rating</p>
              <p className="font-medium" style={{ color: getRatingColor(student.maxRating) }}>
                {student.maxRating || '-'}
                {student.maxRating && <span className="ml-1 text-xs">({getRatingLabel(student.maxRating)})</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
              <p>{student.phoneNumber || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Email Notifications</p>
              <p>{student.emailNotificationsEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Last Data Update</p>
              <p>{student.lastUpdated ? formatRelativeTime(student.lastUpdated) : 'Never'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="contest-history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contest-history">Contest History</TabsTrigger>
          <TabsTrigger value="problem-solving">Problem Solving</TabsTrigger>
        </TabsList>
        <TabsContent value="contest-history" className="pt-4">
          <ContestHistory studentId={student._id} />
        </TabsContent>
        <TabsContent value="problem-solving" className="pt-4">
          <ProblemSolvingData studentId={student._id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}