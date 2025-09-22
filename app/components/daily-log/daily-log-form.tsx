
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Moon, 
  Battery, 
  Apple, 
  Users, 
  Save,
  ChevronRight,
  ChevronLeft,
  Smile
} from 'lucide-react'
import { toast } from 'sonner'
import { DailyLogFormData, MoodEmotion, SelfCareActivity, SocialInteraction, Stressor, CopingStrategy } from '@/lib/types'

interface Props {
  initialData?: any
  onSaved?: (data: any) => void
}

const MOOD_EMOTIONS: MoodEmotion[] = [
  'happy', 'sad', 'anxious', 'angry', 'excited', 'tired',
  'frustrated', 'peaceful', 'lonely', 'hopeful', 'stressed', 'grateful'
]

const SELF_CARE_ACTIVITIES: SelfCareActivity[] = [
  'shower', 'brushed_teeth', 'exercise', 'meditation', 'music',
  'art', 'reading', 'gaming', 'nature', 'cooking', 'cleaning'
]

const SOCIAL_INTERACTIONS: SocialInteraction[] = [
  'family', 'friends', 'classmates', 'online_friends', 'teachers',
  'counselor', 'none', 'pets'
]

const STRESSORS: Stressor[] = [
  'school', 'family', 'friends', 'health', 'future', 'body_image',
  'social_media', 'relationships', 'bullying', 'finances', 'other'
]

const COPING_STRATEGIES: CopingStrategy[] = [
  'deep_breathing', 'talking_to_someone', 'exercise', 'music',
  'journaling', 'art', 'gaming', 'sleeping', 'crying', 'meditation'
]

const SLEEP_DIFFICULTIES = [
  'trouble_falling_asleep',
  'waking_up_during_night',
  'waking_up_too_early',
  'nightmares',
  'anxiety_before_bed',
  'phone_use_before_bed'
]

const MEALS = ['breakfast', 'lunch', 'dinner', 'snacks']

export function DailyLogForm({ initialData, onSaved }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const [formData, setFormData] = useState<DailyLogFormData>({
    // Simplified - only 4 key questions
    moodRating: initialData?.moodRating || undefined,
    sleepQuality: initialData?.sleepQuality || undefined,
    energyLevel: initialData?.energyLevel || undefined,
    medicationTaken: initialData?.medicationTaken || undefined,
    
    // Keep some basic fields for completeness
    emotionCheckboxes: initialData?.emotionCheckboxes || [],
    emotionIntensity: initialData?.emotionIntensity || undefined,
    positiveMoments: initialData?.positiveMoments || '',
    sleepDuration: initialData?.sleepDuration || '',
    sleepDifficulties: initialData?.sleepDifficulties || [],
    bedTime: initialData?.bedTime || '',
    wakeUpTime: initialData?.wakeUpTime || '',
    energyFluctuations: initialData?.energyFluctuations || '',
    functionalImpact: initialData?.functionalImpact || '',
    appetiteRating: initialData?.appetiteRating || undefined,
    appetiteComparison: initialData?.appetiteComparison || '',
    mealRegularity: initialData?.mealRegularity || [],
    selfCareActivities: initialData?.selfCareActivities || [],
    socialInteractions: initialData?.socialInteractions || [],
    stressors: initialData?.stressors || [],
    copingStrategies: initialData?.copingStrategies || [],
    gratefulFor: initialData?.gratefulFor || '',
    notes: initialData?.notes || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/daily-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Daily check-in saved! 🎉')
        onSaved?.(data.dailyLog)
        router.push('/dashboard')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save check-in')
      }
    } catch (error) {
      toast.error('Failed to save check-in')
    } finally {
      setIsLoading(false)
    }
  }

  // Simple, beautiful form with just 4 key questions for already diagnosed users
  const renderSimpleForm = () => (
    <div className="space-y-8">
      {/* Question 1: Mood */}
      <Card className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
        <div className="text-center mb-4">
          <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
          <h3 className="text-xl font-semibold text-gray-800">How's your mood today?</h3>
          <p className="text-gray-600 text-sm">Rate from 1 (very low) to 10 (amazing)</p>
        </div>
        <div className="space-y-4">
          <Slider
            value={[formData.moodRating || 5]}
            onValueChange={([value]) => setFormData({ ...formData, moodRating: value })}
            min={1}
            max={10}
            step={1}
            className="mb-4"
          />
          <div className="text-center">
            <Badge variant="outline" className="text-2xl px-4 py-2 bg-white border-pink-300">
              {formData.moodRating || 5}/10
            </Badge>
          </div>
        </div>
      </Card>

      {/* Question 2: Sleep */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="text-center mb-4">
          <Moon className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
          <h3 className="text-xl font-semibold text-gray-800">How was your sleep?</h3>
          <p className="text-gray-600 text-sm">Rate your sleep quality last night</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(rating => (
            <Button
              key={rating}
              type="button"
              variant={formData.sleepQuality === rating ? 'default' : 'outline'}
              className={`h-16 ${formData.sleepQuality === rating 
                ? 'bg-indigo-500 hover:bg-indigo-600' 
                : 'bg-white hover:bg-indigo-50'}`}
              onClick={() => setFormData({ ...formData, sleepQuality: rating })}
            >
              <div className="text-center">
                <div className="text-lg font-semibold">{rating}</div>
                <div className="text-xs">
                  {rating === 1 ? 'Terrible' : rating === 2 ? 'Poor' : rating === 3 ? 'Okay' : rating === 4 ? 'Good' : 'Amazing'}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Question 3: Energy */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="text-center mb-4">
          <Battery className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <h3 className="text-xl font-semibold text-gray-800">What's your energy like?</h3>
          <p className="text-gray-600 text-sm">Rate from 1 (drained) to 10 (energetic)</p>
        </div>
        <div className="space-y-4">
          <Slider
            value={[formData.energyLevel || 5]}
            onValueChange={([value]) => setFormData({ ...formData, energyLevel: value })}
            min={1}
            max={10}
            step={1}
            className="mb-4"
          />
          <div className="text-center">
            <Badge variant="outline" className="text-2xl px-4 py-2 bg-white border-green-300">
              {formData.energyLevel || 5}/10
            </Badge>
          </div>
        </div>
      </Card>

      {/* Question 4: Medication */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
        <div className="text-center mb-4">
          <Apple className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <h3 className="text-xl font-semibold text-gray-800">Did you take your medication?</h3>
          <p className="text-gray-600 text-sm">If you have prescribed medication today</p>
        </div>
        <div className="flex justify-center space-x-6">
          <Button
            type="button"
            variant={formData.medicationTaken === true ? 'default' : 'outline'}
            className={`h-16 px-8 ${formData.medicationTaken === true 
              ? 'bg-purple-500 hover:bg-purple-600' 
              : 'bg-white hover:bg-purple-50'}`}
            onClick={() => setFormData({ ...formData, medicationTaken: true })}
          >
            <div className="text-center">
              <div className="text-lg font-semibold">✅ Yes</div>
              <div className="text-xs">Taken today</div>
            </div>
          </Button>
          <Button
            type="button"
            variant={formData.medicationTaken === false ? 'default' : 'outline'}
            className={`h-16 px-8 ${formData.medicationTaken === false 
              ? 'bg-purple-500 hover:bg-purple-600' 
              : 'bg-white hover:bg-purple-50'}`}
            onClick={() => setFormData({ ...formData, medicationTaken: false })}
          >
            <div className="text-center">
              <div className="text-lg font-semibold">❌ No</div>
              <div className="text-xs">Not yet</div>
            </div>
          </Button>
          <Button
            type="button"
            variant={formData.medicationTaken === undefined ? 'default' : 'outline'}
            className={`h-16 px-8 ${formData.medicationTaken === undefined
              ? 'bg-purple-500 hover:bg-purple-600' 
              : 'bg-white hover:bg-purple-50'}`}
            onClick={() => setFormData({ ...formData, medicationTaken: undefined })}
          >
            <div className="text-center">
              <div className="text-lg font-semibold">➖ N/A</div>
              <div className="text-xs">No meds</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Optional: One positive note */}
      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <div className="text-center mb-4">
          <Smile className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <h3 className="text-xl font-semibold text-gray-800">One good thing today? ✨</h3>
          <p className="text-gray-600 text-sm">Optional - anything that made you smile</p>
        </div>
        <Textarea
          value={formData.positiveMoments}
          onChange={(e) => setFormData({ ...formData, positiveMoments: e.target.value })}
          placeholder="A good song, tasty food, funny meme, kind message... anything positive!"
          className="border-yellow-300 focus:border-yellow-400 bg-white"
          rows={3}
        />
      </Card>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <Card className="border-0 sm:border shadow-sm sm:shadow-lg mb-6">
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6 text-center">
          <CardTitle className="text-2xl sm:text-3xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Quick Daily Check-in
          </CardTitle>
          <CardDescription className="text-base sm:text-lg">
            Just 4 simple questions - takes less than 2 minutes ⚡
          </CardDescription>
        </CardHeader>
      </Card>

      {renderSimpleForm()}

      {/* Save Button */}
      <div className="mt-8 text-center">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto min-h-[56px] px-12 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg"
        >
          {isLoading ? (
            <>
              <Heart className="h-5 w-5 mr-2 animate-pulse" />
              Saving your check-in...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Check-in 🎉
            </>
          )}
        </Button>
        <p className="text-sm text-gray-500 mt-3">
          Your data is private and secure
        </p>
      </div>
    </form>
  )
}
