// Mental Health App Types for Teenagers (10-19)

export type MoodEmotion = 
  | 'happy' | 'sad' | 'anxious' | 'angry' | 'excited' | 'tired' 
  | 'frustrated' | 'peaceful' | 'lonely' | 'hopeful' | 'stressed' | 'grateful'

export type SelfCareActivity = 
  | 'shower' | 'brushed_teeth' | 'exercise' | 'meditation' | 'music' 
  | 'art' | 'reading' | 'gaming' | 'nature' | 'cooking' | 'cleaning'

export type SocialInteraction = 
  | 'family' | 'friends' | 'classmates' | 'online_friends' | 'teachers' 
  | 'counselor' | 'none' | 'pets'

export type Stressor = 
  | 'school' | 'family' | 'friends' | 'health' | 'future' | 'body_image' 
  | 'social_media' | 'relationships' | 'bullying' | 'finances' | 'other'

export type CopingStrategy = 
  | 'deep_breathing' | 'talking_to_someone' | 'exercise' | 'music' 
  | 'journaling' | 'art' | 'gaming' | 'sleeping' | 'crying' | 'meditation'


export type DailyLogFormData = {
  // Mood
  moodRating?: number
  emotionCheckboxes: string[]
  emotionIntensity?: number
  positiveMoments?: string
  
  // Sleep
  sleepQuality?: number
  sleepDuration?: string
  sleepDifficulties: string[]
  bedTime?: string
  wakeUpTime?: string
  
  // Energy
  energyLevel?: number
  energyFluctuations?: string
  functionalImpact?: string
  
  // Appetite
  appetiteRating?: number
  appetiteComparison?: string
  mealRegularity: string[]
  
  // Context
  medicationTaken?: boolean
  selfCareActivities: string[]
  socialInteractions: string[]
  stressors: string[]
  copingStrategies: string[]
  
  // Additional
  gratefulFor?: string
  notes?: string
}

export type ChatMessage = {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export type CrisisResource = {
  id: string
  name: string
  phoneNumber?: string
  website?: string
  description?: string
  country: string
}