
'use client'

import { AuthGuard } from '@/components/layout/auth-guard'
import { Navbar } from '@/components/layout/navbar'
import { DailyLogForm } from '@/components/daily-log/daily-log-form'

export default function DailyLogPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Daily Check-in</h1>
            <p className="text-gray-600">
              Take a few minutes to reflect on your day and track your well-being.
            </p>
          </div>
          
          <DailyLogForm />
        </div>
      </div>
    </AuthGuard>
  )
}
