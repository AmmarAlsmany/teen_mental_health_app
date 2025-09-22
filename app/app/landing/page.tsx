'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Shield, Brain, MessageCircle, BarChart3, Users } from 'lucide-react'
import Image from 'next/image'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="mx-auto mb-4 sm:mb-6 w-fit">
            <Image 
              src="/icon-512x512.png" 
              alt="Mood Buddy App Icon" 
              width={64} 
              height={64} 
              className="h-16 w-16 sm:h-20 sm:w-20"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Mood Buddy
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 max-w-2xl mx-auto px-2">
            A safe space designed specifically for teenagers to track mental health and connect with supportive resources.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center px-4 sm:px-0">
            <Button 
              onClick={() => router.push('/auth/signup')}
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-base sm:text-lg py-3 sm:py-4 px-6 sm:px-8"
            >
              Get Started
            </Button>
            <Button 
              onClick={() => router.push('/auth/signin')}
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg py-3 sm:py-4 px-6 sm:px-8"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 px-2 sm:px-0">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-lg">Daily Check-ins</CardTitle>
              <CardDescription>
                Track your mood, sleep, energy, and more with teen-friendly questions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-indigo-500 mb-2" />
              <CardTitle className="text-lg">Progress Tracking</CardTitle>
              <CardDescription>
                Visualize your mental health journey with insights and trends over time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle className="text-lg">AI Support Chat</CardTitle>
              <CardDescription>
                Talk to our AI companion whenever you need someone to listen
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle className="text-lg">Crisis Detection</CardTitle>
              <CardDescription>
                Automatic safety protocols and crisis resources when you need them
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-orange-500 mb-2" />
              <CardTitle className="text-lg">Teen-Focused</CardTitle>
              <CardDescription>
                Designed specifically for teenagers aged 10-19 with age-appropriate content
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Heart className="h-8 w-8 text-pink-500 mb-2" />
              <CardTitle className="text-lg">Privacy & Safety</CardTitle>
              <CardDescription>
                Your data is secure and private, with optional emergency contact features
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Crisis Resources */}
        <div className="mt-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-red-800 mb-2">Need Help Right Now?</h3>
            <p className="text-red-700 mb-4">
              If you're in crisis or having thoughts of self-harm, please reach out immediately:
            </p>
            <div className="space-y-2 text-sm text-red-700">
              <p><strong>In the United States:</strong></p>
              <p><strong>Call 988</strong> - Suicide & Crisis Lifeline (24/7)</p>
              <p><strong>Text HOME to 741741</strong> - Crisis Text Line</p>
              <p><strong>Call 1-800-852-8336</strong> - Teen Line (6-9 PM PST)</p>
              <p className="mt-3"><strong>Outside the U.S.:</strong> Please call your local emergency hotline or emergency services</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}