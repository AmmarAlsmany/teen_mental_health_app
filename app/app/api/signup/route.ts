
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      emergencyContact,
      medications
    } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Provide defaults for missing fields
    const userData = {
      firstName: firstName || 'Test',
      lastName: lastName || 'User',
      age: age || 18
    }

    // Convert age to number and validate
    const ageNum = parseInt(userData.age.toString())
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 19) {
      return NextResponse.json(
        { error: 'Age must be between 10-19' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email,
        password: hashedPassword,
        age: ageNum,
        emergencyContact: emergencyContact || null,
        isActive: true
      }
    })

    // Create medications if provided
    if (medications && medications.length > 0) {
      await prisma.medication.createMany({
        data: medications.map((med: any) => ({
          userId: user.id,
          name: med.name,
          dosage: med.dosage || null,
          frequency: med.frequency || null,
          notes: med.notes || null,
          isActive: true
        }))
      })
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Account created successfully',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
