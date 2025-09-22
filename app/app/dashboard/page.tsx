
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AuthGuard } from '@/components/layout/auth-guard'
import { Navbar } from '@/components/layout/navbar'
import { MobileHeader } from '@/components/layout/mobile-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { DepressionLearningCard } from '@/components/education/depression-learning-card'

import { 
  Heart, 
  Calendar, 
  Brain, 
  MessageCircle, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Moon,
  Battery,
  Apple,
  FileText
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { data: session } = useSession() || {}
  const router = useRouter()
  const [todayLog, setTodayLog] = useState<any>(null)
  const [stats, setStats] = useState({
    streak: 0,
    averageMood: 0,
    totalLogs: 0
  })

  useEffect(() => {
    // Fetch today's log and stats
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      const data = await response.json()
      setTodayLog(data.todayLog)
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-600'
    if (mood >= 6) return 'text-yellow-600'
    if (mood >= 4) return 'text-orange-600'
    return 'text-red-600'
  }



  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <MobileHeader />
        
        <div className="container mx-auto px-3 py-4 sm:py-8 max-w-6xl">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <Heart className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900">
                Hey {session?.user?.name?.split(' ')[0]}! 👋
              </h1>
            </div>
            <p className="text-gray-600">
              Welcome to your mental health space. Let's check in on how you're doing today.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <Card className={`card-press cursor-pointer hover:shadow-lg transition-all duration-200 min-h-[140px] ${
              todayLog ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">Daily Check-in</h3>
                    <p className="text-xs text-gray-600">
                      {todayLog ? 'Completed today' : 'Log your mood & feelings'}
                    </p>
                  </div>
                  {todayLog ? (
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 ml-2" />
                  ) : (
                    <Calendar className="h-6 w-6 text-blue-500 flex-shrink-0 ml-2" />
                  )}
                </div>
                <Button 
                  className="w-full mt-3 h-9 text-sm" 
                  variant={todayLog ? 'outline' : 'default'}
                  onClick={() => router.push('/daily-log')}
                >
                  {todayLog ? 'Review Today' : 'Check In Now'}
                </Button>
              </CardContent>
            </Card>

            <DepressionLearningCard />

            <Card className="card-press cursor-pointer hover:shadow-lg transition-all duration-200 min-h-[140px]">
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">AI Support</h3>
                    <p className="text-xs text-gray-600">
                      Chat with our AI companion
                    </p>
                  </div>
                  <MessageCircle className="h-6 w-6 text-indigo-500 flex-shrink-0 ml-2" />
                </div>
                <Button 
                  className="w-full mt-3 h-9 text-sm" 
                  variant="outline"
                  onClick={() => router.push('/chat')}
                >
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="card-press cursor-pointer hover:shadow-lg transition-all duration-200 min-h-[140px]">
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">Progress</h3>
                    <p className="text-xs text-gray-600">
                      View your trends & insights
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-500 flex-shrink-0 ml-2" />
                </div>
                <Button 
                  className="w-full mt-3 h-9 text-sm" 
                  variant="outline"
                  onClick={() => router.push('/progress')}
                >
                  View Progress
                </Button>
              </CardContent>
            </Card>

            <Card className="card-press cursor-pointer hover:shadow-lg transition-all duration-200 min-h-[140px]">
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">Weekly Report</h3>
                    <p className="text-xs text-gray-600">
                      Comprehensive weekly analysis
                    </p>
                  </div>
                  <FileText className="h-6 w-6 text-purple-500 flex-shrink-0 ml-2" />
                </div>
                <Button 
                  className="w-full mt-3 h-9 text-sm" 
                  variant="outline"
                  onClick={() => router.push('/weekly-report')}
                >
                  View Report
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Today's Summary */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Today's Summary</span>
                  </CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {todayLog ? (
                    <div className="space-y-6">
                      {/* Mood */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Heart className="h-5 w-5 text-pink-500" />
                          <span className="font-medium">Mood</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${getMoodColor(todayLog.moodRating || 0)}`}>
                            {todayLog.moodRating || 'N/A'}/10
                          </span>
                        </div>
                      </div>

                      {/* Sleep */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Moon className="h-5 w-5 text-indigo-500" />
                          <span className="font-medium">Sleep Quality</span>
                        </div>
                        <Badge variant="outline">
                          {todayLog.sleepQuality || 'N/A'}/5
                        </Badge>
                      </div>

                      {/* Energy */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Battery className="h-5 w-5 text-yellow-500" />
                          <span className="font-medium">Energy Level</span>
                        </div>
                        <Badge variant="outline">
                          {todayLog.energyLevel || 'N/A'}/10
                        </Badge>
                      </div>

                      {/* Medications */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Apple className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Medication</span>
                        </div>
                        <Badge variant={todayLog.medicationTaken ? 'default' : 'destructive'}>
                          {todayLog.medicationTaken ? 'Taken' : 'Not Taken'}
                        </Badge>
                      </div>

                      {/* Positive Moments */}
                      {todayLog.positiveMoments && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-800 mb-2">Today's Highlight ✨</h4>
                          <p className="text-green-700 text-sm">{todayLog.positiveMoments}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 mb-2">No check-in yet today</h3>
                      <p className="text-gray-600 mb-4">
                        Take a few minutes to record how you're feeling
                      </p>
                      <Button onClick={() => router.push('/daily-log')}>
                        Start Daily Check-in
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stats & Assessment */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Check-in Streak</span>
                      <span className="font-medium">{stats.streak} days</span>
                    </div>
                    <Progress value={Math.min(stats.streak * 10, 100)} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Average Mood</span>
                      <span className={`font-medium ${getMoodColor(stats.averageMood)}`}>
                        {stats.averageMood.toFixed(1)}/10
                      </span>
                    </div>
                    <Progress value={stats.averageMood * 10} className="h-2" />
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Check-ins</span>
                      <span className="font-medium">{stats.totalLogs}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Motivation Card */}
              <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
                <CardContent className="p-6 text-center">
                  <Heart className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">You're doing great! 🌟</h3>
                  <p className="text-green-100 text-sm">
                    {stats.streak > 0 
                      ? `${stats.streak} day streak! Keep it up!`
                      : "Every day is a new opportunity."
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Crisis Resources */}
              <Card className="bg-red-50 border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg text-red-800 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Need Help?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-red-700">
                    <p><strong>U.S.:</strong> Call 988 - Crisis Lifeline</p>
                    <p><strong>U.S.:</strong> Text HOME to 741741 - Crisis Text</p>
                    <p><strong>U.S.:</strong> Call 1-800-852-8336 - Teen Line</p>
                    <p className="mt-2"><strong>Outside U.S.:</strong> Contact local emergency services</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
