import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Helper function to convert array to JSON string for SQLite
function arrayToJson(arr: any[] | undefined | null): string | null {
  if (!arr || arr.length === 0) return null
  return JSON.stringify(arr)
}

// Helper function to parse JSON string back to array
function jsonToArray(json: string | null): any[] {
  if (!json) return []
  try {
    return JSON.parse(json)
  } catch {
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Check if user already has a log for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    let dailyLog

    if (existingLog) {
      // Update existing log
      dailyLog = await prisma.dailyLog.update({
        where: { id: existingLog.id },
        data: {
          // Mood
          moodRating: body.moodRating,
          emotionCheckboxes: arrayToJson(body.emotionCheckboxes),
          emotionIntensity: body.emotionIntensity,
          positiveMoments: body.positiveMoments,
          
          // Sleep
          sleepQuality: body.sleepQuality,
          sleepDuration: body.sleepDuration,
          sleepDifficulties: arrayToJson(body.sleepDifficulties),
          bedTime: body.bedTime,
          wakeUpTime: body.wakeUpTime,
          
          // Energy
          energyLevel: body.energyLevel,
          energyFluctuations: body.energyFluctuations,
          functionalImpact: body.functionalImpact,
          
          // Appetite
          appetiteRating: body.appetiteRating,
          appetiteComparison: body.appetiteComparison,
          mealRegularity: arrayToJson(body.mealRegularity),
          
          // Context
          medicationTaken: body.medicationTaken,
          selfCareActivities: arrayToJson(body.selfCareActivities),
          socialInteractions: arrayToJson(body.socialInteractions),
          stressors: arrayToJson(body.stressors),
          copingStrategies: arrayToJson(body.copingStrategies),
          
          // Additional
          gratefulFor: body.gratefulFor,
          notes: body.notes,
          
          updatedAt: new Date()
        }
      })
    } else {
      // Create new log
      dailyLog = await prisma.dailyLog.create({
        data: {
          userId: session.user.id,
          
          // Mood
          moodRating: body.moodRating,
          emotionCheckboxes: arrayToJson(body.emotionCheckboxes),
          emotionIntensity: body.emotionIntensity,
          positiveMoments: body.positiveMoments,
          
          // Sleep
          sleepQuality: body.sleepQuality,
          sleepDuration: body.sleepDuration,
          sleepDifficulties: arrayToJson(body.sleepDifficulties),
          bedTime: body.bedTime,
          wakeUpTime: body.wakeUpTime,
          
          // Energy
          energyLevel: body.energyLevel,
          energyFluctuations: body.energyFluctuations,
          functionalImpact: body.functionalImpact,
          
          // Appetite
          appetiteRating: body.appetiteRating,
          appetiteComparison: body.appetiteComparison,
          mealRegularity: arrayToJson(body.mealRegularity),
          
          // Context
          medicationTaken: body.medicationTaken,
          selfCareActivities: arrayToJson(body.selfCareActivities),
          socialInteractions: arrayToJson(body.socialInteractions),
          stressors: arrayToJson(body.stressors),
          copingStrategies: arrayToJson(body.copingStrategies),
          
          // Additional
          gratefulFor: body.gratefulFor,
          notes: body.notes
        }
      })
    }

    // Convert JSON strings back to arrays for the response
    const responseLog = {
      ...dailyLog,
      emotionCheckboxes: jsonToArray(dailyLog.emotionCheckboxes),
      sleepDifficulties: jsonToArray(dailyLog.sleepDifficulties),
      mealRegularity: jsonToArray(dailyLog.mealRegularity),
      selfCareActivities: jsonToArray(dailyLog.selfCareActivities),
      socialInteractions: jsonToArray(dailyLog.socialInteractions),
      stressors: jsonToArray(dailyLog.stressors),
      copingStrategies: jsonToArray(dailyLog.copingStrategies),
    }

    return NextResponse.json({ dailyLog: responseLog })

  } catch (error) {
    console.error('Daily log API error:', error)
    return NextResponse.json(
      { error: 'Failed to save daily log' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const dailyLogs = await prisma.dailyLog.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Convert JSON strings back to arrays for the response
    const formattedLogs = dailyLogs.map(log => ({
      ...log,
      emotionCheckboxes: jsonToArray(log.emotionCheckboxes),
      sleepDifficulties: jsonToArray(log.sleepDifficulties),
      mealRegularity: jsonToArray(log.mealRegularity),
      selfCareActivities: jsonToArray(log.selfCareActivities),
      socialInteractions: jsonToArray(log.socialInteractions),
      stressors: jsonToArray(log.stressors),
      copingStrategies: jsonToArray(log.copingStrategies),
    }))

    const total = await prisma.dailyLog.count({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json({
      dailyLogs: formattedLogs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Daily logs GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily logs' },
      { status: 500 }
    )
  }
}