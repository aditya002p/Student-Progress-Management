import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Search } from 'lucide-react'
import { useStudentContext } from '@/context/StudentContext'
import { useToast } from '@/components/common/UI/Toast/useToast'
import exportService from '@/services/exportService'
import { formatDate } from '@/utils/dateUtils'
import StudentRow from './StudentRow'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from '@/components/common/UI/Table'
import { Button } from '@/components/common/UI/Button'
import { Input } from '@/components/common/UI/Input'

export default function StudentTable() {
  const { students, isLoading } = useStudentContext()
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()

  // Filter students based on search term
const filteredStudents = Array.isArray(students)
  ? students.filter((student) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        student.name?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower) ||
        student.codeforcesHandle?.toLowerCase().includes(searchLower)
      );
    })
  : [];

  const handleExportCSV = async () => {
    try {
      await exportService.exportStudentsAsCSV()
      toast({
        title: 'Success',
        description: 'Students data exported successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export students data',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            onClick={() => navigate('/students/new')}
            size="sm"
          >
            Add Student
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden md:table-cell">CF Handle</TableHead>
              <TableHead className="hidden md:table-cell">Current Rating</TableHead>
              <TableHead className="hidden md:table-cell">Max Rating</TableHead>
              <TableHead className="hidden md:table-cell">Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <td colSpan={8} className="py-6 text-center">
                  <div className="flex justify-center">
                    <div className="loading-spinner" />
                  </div>
                </td>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <td colSpan={8} className="py-6 text-center">
                  {searchTerm ? 'No students match your search' : 'No students found. Add some students to get started.'}
                </td>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <StudentRow 
                  key={student._id}
                  student={student}
                  onViewDetails={() => navigate(`/students/${student._id}`)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}