/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/common/UI/Button'
import StudentTable from '@/components/student/StudentTable/StudentTable'
import AddStudentForm from '@/components/student/StudentForm/AddStudentForm'

export default function StudentsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const handleAddStudent = () => {
    setShowAddForm(true);
    navigate('/students/new');
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    navigate('/students');
  };

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Add New Student</h1>
          <Button 
            variant="outline" 
            onClick={handleCancelAdd}
          >
            Back to Students
          </Button>
        </div>
        
        <AddStudentForm />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Students</h1>
        <Button onClick={handleAddStudent}>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>
      
      <StudentTable />
    </div>
  )
}