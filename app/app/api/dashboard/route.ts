
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

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's log
    const todayLog = await prisma.dailyLog.findFirst({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })


    // Calculate stats
    const allLogs = await prisma.dailyLog.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 30 // Last 30 days
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

      const hasLogForDay = allLogs.some(log => {
        const logDate = new Date(log.createdAt)
        return logDate >= dayStart && logDate < dayEnd
      })

      if (hasLogForDay) {
        streak++
      } else {
        break
      }

      checkDate.setDate(checkDate.getDate() - 1)
    }

    const totalLogs = allLogs.length
    const averageMood = allLogs.length > 0 
      ? allLogs.reduce((sum, log) => sum + (log.moodRating || 0), 0) / allLogs.length 
      : 0

    const stats = {
      streak,
      averageMood: Math.round(averageMood * 10) / 10,
      totalLogs
    }

    return NextResponse.json({
      todayLog,
      stats
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
