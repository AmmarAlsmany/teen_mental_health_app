
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

    const medications = await prisma.medication.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Parse reminderTimes JSON string back to array
    const medicationsWithParsedTimes = medications.map(med => {
      const medAny = med as any
      return {
        ...med,
        reminderTimes: medAny.reminderTimes ? JSON.parse(medAny.reminderTimes) : []
      }
    })

    return NextResponse.json({ medications: medicationsWithParsedTimes })

  } catch (error) {
    console.error('Medications GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, dosage, frequency, reminderTimes, reminderDate } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Medication name is required' },
        { status: 400 }
      )
    }

    // Convert reminderTimes array to JSON string for storage
    const reminderTimesJson = reminderTimes && Array.isArray(reminderTimes) 
      ? JSON.stringify(reminderTimes.filter((time: string) => time.trim() !== ''))
      : null

    const medication = await (prisma.medication as any).create({
      data: {
        userId: session.user.id,
        name,
        dosage: dosage || null,
        frequency: frequency || null,
        reminderTimes: reminderTimesJson,
        reminderDate: reminderDate || null,
        isActive: true
      }
    })

    return NextResponse.json({ medication })

  } catch (error) {
    console.error('Medications POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create medication' },
      { status: 500 }
    )
  }
}
