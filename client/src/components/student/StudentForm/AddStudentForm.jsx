/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import codeforcesService from '@/services/codeforcesService'

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phoneNumber: z.string().optional(),
  codeforcesHandle: z.string().min(1, { message: 'Codeforces handle is required' }),
  emailNotificationsEnabled: z.boolean().default(true),
})

export default function AddStudentForm() {
  const { addStudent } = useStudentContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidatingHandle, setIsValidatingHandle] = useState(false)
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

  const validateCodeforcesHandle = async (handle) => {
    if (!handle) return false
    
    setIsValidatingHandle(true)
    try {
      const isValid = await codeforcesService.validateHandle(handle)
      console.log('Validation response from service:', isValid); // Debugging line
      if (!isValid.data.success) {
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
      const newStudent = await addStudent(data)
      toast({
        title: 'Success',
        description: 'Student added successfully',
      })
      navigate(`/students/${newStudent._id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add student',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Student</CardTitle>
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
          <CardFooter className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/students')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isValidatingHandle}>
              {isSubmitting ? 'Submitting...' : 'Add Student'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}