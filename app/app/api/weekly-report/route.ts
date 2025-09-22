import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get date range for the current week
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    // Get previous week for comparison
    const prevWeekStart = new Date(startOfWeek)
    prevWeekStart.setDate(startOfWeek.getDate() - 7)
    const prevWeekEnd = new Date(endOfWeek)
    prevWeekEnd.setDate(endOfWeek.getDate() - 7)

    // Fetch current week's logs
    const currentWeekLogs = await prisma.dailyLog.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Fetch previous week's logs for comparison
    const previousWeekLogs = await prisma.dailyLog.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: prevWeekStart,
          lte: prevWeekEnd
        }
      }
    })

    // Helper function to calculate averages
    const calculateAverages = (logs: any[]) => {
      if (logs.length === 0) return { mood: 0, sleep: 0, energy: 0, medication: 0 }
      
      const averageMood = logs.reduce((sum, log) => sum + (log.moodRating || 0), 0) / logs.length
      const averageSleep = logs.reduce((sum, log) => sum + (log.sleepQuality || 0), 0) / logs.length
      const averageEnergy = logs.reduce((sum, log) => sum + (log.energyLevel || 0), 0) / logs.length
      
      const medicationLogs = logs.filter(log => log.medicationTaken !== null)
      const medicationAdherence = medicationLogs.length > 0
        ? (medicationLogs.filter(log => log.medicationTaken === true).length / medicationLogs.length) * 100
        : 0

      return {
        mood: Math.round(averageMood * 10) / 10,
        sleep: Math.round(averageSleep * 10) / 10,
        energy: Math.round(averageEnergy * 10) / 10,
        medication: Math.round(medicationAdherence)
      }
    }

    const currentWeekStats = calculateAverages(currentWeekLogs)
    const previousWeekStats = calculateAverages(previousWeekLogs)

    // Calculate trends (improvement/decline)
    const trends = {
      mood: currentWeekStats.mood - previousWeekStats.mood,
      sleep: currentWeekStats.sleep - previousWeekStats.sleep,
      energy: currentWeekStats.energy - previousWeekStats.energy,
      medication: currentWeekStats.medication - previousWeekStats.medication
    }

    // Count different metrics
    const checkInsCompleted = currentWeekLogs.length
    const goodDays = currentWeekLogs.filter(log => (log.moodRating || 0) >= 6).length
    const challengingDays = currentWeekLogs.filter(log => (log.moodRating || 0) <= 3).length

    // Most common emotions this week
    const allEmotions: string[] = []
    currentWeekLogs.forEach(log => {
      if (log.emotionCheckboxes) {
        try {
          const emotions = JSON.parse(log.emotionCheckboxes)
          allEmotions.push(...emotions)
        } catch (e) {
          // Skip invalid JSON
        }
      }
    })

    const emotionCounts = allEmotions.reduce((acc: any, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1
      return acc
    }, {})

    const topEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([emotion]) => emotion)

    // Generate insights and recommendations
    const generateInsights = () => {
      const insights = []
      
      if (trends.mood > 0.5) {
        insights.push("🌟 Your mood has improved compared to last week! Keep up the great work.")
      } else if (trends.mood < -0.5) {
        insights.push("💙 Your mood was lower this week. Remember, it's okay to have tough weeks - focus on small self-care activities.")
      }

      if (trends.sleep > 0.5) {
        insights.push("😴 Your sleep quality has improved! Good sleep is crucial for mental health.")
      } else if (currentWeekStats.sleep < 3) {
        insights.push("🌙 Consider establishing a consistent bedtime routine to improve your sleep quality.")
      }

      if (trends.medication > 10) {
        insights.push("💊 Great improvement in medication adherence! Consistency is key.")
      } else if (currentWeekStats.medication < 70) {
        insights.push("⏰ Try setting daily reminders to help maintain consistent medication routine.")
      }

      if (checkInsCompleted >= 5) {
        insights.push("✅ Excellent job staying consistent with your daily check-ins!")
      } else if (checkInsCompleted < 3) {
        insights.push("📱 Try to complete more daily check-ins next week - they help track your progress.")
      }

      return insights
    }

    const weeklyReport = {
      reportPeriod: {
        start: startOfWeek.toISOString().split('T')[0],
        end: endOfWeek.toISOString().split('T')[0]
      },
      summary: {
        checkInsCompleted,
        goodDays,
        challengingDays,
        totalDays: 7
      },
      currentWeekStats,
      previousWeekStats,
      trends,
      topEmotions,
      insights: generateInsights(),
      recommendations: [
        "Continue daily check-ins to track your mental health journey",
        "Focus on maintaining good sleep hygiene",
        "Practice mindfulness or deep breathing when feeling stressed",
        "Stay connected with supportive friends and family",
        "Remember: progress isn't always linear - every small step counts"
      ]
    }

    return NextResponse.json(weeklyReport)

  } catch (error) {
    console.error('Weekly report API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}