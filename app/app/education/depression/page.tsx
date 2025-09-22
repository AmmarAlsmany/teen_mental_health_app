'use client'

import { AuthGuard } from '@/components/layout/auth-guard'
import { MobileHeader } from '@/components/layout/mobile-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Brain, 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Phone,
  MessageCircle,
  BookOpen
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DepressionEducationPage() {
  const router = useRouter()

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <MobileHeader />
        
        <div className="container mx-auto px-3 py-4 sm:py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="mb-4 p-0 h-auto" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center space-x-3 mb-2">
              <Brain className="h-8 w-8 text-purple-500" />
              <h1 className="text-3xl font-bold text-gray-900">
                Understanding Depression
              </h1>
            </div>
            <p className="text-gray-600">
              Learn about depression, its signs, and how to get help - information designed specifically for teens.
            </p>
          </div>

          <div className="space-y-6">
            {/* What is Depression */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span>What is Depression?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Depression is more than just feeling sad or going through a rough patch. It's a serious mental health condition that affects how you feel, think, and handle daily activities.
                </p>
                <p className="text-gray-700">
                  For teenagers, depression can feel especially overwhelming because you're already dealing with so many changes in your life, school pressure, and figuring out who you are.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <p className="text-blue-800 font-medium">Remember: Depression is a medical condition, not a character flaw or something you can just "snap out of."</p>
                </div>
              </CardContent>
            </Card>

            {/* Signs and Symptoms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span>Signs to Watch For</span>
                </CardTitle>
                <CardDescription>
                  These symptoms might indicate depression, especially if they last for more than two weeks:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-800">Emotional Signs:</h4>
                    <ul className="space-y-2">
                      {[
                        'Persistent sadness or emptiness',
                        'Loss of interest in activities you used to enjoy',
                        'Feeling hopeless or worthless',
                        'Irritability or mood swings',
                        'Feeling guilty for no clear reason'
                      ].map((symptom, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-800">Physical Signs:</h4>
                    <ul className="space-y-2">
                      {[
                        'Changes in sleep (too much or too little)',
                        'Fatigue or low energy',
                        'Changes in appetite or weight',
                        'Difficulty concentrating',
                        'Physical aches without clear cause'
                      ].map((symptom, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coping Strategies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-green-500" />
                  <span>Healthy Coping Strategies</span>
                </CardTitle>
                <CardDescription>
                  Things you can do to help manage depression symptoms:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: 'Stay Connected', desc: 'Talk to friends, family, or counselors', icon: Users },
                    { title: 'Regular Exercise', desc: 'Even 10-15 minutes of movement helps', icon: Heart },
                    { title: 'Healthy Sleep', desc: 'Aim for 8-9 hours per night', icon: Brain },
                    { title: 'Limit Social Media', desc: 'Take breaks from comparing yourself to others', icon: Phone },
                    { title: 'Practice Self-Care', desc: 'Do things that make you feel good', icon: CheckCircle },
                    { title: 'Express Yourself', desc: 'Through art, writing, or music', icon: BookOpen }
                  ].map((strategy, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <strategy.icon className="h-6 w-6 text-green-600 mb-2" />
                      <h4 className="font-semibold text-green-800 mb-1">{strategy.title}</h4>
                      <p className="text-sm text-green-700">{strategy.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* When to Seek Help */}
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>When to Seek Help Immediately</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-red-700 font-medium">
                    If you're having thoughts of hurting yourself or others, reach out for help immediately:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-red-300">
                      <h4 className="font-semibold text-red-800 mb-2">Crisis Resources (U.S.)</h4>
                      <div className="space-y-2 text-sm text-red-700">
                        <p><strong>Call 988</strong> - Suicide & Crisis Lifeline (24/7)</p>
                        <p><strong>Text HOME to 741741</strong> - Crisis Text Line</p>
                        <p><strong>Call 1-800-852-8336</strong> - Teen Line (6-9 PM PST)</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-red-300">
                      <h4 className="font-semibold text-red-800 mb-2">Talk to Someone</h4>
                      <div className="space-y-2 text-sm text-red-700">
                        <p>• School counselor or nurse</p>
                        <p>• Trusted teacher or coach</p>
                        <p>• Parent, guardian, or family member</p>
                        <p>• Family doctor or therapist</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Getting Professional Help */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>Getting Professional Help</span>
                </CardTitle>
                <CardDescription>
                  Professional help can make a huge difference in managing depression.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Many teenagers benefit from therapy, and sometimes medication can help too. There's no shame in getting professional help - it's actually a sign of strength and self-care.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Types of Help Available:</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• Individual therapy (talk therapy)</li>
                    <li>• Group therapy with other teens</li>
                    <li>• Family therapy</li>
                    <li>• Medication (if recommended by a doctor)</li>
                    <li>• Support groups</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                className="flex-1"
                onClick={() => router.push('/chat')}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Talk to AI Support
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push('/daily-log')}
              >
                <Heart className="h-4 w-4 mr-2" />
                Check In Today
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}