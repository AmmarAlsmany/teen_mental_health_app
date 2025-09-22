
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isActive, name, dosage, frequency, reminderTimes, reminderDate } = body

    const updateData: any = {}
    if (isActive !== undefined) updateData.isActive = isActive
    if (name !== undefined) updateData.name = name
    if (dosage !== undefined) updateData.dosage = dosage
    if (frequency !== undefined) updateData.frequency = frequency
    if (reminderTimes !== undefined) {
      updateData.reminderTimes = Array.isArray(reminderTimes)
        ? JSON.stringify(reminderTimes.filter((time: string) => time.trim() !== ''))
        : null
    }
    if (reminderDate !== undefined) updateData.reminderDate = reminderDate

    const medication = await (prisma.medication as any).update({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: updateData
    })

    return NextResponse.json({ medication })

  } catch (error) {
    console.error('Medications PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update medication' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.medication.delete({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Medications DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete medication' },
      { status: 500 }
    )
  }
}
