import { useState } from 'react'
import { Eye, RefreshCw, Pencil, Trash2 } from 'lucide-react'
import { useStudentContext } from '@/context/StudentContext'
import { useToast } from '@/components/common/UI/Toast/useToast'
import { formatDate } from '@/utils/dateUtils'
import { getRatingColor } from '@/utils/chartUtils'
import { TableRow, TableCell } from '@/components/common/UI/Table'
import { Button } from '@/components/common/UI/Button'

export default function StudentRow({ student, onViewDetails }) {
  const { deleteStudent, refreshStudentData } = useStudentContext()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleRefresh = async (e) => {
    e.stopPropagation()
    setIsRefreshing(true)
    try {
      await refreshStudentData(student._id)
      toast({
        title: 'Success',
        description: 'Codeforces data refreshed successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh Codeforces data',
        variant: 'destructive',
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      setIsDeleting(true)
      try {
        await deleteStudent(student._id)
        toast({
          title: 'Success',
          description: 'Student deleted successfully',
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete student',
          variant: 'destructive',
        })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const ratingStyle = student.currentRating 
    ? { color: getRatingColor(student.currentRating) } 
    : {}

  const maxRatingStyle = student.maxRating 
    ? { color: getRatingColor(student.maxRating) } 
    : {}

  return (
    <TableRow className="cursor-pointer hover:bg-secondary/20" onClick={onViewDetails}>
      <TableCell className="font-medium">{student.name}</TableCell>
      <TableCell>{student.email}</TableCell>
      <TableCell className="hidden md:table-cell">{student.phoneNumber || '-'}</TableCell>
      <TableCell className="hidden md:table-cell">{student.codeforcesHandle || '-'}</TableCell>
      <TableCell className="hidden md:table-cell">
        <span className="font-medium" style={ratingStyle}>
          {student.currentRating || '-'}
        </span>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <span className="font-medium" style={maxRatingStyle}>
          {student.maxRating || '-'}
        </span>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {student.lastUpdated ? formatDate(student.lastUpdated) : 'Never'}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails()
            }}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh Codeforces Data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete Student"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}