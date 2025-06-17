import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/UI/Tabs'
import CronSettings from '@/components/cron/CronSettings'
import SyncStatus from '@/components/cron/SyncStatus'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      
      <Tabs defaultValue="sync" className="w-full">
        <TabsList>
          <TabsTrigger value="sync">Data Sync</TabsTrigger>
        </TabsList>
        <TabsContent value="sync" className="space-y-6 pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <CronSettings />
            </div>
            <div>
              <SyncStatus />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}