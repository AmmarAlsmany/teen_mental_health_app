'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AuthGuard } from '@/components/layout/auth-guard'
import { MobileHeader } from '@/components/layout/mobile-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Heart, 
  Plus, 
  Clock,
  Bell,
  Pill,
  Trash2,
  Calendar,
  BellRing,
  TestTube,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  medicationReminderService, 
  formatReminderTime,
  getTimeUntilReminder,
  type MedicationReminder 
} from '@/lib/medication-reminders'

interface Medication {
  id: string
  name: string
  dosage?: string
  frequency?: string
  reminderTimes?: string[]
  reminderDate?: string
  isActive: boolean
}

export default function MedicationsPage() {
  const { data: session } = useSession() || {}
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: '',
    reminderTimes: [''],
    reminderDate: ''
  })
  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | 'default'>('default')

  useEffect(() => {
    fetchMedications()
    checkNotificationPermission()
  }, [])

  useEffect(() => {
    if (medications.length > 0) {
      updateReminders()
    }
  }, [medications])

  const checkNotificationPermission = async () => {
    const permission = medicationReminderService.getNotificationPermissionStatus()
    setNotificationPermission(permission.granted ? 'granted' : permission.denied ? 'denied' : 'default')
  }

  const requestNotificationPermission = async () => {
    const permission = await medicationReminderService.requestNotificationPermission()
    setNotificationPermission(permission.granted ? 'granted' : permission.denied ? 'denied' : 'default')
    
    if (permission.granted) {
      toast.success('Notifications enabled! You\'ll get reminders for your medications.')
      updateReminders()
    } else if (permission.denied) {
      toast.error('Notifications blocked. You can enable them in your browser settings.')
    }
  }

  const fetchMedications = async () => {
    try {
      const response = await fetch('/api/medications')
      const data = await response.json()
      setMedications(data.medications || [])
    } catch (error) {
      console.error('Failed to fetch medications:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateReminders = () => {
    const activeReminders: MedicationReminder[] = medications
      .filter(med => med.isActive && med.reminderTimes && med.reminderTimes.length > 0)
      .map(med => ({
        id: med.id,
        name: med.name,
        dosage: med.dosage,
        reminderTimes: med.reminderTimes || [],
        reminderDate: med.reminderDate,
        isActive: med.isActive
      }))
    
    medicationReminderService.updateMedications(activeReminders)
  }

  const testNotification = () => {
    medicationReminderService.testNotification()
    toast.info('Test notification will appear in 3 seconds')
  }

  const addReminderTime = () => {
    setNewMed({
      ...newMed,
      reminderTimes: [...newMed.reminderTimes, '']
    })
  }

  const removeReminderTime = (index: number) => {
    const newTimes = newMed.reminderTimes.filter((_, i) => i !== index)
    setNewMed({
      ...newMed,
      reminderTimes: newTimes.length > 0 ? newTimes : ['']
    })
  }

  const updateReminderTime = (index: number, time: string) => {
    const newTimes = [...newMed.reminderTimes]
    newTimes[index] = time
    setNewMed({ ...newMed, reminderTimes: newTimes })
  }

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMed.name.trim()) {
      toast.error('Medication name is required')
      return
    }

    // Filter out empty reminder times
    const validReminderTimes = newMed.reminderTimes.filter(time => time.trim() !== '')
    if (validReminderTimes.length === 0) {
      toast.error('At least one reminder time is required')
      return
    }

    try {
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMed,
          reminderTimes: validReminderTimes
        })
      })

      if (response.ok) {
        toast.success('Medication added successfully!')
        setNewMed({ name: '', dosage: '', frequency: '', reminderTimes: [''], reminderDate: '' })
        setShowAddForm(false)
        fetchMedications()
      } else {
        toast.error('Failed to add medication')
      }
    } catch (error) {
      toast.error('Failed to add medication')
    }
  }

  const toggleReminder = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/medications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        toast.success(isActive ? 'Reminder disabled' : 'Reminder enabled')
        fetchMedications()
      } else {
        toast.error('Failed to update reminder')
      }
    } catch (error) {
      toast.error('Failed to update reminder')
    }
  }

  const deleteMedication = async (id: string) => {
    try {
      const response = await fetch(`/api/medications/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Medication removed')
        fetchMedications()
      } else {
        toast.error('Failed to remove medication')
      }
    } catch (error) {
      toast.error('Failed to remove medication')
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <MobileHeader />
          <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
            <div className="text-center">
              <Heart className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-4" />
              <p className="text-gray-600">Loading your medications...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <MobileHeader />
        
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <Pill className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Medicine Reminders</h1>
            </div>
            <p className="text-gray-600">
              Manage your medications and set up reminders to never miss a dose.
            </p>
          </div>

          {/* Notification Permission Card */}
          {notificationPermission !== 'granted' && (
            <Card className="mb-6 bg-amber-50 border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <BellRing className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-800 mb-1">Enable Notifications</p>
                    <p className="text-sm text-amber-700 mb-3">
                      Allow notifications to receive medication reminders at the right time.
                    </p>
                    <Button
                      onClick={requestNotificationPermission}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Enable Notifications
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Notification Card */}
          {notificationPermission === 'granted' && (
            <Card className="mb-6 bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3">
                    <TestTube className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-800 mb-1">Notifications Enabled ✓</p>
                      <p className="text-sm text-green-700">
                        Test your notifications to make sure they work properly.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={testNotification}
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    Test Reminder
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Medication Button */}
          {!showAddForm && (
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Medication
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Add Medication Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Medication</CardTitle>
                <CardDescription>
                  Set up a new medication with multiple reminder times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMedication} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Medication Name *</Label>
                      <Input
                        id="name"
                        value={newMed.name}
                        onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                        placeholder="e.g., Sertraline"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        value={newMed.dosage}
                        onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                        placeholder="e.g., 50mg"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="frequency">How Often</Label>
                    <Input
                      id="frequency"
                      value={newMed.frequency}
                      onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                      placeholder="e.g., Twice daily"
                    />
                  </div>

                  {/* Multiple Reminder Times */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Reminder Times *</Label>
                      <Button
                        type="button"
                        onClick={addReminderTime}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Time
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {newMed.reminderTimes.map((time, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => updateReminderTime(index, e.target.value)}
                            className="flex-1"
                            required={index === 0}
                          />
                          {newMed.reminderTimes.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeReminderTime(index)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Add multiple times for medications taken several times per day
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="reminderDate">Reminder Date (Optional)</Label>
                    <Input
                      id="reminderDate"
                      type="date"
                      value={newMed.reminderDate}
                      onChange={(e) => setNewMed({ ...newMed, reminderDate: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty for daily recurring reminders
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      Add Medication
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Medications List */}
          {medications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No medications added yet</h3>
                <p className="text-gray-600 mb-4">
                  Add your first medication to start tracking reminders
                </p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="outline"
                >
                  Add Medication
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {medications.map((med) => (
                <Card key={med.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{med.name}</h3>
                          {med.dosage && (
                            <Badge variant="outline">{med.dosage}</Badge>
                          )}
                          {med.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Paused</Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                          {med.frequency && (
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{med.frequency}</span>
                            </span>
                          )}
                          {med.reminderTimes && med.reminderTimes.length > 0 && (
                            <span className="flex items-center space-x-1">
                              <Bell className="h-4 w-4" />
                              <span>
                                {med.reminderTimes.map(time => formatReminderTime(time)).join(', ')}
                              </span>
                            </span>
                          )}
                          {med.reminderDate && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(med.reminderDate).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>

                        {/* Next reminder time */}
                        {med.isActive && med.reminderTimes && med.reminderTimes.length > 0 && (
                          <div className="text-xs text-blue-600 font-medium">
                            Next reminder: {getTimeUntilReminder({
                              id: med.id,
                              name: med.name,
                              dosage: med.dosage,
                              reminderTimes: med.reminderTimes,
                              reminderDate: med.reminderDate,
                              isActive: med.isActive
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`reminder-${med.id}`} className="text-sm">
                            Reminder
                          </Label>
                          <Switch
                            id={`reminder-${med.id}`}
                            checked={med.isActive}
                            onCheckedChange={() => toggleReminder(med.id, med.isActive)}
                          />
                        </div>
                        <Button
                          onClick={() => deleteMedication(med.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info Card */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Bell className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">Reminder Tips</p>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Set multiple reminder times for medications taken several times per day</li>
                    <li>• You'll get browser notifications at each scheduled time</li>
                    <li>• Click "Mark as Taken" in the notification to log your medication</li>
                    <li>• Use "Snooze" if you need a 10-minute reminder</li>
                    <li>• Make sure notifications are enabled in your browser</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}