
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, 
  Moon, 
  Battery, 
  Apple, 
  Users, 
  CheckCircle,
  X
} from 'lucide-react'

interface Props {
  data: any
}

export function DailyLogSummary({ data }: Props) {
  if (!data) return null

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-600 bg-green-50'
    if (mood >= 6) return 'text-yellow-600 bg-yellow-50'
    if (mood >= 4) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getEnergyColor = (energy: number) => {
    if (energy >= 8) return 'text-green-600'
    if (energy >= 6) return 'text-yellow-600'
    if (energy >= 4) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Today's Summary</span>
          </CardTitle>
          <CardDescription>
            Here's what you logged today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood */}
          {data.moodRating && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span className="font-medium">Mood</span>
                </div>
                <Badge className={getMoodColor(data.moodRating)}>
                  {data.moodRating}/10
                </Badge>
              </div>
              <Progress value={data.moodRating * 10} className="h-2" />
              
              {data.emotionCheckboxes?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {data.emotionCheckboxes.map((emotion: string) => (
                    <Badge key={emotion} variant="outline" className="text-xs">
                      {emotion.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sleep */}
          {data.sleepQuality && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium">Sleep</span>
                </div>
                <Badge variant="outline">
                  {data.sleepQuality}/5
                </Badge>
              </div>
              {data.sleepDuration && (
                <p className="text-sm text-gray-600">Duration: {data.sleepDuration}</p>
              )}
            </div>
          )}

          {/* Energy */}
          {data.energyLevel && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Battery className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Energy</span>
                </div>
                <Badge className={getEnergyColor(data.energyLevel)}>
                  {data.energyLevel}/10
                </Badge>
              </div>
              <Progress value={data.energyLevel * 10} className="h-2" />
            </div>
          )}

          {/* Appetite */}
          {data.appetiteRating && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Apple className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Appetite</span>
                </div>
                <Badge variant="outline">
                  {data.appetiteRating}/5
                </Badge>
              </div>
              {data.mealRegularity?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {data.mealRegularity.map((meal: string) => (
                    <Badge key={meal} variant="outline" className="text-xs">
                      {meal}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Medication */}
          {data.medicationTaken !== null && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-1 rounded-full ${
                  data.medicationTaken ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {data.medicationTaken ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <span className="font-medium">Medication</span>
              </div>
              <Badge variant={data.medicationTaken ? 'default' : 'destructive'}>
                {data.medicationTaken ? 'Taken' : 'Not Taken'}
              </Badge>
            </div>
          )}

          {/* Self-care Activities */}
          {data.selfCareActivities?.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Self-care</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {data.selfCareActivities.map((activity: string) => (
                  <Badge key={activity} variant="outline" className="text-xs">
                    {activity.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Social Interactions */}
          {data.socialInteractions?.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Social</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {data.socialInteractions.map((interaction: string) => (
                  <Badge key={interaction} variant="outline" className="text-xs">
                    {interaction.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Positive Moments */}
          {data.positiveMoments && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-medium text-green-800 mb-1 text-sm">Today's Highlight ✨</h4>
              <p className="text-green-700 text-sm">{data.positiveMoments}</p>
            </div>
          )}

          {/* Gratitude */}
          {data.gratefulFor && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-800 mb-1 text-sm">Grateful for 🙏</h4>
              <p className="text-blue-700 text-sm">{data.gratefulFor}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
