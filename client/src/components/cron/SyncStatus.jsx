/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { RotateCw, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { useToast } from '@/components/common/UI/Toast/useToast'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/common/UI/Card'
import { Button } from '@/components/common/UI/Button'
import { formatDate, formatRelativeTime } from '@/utils/dateUtils'
import cronService from '@/services/cronService'

export default function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRunningSync, setIsRunningSync] = useState(false)
  const { toast } = useToast()

  const fetchStatus = async () => {
    try {
      const status = await cronService.getSyncStatus()
      setSyncStatus(status)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch sync status',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [toast])

  const handleManualSync = async () => {
    setIsRunningSync(true)
    try {
      await cronService.triggerManualSync()
      toast({
        title: 'Success',
        description: 'Manual sync initiated successfully'
      })
      // Refresh the status after sync
      await fetchStatus()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to trigger manual sync',
        variant: 'destructive'
      })
    } finally {
      setIsRunningSync(false)
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

  const getStatusIcon = () => {
    if (!syncStatus) return <AlertCircle className="h-8 w-8 text-muted-foreground" />
    
    if (syncStatus.isRunning) return <RotateCw className="h-8 w-8 text-blue-500 animate-spin" />
    
    if (syncStatus.lastSync) {
      if (syncStatus.lastSync.success) {
        return <CheckCircle className="h-8 w-8 text-green-500" />
      } else {
        return <AlertCircle className="h-8 w-8 text-red-500" />
      }
    }
    
    return <Clock className="h-8 w-8 text-muted-foreground" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          
          <div className="text-center">
            {syncStatus?.isRunning ? (
              <p className="font-medium">Sync is currently running</p>
            ) : syncStatus?.lastSync ? (
              <>
                <p className="font-medium">
                  Last sync: {formatRelativeTime(new Date(syncStatus.lastSync.timestamp))}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(new Date(syncStatus.lastSync.timestamp))}
                </p>
                {syncStatus.lastSync.success ? (
                  <p className="text-sm text-green-500 mt-2">
                    Success: {syncStatus.lastSync.studentsUpdated} students updated
                  </p>
                ) : (
                  <p className="text-sm text-red-500 mt-2">
                    Failed: {syncStatus.lastSync.error || 'Unknown error'}
                  </p>
                )}
              </>
            ) : (
              <p className="font-medium">No sync has been run yet</p>
            )}
          </div>
          
          {syncStatus?.nextSync && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Next scheduled sync: {formatRelativeTime(new Date(syncStatus.nextSync))}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={handleManualSync} 
          disabled={isRunningSync || syncStatus?.isRunning}
        >
          <RotateCw className={`mr-2 h-4 w-4 ${isRunningSync ? 'animate-spin' : ''}`} />
          Run Manual Sync
        </Button>
      </CardFooter>
    </Card>
  )
}