import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { medicationId, takenAt } = body

    if (!medicationId) {
      return NextResponse.json(
        { error: 'Medication ID is required' },
        { status: 400 }
      )
    }

    // Verify the medication belongs to the user
    const medication = await prisma.medication.findFirst({
      where: {
        id: medicationId,
        userId: session.user.id
      }
    })

    if (!medication) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      )
    }

    // Get today's date for the daily log
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Update or create today's daily log with medication taken
    const dailyLog = await prisma.dailyLog.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      },
      update: {
        medicationTaken: true,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        date: today,
        medicationTaken: true
      }
    })

    // Create a medication log entry (you could extend the schema for this)
    // For now, we'll just log it in the notes field
    const takenAtTime = takenAt ? new Date(takenAt) : new Date()
    const timeString = takenAtTime.toLocaleTimeString()
    
    const existingNotes = dailyLog.notes || ''
    const medicationNote = `Medication "${medication.name}" taken at ${timeString}`
    const updatedNotes = existingNotes 
      ? `${existingNotes}\n${medicationNote}`
      : medicationNote

    await prisma.dailyLog.update({
      where: {
        id: dailyLog.id
      },
      data: {
        notes: updatedNotes
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Medication marked as taken',
      takenAt: takenAtTime.toISOString()
    })

  } catch (error) {
    console.error('Mark medication taken error:', error)
    return NextResponse.json(
      { error: 'Failed to mark medication as taken' },
      { status: 500 }
    )
  }
}