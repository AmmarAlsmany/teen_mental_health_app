'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DepressionLearningCard() {
  const router = useRouter()

  return (
    <Card className="card-press cursor-pointer hover:shadow-lg transition-all duration-200 min-h-[140px] bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1 text-purple-800">Learn About Depression</h3>
            <p className="text-xs text-purple-600">
              Understanding symptoms, coping strategies, and when to seek help
            </p>
          </div>
          <BookOpen className="h-6 w-6 text-purple-500 flex-shrink-0 ml-2" />
        </div>
        <Button 
          className="w-full mt-3 h-9 text-sm bg-purple-500 hover:bg-purple-600 text-white" 
          onClick={() => router.push('/education/depression')}
        >
          Learn More
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  )
}