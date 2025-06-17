import { useState } from 'react'
import { MoreVertical, Pencil, RefreshCw, Trash2, FileDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/common/UI/Toast/useToast'
import { useStudentContext } from '@/context/StudentContext'
import exportService from '@/services/exportService'
import { Button } from '@/components/common/UI/Button'

export default function StudentActions({ student }) {
  const { deleteStudent, refreshStudentData } = useStudentContext()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleEdit = () => {
    navigate(`/students/${student._id}/edit`)
  }

  const handleRefresh = async () => {
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

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportService.exportStudentDataAsCSV(student._id)
      toast({
        title: 'Success',
        description: 'Student data exported successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export student data',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
      try {
        await deleteStudent(student._id)
        toast({
          title: 'Success',
          description: 'Student deleted successfully',
        })
        navigate('/students')
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete student',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleEdit}
      >
        <Pencil className="mr-1 h-4 w-4" />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={`mr-1 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh CF Data
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isExporting}
      >
        <FileDown className="mr-1 h-4 w-4" />
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive/10"
        onClick={handleDelete}
      >
        <Trash2 className="mr-1 h-4 w-4" />
        Delete
      </Button>
    </div>
  )
}