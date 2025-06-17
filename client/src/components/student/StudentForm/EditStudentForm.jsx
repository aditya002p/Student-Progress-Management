import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useStudentContext } from '@/context/StudentContext'
import { useToast } from '@/components/common/UI/Toast/useToast'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/common/UI/Card'
import { Button } from '@/components/common/UI/Button'
import { Input } from '@/components/common/UI/Input'
import { Label } from '@/components/common/UI/Label'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/common/UI/Form'
import { Switch } from '@/components/common/UI/Switch'
import studentService from '@/services/studentService'
import codeforcesService from '@/services/codeforcesService'

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phoneNumber: z.string().optional(),
  codeforcesHandle: z.string().min(1, { message: 'Codeforces handle is required' }),
  emailNotificationsEnabled: z.boolean(),
})

export default function EditStudentForm() {
  const { id } = useParams()
  const { updateStudent } = useStudentContext()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidatingHandle, setIsValidatingHandle] = useState(false)
  const [originalHandle, setOriginalHandle] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      codeforcesHandle: '',
      emailNotificationsEnabled: true,
    },
  })

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const student = await studentService.getStudentById(id)
        form.reset({
          name: student.name || '',
          email: student.email || '',
          phoneNumber: student.phoneNumber || '',
          codeforcesHandle: student.codeforcesHandle || '',
          emailNotificationsEnabled: student.emailNotificationsEnabled || false,
        })
        setOriginalHandle(student.codeforcesHandle || '')
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load student data',
          variant: 'destructive',
        })
        navigate('/students')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudent()
  }, [id, form, navigate, toast])

  const validateCodeforcesHandle = async (handle) => {
    if (!handle) return false
    
    // Skip validation if handle hasn't changed
    if (handle === originalHandle) {
      return true
    }
    
    setIsValidatingHandle(true)
    try {
      const isValid = await codeforcesService.validateHandle(handle)
      if (!isValid) {
        form.setError('codeforcesHandle', { 
          type: 'manual', 
          message: 'Codeforces handle not found or invalid' 
        })
        return false
      }
      return true
    } catch (error) {
      form.setError('codeforcesHandle', { 
        type: 'manual', 
        message: 'Error validating Codeforces handle' 
      })
      return false
    } finally {
      setIsValidatingHandle(false)
    }
  }

  const onSubmit = async (data) => {
    const isHandleValid = await validateCodeforcesHandle(data.codeforcesHandle)
    if (!isHandleValid) return
    
    setIsSubmitting(true)
    try {
      await updateStudent(id, data)
      toast({
        title: 'Success',
        description: 'Student updated successfully',
      })
      navigate(`/students/${id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update student',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Student</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="student@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Phone number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="codeforcesHandle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Codeforces Handle</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Codeforces handle" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="emailNotificationsEnabled"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Email Notifications</FormLabel>
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/students/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}