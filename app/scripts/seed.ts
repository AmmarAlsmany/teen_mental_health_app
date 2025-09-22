
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create crisis resources
  const crisisResources = [
    {
      name: '988 Suicide & Crisis Lifeline',
      phoneNumber: '988',
      website: 'https://988lifeline.org',
      description: '24/7 confidential support for people in distress. Call, text, or chat.',
      country: 'US'
    },
    {
      name: 'Crisis Text Line',
      phoneNumber: '741741',
      website: 'https://www.crisistextline.org',
      description: 'Text HOME to 741741 for crisis support via text message, 24/7.',
      country: 'US'
    },
    {
      name: 'Teen Line',
      phoneNumber: '800-852-8336',
      website: 'https://teenlineonline.org',
      description: 'Teens helping teens through difficult times. Call 6-9 PM PST.',
      country: 'US'
    },
    {
      name: 'Kids Help Phone (Canada)',
      phoneNumber: '1-800-668-6868',
      website: 'https://kidshelpphone.ca',
      description: '24/7 support for young people in Canada.',
      country: 'CA'
    },
    {
      name: 'Samaritans (UK)',
      phoneNumber: '116-123',
      website: 'https://www.samaritans.org',
      description: 'Free support for anyone in emotional distress. Available 24/7.',
      country: 'UK'
    }
  ]

  console.log('Creating crisis resources...')
  
  // Clear existing crisis resources first
  await prisma.crisisResource.deleteMany({})
  
  // Create new ones
  await prisma.crisisResource.createMany({
    data: crisisResources
  })

  // Create test user account (john@doe.com / johndoe123)
  console.log('Creating test user account...')
  const hashedPassword = await bcrypt.hash('johndoe123', 12)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {
      firstName: 'John',
      lastName: 'Doe',
      age: 17,
      emergencyContact: 'parent@example.com'
    },
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      age: 17,
      emergencyContact: 'parent@example.com'
    }
  })

  // Add test medications for the user
  console.log('Adding test medications...')
  await prisma.medication.createMany({
    data: [
      {
        name: 'Sertraline',
        dosage: '50mg',
        frequency: 'Daily',
        notes: 'Take with food in the morning',
        userId: testUser.id
      },
      {
        name: 'Vitamin D',
        dosage: '1000 IU',
        frequency: 'Daily',
        notes: 'For mood support',
        userId: testUser.id
      }
    ]
  })

  // Create a sample daily log entry
  console.log('Creating sample daily log...')
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  await prisma.dailyLog.upsert({
    where: {
      userId_date: {
        userId: testUser.id,
        date: yesterday
      }
    },
    update: {},
    create: {
      userId: testUser.id,
      date: yesterday,
      moodRating: 6,
      emotionCheckboxes: JSON.stringify(['hopeful', 'tired', 'grateful']),
      emotionIntensity: 5,
      positiveMoments: 'Had a good conversation with my friend at lunch',
      sleepQuality: 3,
      sleepDuration: '6-8h',
      sleepDifficulties: JSON.stringify(['trouble_falling_asleep']),
      energyLevel: 5,
      energyFluctuations: 'Low in morning, better after lunch',
      appetiteRating: 4,
      appetiteComparison: 'normal',
      mealRegularity: JSON.stringify(['breakfast', 'lunch', 'dinner']),
      medicationTaken: true,
      selfCareActivities: JSON.stringify(['shower', 'music', 'exercise']),
      socialInteractions: JSON.stringify(['friends', 'family']),
      stressors: JSON.stringify(['school', 'future']),
      copingStrategies: JSON.stringify(['music', 'talking_to_someone']),
      gratefulFor: 'My supportive friends and family',
      notes: 'Overall a decent day, looking forward to the weekend'
    }
  })

  console.log('✅ Database seeding completed successfully!')
  console.log('Test account: john@doe.com / johndoe123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
