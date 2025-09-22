
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

    // Get last 7 days of logs
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const weeklyLogs = await prisma.dailyLog.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate streak (consecutive days with logs)
    let streak = 0
    const now = new Date()
    let checkDate = new Date(now)
    checkDate.setHours(0, 0, 0, 0)

    for (let i = 0; i < 30; i++) {
      const dayStart = new Date(checkDate)
      const dayEnd = new Date(checkDate)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const hasLogForDay = weeklyLogs.some(log => {
        const logDate = new Date(log.createdAt)
        return logDate >= dayStart && logDate < dayEnd
      })

      if (hasLogForDay) {
        streak++
      } else if (i > 0) { // Allow today to not have a log yet
        break
      }

      checkDate.setDate(checkDate.getDate() - 1)
    }

    // Calculate averages
    const averageMood = weeklyLogs.length > 0 
      ? weeklyLogs.reduce((sum, log) => sum + (log.moodRating || 0), 0) / weeklyLogs.length 
      : 0

    const averageSleep = weeklyLogs.length > 0 
      ? weeklyLogs.reduce((sum, log) => sum + (log.sleepQuality || 0), 0) / weeklyLogs.length 
      : 0

    const averageEnergy = weeklyLogs.length > 0 
      ? weeklyLogs.reduce((sum, log) => sum + (log.energyLevel || 0), 0) / weeklyLogs.length 
      : 0

    // Calculate medication adherence
    const medicationLogs = weeklyLogs.filter(log => log.medicationTaken !== null)
    const medicationAdherence = medicationLogs.length > 0
      ? (medicationLogs.filter(log => log.medicationTaken === true).length / medicationLogs.length) * 100
      : 0

    // Count good days (mood >= 6)
    const goodDays = weeklyLogs.filter(log => (log.moodRating || 0) >= 6).length

    // Generate intelligent feedback based on lowest performing metrics
    const generateWeeklyFeedback = () => {
      const metrics = {
        mood: averageMood,
        sleep: averageSleep,
        energy: averageEnergy,
        medication: medicationAdherence
      }

      // Find the lowest performing metric
      const lowestMetric = Object.entries(metrics).reduce((lowest, [key, value]) => {
        // Normalize values to 0-100 scale for comparison
        let normalizedValue = 0
        switch (key) {
          case 'mood':
          case 'energy':
            normalizedValue = value * 10 // 0-10 scale to 0-100
            break
          case 'sleep':
            normalizedValue = value * 20 // 0-5 scale to 0-100
            break
          case 'medication':
            normalizedValue = value // already 0-100
            break
        }
        
        return normalizedValue < lowest.normalizedValue 
          ? { key, value, normalizedValue }
          : lowest
      }, { key: '', value: 0, normalizedValue: 100 })

      // Generate specific feedback based on the lowest metric
      let feedback = ""
      switch (lowestMetric.key) {
        case 'medication':
          if (lowestMetric.value === 0) {
            feedback = "📝 Focus Area: Please prioritize taking your medication regularly. Consistent medication can significantly improve your mental health journey."
          } else if (lowestMetric.value < 50) {
            feedback = "💊 Focus Area: Try setting daily reminders for your medication. Consistency is key to feeling better."
          }
          break
        case 'mood':
          if (lowestMetric.value < 3) {
            feedback = "🌱 Focus Area: Your mood scores show you're going through a tough time. Consider reaching out to a trusted person or counselor for support."
          } else if (lowestMetric.value < 5) {
            feedback = "💙 Focus Area: Focus on small mood-boosting activities like listening to music, spending time outside, or connecting with friends."
          }
          break
        case 'sleep':
          if (lowestMetric.value < 2) {
            feedback = "😴 Focus Area: Poor sleep can really impact your mental health. Try establishing a consistent bedtime routine and limiting screen time before bed."
          } else if (lowestMetric.value < 3) {
            feedback = "🌙 Focus Area: Improving your sleep quality could help boost your mood and energy. Consider relaxation techniques before bed."
          }
          break
        case 'energy':
          if (lowestMetric.value < 3) {
            feedback = "⚡ Focus Area: Low energy can be challenging. Try gentle exercise, staying hydrated, and eating regular nutritious meals to boost your energy."
          } else if (lowestMetric.value < 5) {
            feedback = "🔋 Focus Area: Consider adding light physical activity or brief walks to help increase your energy levels throughout the day."
          }
          break
        default:
          feedback = "🌟 Great job on your mental health journey! Keep up the consistent self-care and check-ins."
      }

      return feedback
    }

    const weeklyFeedback = generateWeeklyFeedback()

    return NextResponse.json({
      streak,
      averageMood: Math.round(averageMood * 10) / 10,
      averageSleep: Math.round(averageSleep * 10) / 10,
      averageEnergy: Math.round(averageEnergy * 10) / 10,
      medicationAdherence: Math.round(medicationAdherence),
      weeklyCheckins: weeklyLogs.length,
      weeklyMeds: Math.round(medicationAdherence),
      goodDays,
      totalLogs: weeklyLogs.length,
      weeklyFeedback
    })

  } catch (error) {
    console.error('Progress API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
