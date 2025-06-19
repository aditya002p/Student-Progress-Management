import { useParams, useNavigate } from 'react-router-dom';
import { useStudentContext } from '@/context/StudentContext';
import EditStudentForm from '@/components/student/StudentForm/EditStudentForm';
import { Button } from '@/components/common/UI/Button';

export default function EditStudentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students } = useStudentContext();
  const student = students.find(s => s._id === id);

  if (!student) {
    return <div>Student not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit Student</h1>
        <Button variant="outline" onClick={() => navigate('/students')}>
          Back to Students
        </Button>
      </div>
      <EditStudentForm student={student} />
    </div>
  );
}
