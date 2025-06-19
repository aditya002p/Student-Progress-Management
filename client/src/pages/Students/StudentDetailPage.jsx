import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'
import { Button } from '@/components/common/UI/Button'
import StudentProfile from '@/components/student/StudentProfile/StudentProfile'
import ContestHistory from '@/components/student/StudentProfile/ContestHistory/ContestHistory';
import ProblemSolving from '@/components/student/StudentProfile/ProblemSolving/ProblemSolving';
import EditStudentForm from '@/components/student/StudentForm/EditStudentForm'

export default function StudentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = window.location.pathname.endsWith('/edit')
  
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Edit Student</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/students/${id}`)}
          >
            Cancel
          </Button>
        </div>
        
        <EditStudentForm />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/students')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Student Details</h1>
        <div className="flex-1 flex justify-end">
          <Button 
            variant="outline"
            onClick={() => navigate(`/students/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
      
      <StudentProfile />
    </div>
  )
}