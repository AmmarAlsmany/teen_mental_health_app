'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AuthGuard } from '@/components/layout/auth-guard'
import { MobileHeader } from '@/components/layout/mobile-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PDFGenerator, ShareManager, WeeklyReportData as PDFReportData } from '@/utils/pdf-generator'
import { 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Heart,
  Moon,
  Battery,
  Pill,
  CheckCircle,
  AlertCircle,
  Smile,
  Frown,
  Download,
  Share,
  Loader2
} from 'lucide-react'

interface WeeklyReportData {
  reportPeriod: {
    start: string
    end: string
  }
  summary: {
    checkInsCompleted: number
    goodDays: number
    challengingDays: number
    totalDays: number
  }
  currentWeekStats: {
    mood: number
    sleep: number
    energy: number
    medication: number
  }
  previousWeekStats: {
    mood: number
    sleep: number
    energy: number
    medication: number
  }
  trends: {
    mood: number
    sleep: number
    energy: number
    medication: number
  }
  topEmotions: string[]
  insights: string[]
  recommendations: string[]
}

export default function WeeklyReportPage() {
  const { data: session } = useSession() || {}
  const [reportData, setReportData] = useState<WeeklyReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    fetchWeeklyReport()
  }, [])

  const fetchWeeklyReport = async () => {
    try {
      const response = await fetch('/api/weekly-report')
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Failed to fetch weekly report:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getTrendIcon = (value: number) => {
    if (value > 0.5) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (value < -0.5) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <div className="h-4 w-4" />
  }

  const getTrendColor = (value: number) => {
    if (value > 0.5) return 'text-green-600'
    if (value < -0.5) return 'text-red-600'
    return 'text-gray-600'
  }

  const transformReportDataForPDF = (data: WeeklyReportData): PDFReportData => {
    return {
      weekStart: formatDate(data.reportPeriod.start),
      weekEnd: formatDate(data.reportPeriod.end),
      totalEntries: data.summary.checkInsCompleted,
      averages: {
        mood: data.currentWeekStats.mood,
        sleep: data.currentWeekStats.sleep,
        energy: data.currentWeekStats.energy,
        medication: data.currentWeekStats.medication
      },
      trends: data.trends,
      insights: data.insights,
      recommendations: data.recommendations
    }
  }

  const handleDownloadPDF = async () => {
    if (!reportData) return
    
    setIsGeneratingPDF(true)
    try {
      const pdfData = transformReportDataForPDF(reportData)
      const pdfBlob = await PDFGenerator.generateWeeklyReportPDF(pdfData)
      const filename = `weekly-report-${formatDate(reportData.reportPeriod.start)}-${formatDate(reportData.reportPeriod.end)}.pdf`
      ShareManager.downloadPDF(pdfBlob, filename)
      
      // Show success message
      setTimeout(() => {
        alert('Report downloaded successfully!')
      }, 500)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleShare = async () => {
    if (!reportData) return
    
    setIsSharing(true)
    try {
      const pdfData = transformReportDataForPDF(reportData)
      let pdfBlob: Blob | undefined
      
      // Generate PDF for sharing if supported
      try {
        pdfBlob = await PDFGenerator.generateWeeklyReportPDF(pdfData)
      } catch (error) {
        console.warn('Could not generate PDF for sharing:', error)
      }
      
      await ShareManager.shareReport(pdfData, pdfBlob)
    } catch (error) {
      console.error('Error sharing report:', error)
      // Don't show error if user cancelled sharing
      if ((error as Error)?.name !== 'AbortError') {
        alert('Failed to share report. Please try again.')
      }
    } finally {
      setIsSharing(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <MobileHeader />
          <div className="container mx-auto px-4 py-8 max-w-md">
            <div className="text-center">
              <FileText className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-4" />
              <p className="text-gray-600">Generating your weekly report...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!reportData) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <MobileHeader />
          <div className="container mx-auto px-4 py-8 max-w-md">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Unable to generate report. Try again later.</p>
              <Button onClick={fetchWeeklyReport} className="mt-4">
                Retry
              </Button>
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
        
        <div className="container mx-auto px-4 py-6 max-w-md" id="weekly-report-content">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-purple-500" />
                <h1 className="text-2xl font-bold text-gray-900">Weekly Report</h1>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-1" />
                  )}
                  {isGeneratingPDF ? 'Generating...' : 'Download'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleShare}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Share className="h-4 w-4 mr-1" />
                  )}
                  Share
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {formatDate(reportData.reportPeriod.start)} - {formatDate(reportData.reportPeriod.end)}
            </p>
          </div>

          {/* Summary Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Week Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {reportData.summary.checkInsCompleted}
                  </div>
                  <div className="text-xs text-gray-600">Check-ins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.summary.goodDays}
                  </div>
                  <div className="text-xs text-gray-600">Good Days</div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Progress 
                  value={(reportData.summary.checkInsCompleted / 7) * 100} 
                  className="w-full h-2"
                />
              </div>
              <p className="text-xs text-center text-gray-600">
                {reportData.summary.checkInsCompleted}/7 days tracked
              </p>
            </CardContent>
          </Card>

          {/* Metrics Comparison */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">This Week vs Last Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mood */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span className="text-sm">Mood</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {reportData.currentWeekStats.mood.toFixed(1)}/10
                  </span>
                  {getTrendIcon(reportData.trends.mood)}
                  <span className={`text-xs ${getTrendColor(reportData.trends.mood)}`}>
                    {reportData.trends.mood > 0 ? '+' : ''}{reportData.trends.mood.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Sleep */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm">Sleep</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {reportData.currentWeekStats.sleep.toFixed(1)}/5
                  </span>
                  {getTrendIcon(reportData.trends.sleep)}
                  <span className={`text-xs ${getTrendColor(reportData.trends.sleep)}`}>
                    {reportData.trends.sleep > 0 ? '+' : ''}{reportData.trends.sleep.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Energy */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Battery className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Energy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {reportData.currentWeekStats.energy.toFixed(1)}/10
                  </span>
                  {getTrendIcon(reportData.trends.energy)}
                  <span className={`text-xs ${getTrendColor(reportData.trends.energy)}`}>
                    {reportData.trends.energy > 0 ? '+' : ''}{reportData.trends.energy.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Medication */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Pill className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Medication</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {reportData.currentWeekStats.medication}%
                  </span>
                  {getTrendIcon(reportData.trends.medication)}
                  <span className={`text-xs ${getTrendColor(reportData.trends.medication)}`}>
                    {reportData.trends.medication > 0 ? '+' : ''}{reportData.trends.medication.toFixed(0)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Emotions */}
          {reportData.topEmotions.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Most Common Emotions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {reportData.topEmotions.map((emotion, index) => (
                    <Badge key={emotion} variant={index === 0 ? 'default' : 'outline'}>
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Smile className="h-5 w-5" />
                <span>Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.insights.map((insight, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Recommendations for Next Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reportData.recommendations.slice(0, 3).map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <Button className="w-full" onClick={() => window.history.back()}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}