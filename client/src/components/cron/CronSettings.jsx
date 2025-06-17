import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/components/common/UI/Toast/useToast'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/common/UI/Card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/common/UI/Form'
import { Button } from '@/components/common/UI/Button'
import { Input } from '@/components/common/UI/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/UI/Select'
import cronService from '@/services/cronService'
import { DEFAULT_CRON_TIME, DEFAULT_CRON_FREQUENCY, CRON_FREQUENCY_OPTIONS } from '@/utils/constants'

const formSchema = z.object({
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in the format HH:MM (24-hour)'
  }),
  frequency: z.string()
})

export default function CronSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      time: DEFAULT_CRON_TIME,
      frequency: DEFAULT_CRON_FREQUENCY
    }
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await cronService.getCronSettings()
        form.reset({
          time: settings.time || DEFAULT_CRON_TIME,
          frequency: settings.frequency || DEFAULT_CRON_FREQUENCY
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch cron settings',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [form, toast])

  const onSubmit = async (data) => {
    setIsSaving(true)
    try {
      await cronService.updateCronSettings(data)
      toast({
        title: 'Success',
        description: 'Cron settings updated successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update cron settings',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex justify-center">
            <div className="loading-spinner" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Codeforces Data Sync Settings</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sync Time</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                      placeholder="HH:MM"
                    />
                  </FormControl>
                  <FormDescription>
                    Time when the automatic data sync should run (24-hour format)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sync Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CRON_FREQUENCY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often the Codeforces data should be synced
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}