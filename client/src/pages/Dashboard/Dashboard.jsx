/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight, 
  CheckCircle2,
  Clock
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/UI/Card'
import { Button } from '@/components/common/UI/Button'
import { useToast } from '@/components/common/UI/Toast/useToast'
import studentService from '@/services/studentService'
import cronService from '@/services/cronService'
import { formatRelativeTime } from '@/utils/dateUtils'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    studentsWithInactivity: 0,
    recentSubmissions: 0,
    syncStatus: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // In a real app, we would have a dashboard API endpoint
        // For this exercise, we'll simulate it by combining data from multiple sources
        const studentResponse = await studentService.getAllStudents()
        const students = studentResponse.data || []
        const syncStatus = await cronService.getSyncStatus()
        
        const inactiveStudents = students.filter(student => 
          student.inactiveDays && student.inactiveDays >= 7
        )
        
        const recentlyActiveStudents = students.filter(student => 
          student.lastSubmission && 
          new Date(student.lastSubmission) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        )
        
        setStats({
          totalStudents: students.length,
          studentsWithInactivity: inactiveStudents.length,
          recentSubmissions: recentlyActiveStudents.length,
          syncStatus
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground pt-1">
              Registered in the system
            </p>
            <Button 
              variant="link" 
              className="px-0 py-1" 
              onClick={() => navigate('/students')}
            >
              View all students
              <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Inactive Students</CardTitle>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentsWithInactivity}</div>
            <p className="text-xs text-muted-foreground pt-1">
              No submissions in the last 7 days
            </p>
            {stats.studentsWithInactivity > 0 && (
              <Button 
                variant="link" 
                className="px-0 py-1 text-amber-600" 
                onClick={() => navigate('/students?filter=inactive')}
              >
                View inactive students
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentSubmissions}</div>
            <p className="text-xs text-muted-foreground pt-1">
              Students active in the last week
            </p>
            {stats.recentSubmissions > 0 && (
              <Button 
                variant="link" 
                className="px-0 py-1 text-green-600" 
                onClick={() => navigate('/students?filter=active')}
              >
                View active students
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data Sync Status</CardTitle>
            <CardDescription>Current status of Codeforces data synchronization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {stats.syncStatus?.isRunning ? (
                <>
                  <Clock className="h-5 w-5 text-blue-500 animate-spin" />
                  <span>Sync is currently running</span>
                </>
              ) : stats.syncStatus?.lastSync?.success ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Last sync completed successfully {stats.syncStatus.lastSync.timestamp ? formatRelativeTime(new Date(stats.syncStatus.lastSync.timestamp)) : ''}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span>Last sync failed or has not been run yet</span>
                </>
              )}
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/settings')}
            >
              View Sync Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used operations</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => navigate('/students/new')}>
              Add New Student
            </Button>
            <Button variant="outline" onClick={() => navigate('/settings')}>
              Configure Sync Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}