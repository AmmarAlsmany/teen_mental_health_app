// Medication Reminder Service
// Handles browser notifications and reminder scheduling for medications

export interface MedicationReminder {
  id: string
  name: string
  dosage?: string
  reminderTimes: string[] // Array of HH:MM format times
  reminderDate?: string // YYYY-MM-DD format
  isActive: boolean
  snoozeUntil?: Date
}

export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

class MedicationReminderService {
  private reminderIntervals: Map<string, NodeJS.Timeout> = new Map()
  private notificationQueue: MedicationReminder[] = []
  private isServiceWorkerRegistered = false

  constructor() {
    // Only initialize if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.initializeService()
    }
  }

  private async initializeService() {
    // Check if notifications are supported
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return
    }

    // Register service worker for background notifications if available
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js')
        this.isServiceWorkerRegistered = true
        console.log('Service worker registered for medication reminders')
      } catch (error) {
        console.log('Service worker registration failed:', error)
      }
    }

    // Start checking for reminders every minute
    this.startReminderChecker()
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { granted: false, denied: true, default: false }
    }

    let permission = Notification.permission

    if (permission === 'default') {
      permission = await Notification.requestPermission()
    }

    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    }
  }

  getNotificationPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { granted: false, denied: true, default: false }
    }

    const permission = Notification.permission
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    }
  }

  scheduleReminder(medication: MedicationReminder) {
    if (!medication.isActive || !medication.reminderTimes || medication.reminderTimes.length === 0) {
      return
    }

    // Clear existing reminders for this medication
    this.clearReminder(medication.id)

    // Schedule reminders for each time
    medication.reminderTimes.forEach((reminderTime, index) => {
      const nextReminderTime = this.calculateNextReminderTime({
        ...medication,
        reminderTime
      })
      
      if (!nextReminderTime) {
        return
      }

      const timeUntilReminder = nextReminderTime.getTime() - Date.now()

      if (timeUntilReminder <= 0) {
        // Time has already passed, show notification immediately
        this.showNotification(medication, reminderTime)
        return
      }

      // Schedule the reminder with a unique ID for each time
      const uniqueId = `${medication.id}-${index}`
      const timeoutId = setTimeout(() => {
        this.showNotification(medication, reminderTime)
        // Reschedule for the next day if it's a recurring reminder
        if (!medication.reminderDate) {
          this.scheduleReminder(medication)
        }
      }, timeUntilReminder)

      this.reminderIntervals.set(uniqueId, timeoutId)
    })
  }

  clearReminder(medicationId: string) {
    // Clear all timeouts for this medication (including multiple times)
    const keysToDelete: string[] = []
    this.reminderIntervals.forEach((timeout, key) => {
      if (key.startsWith(medicationId)) {
        clearTimeout(timeout)
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.reminderIntervals.delete(key))
  }

  clearAllReminders() {
    this.reminderIntervals.forEach((timeout) => clearTimeout(timeout))
    this.reminderIntervals.clear()
  }

  private calculateNextReminderTime(medication: { reminderTime: string, reminderDate?: string, snoozeUntil?: Date }): Date | null {
    const now = new Date()
    const [hours, minutes] = medication.reminderTime.split(':').map(Number)

    let reminderDate: Date

    if (medication.reminderDate) {
      // One-time reminder on specific date
      reminderDate = new Date(medication.reminderDate)
      reminderDate.setHours(hours, minutes, 0, 0)
      
      // If the date/time has passed, don't schedule
      if (reminderDate <= now) {
        return null
      }
    } else {
      // Daily recurring reminder
      reminderDate = new Date(now)
      reminderDate.setHours(hours, minutes, 0, 0)
      
      // If today's time has passed, schedule for tomorrow
      if (reminderDate <= now) {
        reminderDate.setDate(reminderDate.getDate() + 1)
      }
    }

    // Handle snooze
    if (medication.snoozeUntil && medication.snoozeUntil > now) {
      return medication.snoozeUntil
    }

    return reminderDate
  }

  private async showNotification(medication: MedicationReminder, specificTime?: string) {
    const permission = this.getNotificationPermissionStatus()
    
    if (!permission.granted) {
      console.log('Notification permission not granted')
      return
    }

    const displayTime = specificTime || (medication.reminderTimes && medication.reminderTimes[0]) || ''
    const title = '💊 Medication Reminder'
    const body = `Time to take your ${medication.name}${medication.dosage ? ` (${medication.dosage})` : ''} at ${formatReminderTime(displayTime)}`
    const options: NotificationOptions = {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: `medication-${medication.id}`,
      requireInteraction: true,
      data: {
        medicationId: medication.id,
        timestamp: Date.now()
      }
    }

    // Actions for service worker notifications
    const serviceWorkerOptions = {
      ...options,
      actions: [
        { action: 'taken', title: 'Mark as Taken' },
        { action: 'snooze', title: 'Snooze 10min' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    }

    try {
      if (this.isServiceWorkerRegistered && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        // Use service worker for persistent notifications
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(title, serviceWorkerOptions)
      } else {
        // Fallback to regular notifications
        const notification = new Notification(title, options)

        // Handle notification clicks
        notification.onclick = () => {
          if (typeof window !== 'undefined') {
            window.focus()
          }
          this.handleNotificationAction('taken', medication.id)
          notification.close()
        }

        // Auto-close after 30 seconds if not interacted with
        setTimeout(() => {
          notification.close()
        }, 30000)
      }
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }

  handleNotificationAction(action: string, medicationId: string) {
    switch (action) {
      case 'taken':
        this.markMedicationTaken(medicationId)
        break
      case 'snooze':
        this.snoozeMedication(medicationId, 10) // 10 minutes
        break
      case 'dismiss':
        // Just dismiss, no action needed
        break
    }
  }

  private async markMedicationTaken(medicationId: string) {
    try {
      // Log that medication was taken
      const response = await fetch('/api/medications/mark-taken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          medicationId,
          takenAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        console.log('Medication marked as taken')
        // You could show a toast notification here
        // Show success message if toast is available
        if (typeof window !== 'undefined' && (window as any).toast) {
          (window as any).toast.success('Medication marked as taken!')
        }
      }
    } catch (error) {
      console.error('Failed to mark medication as taken:', error)
    }
  }

  private snoozeMedication(medicationId: string, minutes: number) {
    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000)
    
    // Find and update the medication in our queue
    const medication = this.notificationQueue.find(med => med.id === medicationId)
    if (medication) {
      medication.snoozeUntil = snoozeUntil
      this.scheduleReminder(medication)
    }

    console.log(`Medication snoozed for ${minutes} minutes`)
  }

  updateMedications(medications: MedicationReminder[]) {
    // Clear all existing reminders
    this.clearAllReminders()
    
    // Update our queue
    this.notificationQueue = medications.filter(med => med.isActive)
    
    // Schedule new reminders
    this.notificationQueue.forEach(medication => {
      this.scheduleReminder(medication)
    })
  }

  private startReminderChecker() {
    // Check every minute for any reminders that might have been missed
    setInterval(() => {
      this.notificationQueue.forEach(medication => {
        if (!this.reminderIntervals.has(medication.id)) {
          // Reschedule if not already scheduled
          this.scheduleReminder(medication)
        }
      })
    }, 60000) // Every minute
  }

  // Get next reminder time for display
  getNextReminderTime(medication: MedicationReminder): Date | null {
    if (!medication.reminderTimes || medication.reminderTimes.length === 0) {
      return null
    }

    // Find the earliest next reminder time
    let earliestTime: Date | null = null
    
    medication.reminderTimes.forEach(reminderTime => {
      const nextTime = this.calculateNextReminderTime({
        ...medication,
        reminderTime
      })
      
      if (nextTime && (!earliestTime || nextTime < earliestTime)) {
        earliestTime = nextTime
      }
    })
    
    return earliestTime
  }

  // Check if reminders are working
  testNotification() {
    const testMedication: MedicationReminder = {
      id: 'test',
      name: 'Test Medication',
      dosage: '10mg',
      reminderTimes: [new Date().toTimeString().slice(0, 5)],
      isActive: true
    }
    
    setTimeout(() => {
      this.showNotification(testMedication)
    }, 3000) // Show in 3 seconds
  }
}

// Export singleton instance
export const medicationReminderService = new MedicationReminderService()

// Helper function to format time for display
export function formatReminderTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Helper function to get time until next reminder
export function getTimeUntilReminder(medication: MedicationReminder): string {
  const nextTime = medicationReminderService.getNextReminderTime(medication)
  if (!nextTime) return ''
  
  const now = new Date()
  const diffMs = nextTime.getTime() - now.getTime()
  
  if (diffMs <= 0) return 'Now'
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`
  } else if (diffHours > 0) {
    return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`
  } else {
    return `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
  }
}