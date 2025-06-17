import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/UI/Button'

export default function NotFound() {
  const navigate = useNavigate()
  
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center p-4">
      <h1 className="text-5xl font-extrabold tracking-tight mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => navigate(-1)}>Go Back</Button>
        <Button variant="outline" onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}