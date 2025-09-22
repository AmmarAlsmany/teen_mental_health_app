
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AuthGuard } from '@/components/layout/auth-guard'
import { MobileHeader } from '@/components/layout/mobile-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  TrendingUp, 
  Calendar,
  Moon,
  Battery,
  Smile
} from 'lucide-react'

export default function ProgressPage() {
  const { data: session } = useSession() || {}
  const [progressData, setProgressData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgressData()
  }, [])

  const fetchProgressData = async () => {
    try {
      const response = await fetch('/api/progress')
      const data = await response.json()
      setProgressData(data)
    } catch (error) {
      console.error('Failed to fetch progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-600'
    if (mood >= 6) return 'text-yellow-600'
    if (mood >= 4) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <MobileHeader />
          <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
            <div className="text-center">
              <Heart className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-4" />
              <p className="text-gray-600">Loading your progress...</p>
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
        
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Progress</h1>
            </div>
            <p className="text-gray-600">
              Track your mental health journey and see how you're improving over time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Overall Stats */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Weekly Overview</span>
                  </CardTitle>
                  <CardDescription>
                    Your mental health trends over the past week
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Mood Trend */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Average Mood</span>
                      <span className={`font-medium ${getMoodColor(progressData?.averageMood || 0)}`}>
                        {progressData?.averageMood?.toFixed(1) || 'N/A'}/10
                      </span>
                    </div>
                    <Progress value={(progressData?.averageMood || 0) * 10} className="h-3" />
                  </div>

                  {/* Sleep Quality */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center space-x-2">
                        <Moon className="h-4 w-4" />
                        <span>Sleep Quality</span>
                      </span>
                      <span className="font-medium">
                        {progressData?.averageSleep?.toFixed(1) || 'N/A'}/5
                      </span>
                    </div>
                    <Progress value={(progressData?.averageSleep || 0) * 20} className="h-3" />
                  </div>

                  {/* Energy Level */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center space-x-2">
                        <Battery className="h-4 w-4" />
                        <span>Energy Level</span>
                      </span>
                      <span className="font-medium">
                        {progressData?.averageEnergy?.toFixed(1) || 'N/A'}/10
                      </span>
                    </div>
                    <Progress value={(progressData?.averageEnergy || 0) * 10} className="h-3" />
                  </div>

                  {/* Medication Adherence */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Medication Adherence</span>
                      <span className="font-medium">
                        {progressData?.medicationAdherence || 0}%
                      </span>
                    </div>
                    <Progress value={progressData?.medicationAdherence || 0} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Summary */}
            <div className="space-y-4 sm:space-y-6">
              {/* Streak Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Check-in Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {progressData?.streak || 0}
                    </div>
                    <p className="text-sm text-gray-600">days in a row</p>
                  </div>
                </CardContent>
              </Card>

              {/* This Week */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">This Week</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Check-ins completed</span>
                    <Badge variant="outline">{progressData?.weeklyCheckins || 0}/7</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Medications taken</span>
                    <Badge variant="outline">{progressData?.weeklyMeds || 0}%</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Good days</span>
                    <Badge variant="outline" className="text-green-600">
                      {progressData?.goodDays || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Motivational Card */}
              <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <CardContent className="p-6 text-center">
                  <Smile className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Keep Going! 🌟</h3>
                  <p className="text-blue-100 text-sm">
                    {progressData?.streak > 0 
                      ? `Amazing ${progressData.streak} day streak! You're doing great.`
                      : "Every day is a new opportunity to feel better."
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Weekly Feedback Card */}
              {progressData?.weeklyFeedback && (
                <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3 text-center">This Week's Insight</h3>
                    <p className="text-purple-100 text-sm leading-relaxed">
                      {progressData.weeklyFeedback}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
