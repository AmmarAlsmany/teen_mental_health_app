'use client'

import { AuthGuard } from '@/components/layout/auth-guard'
import { MobileHeader } from '@/components/layout/mobile-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Heart, 
  Users, 
  Code, 
  Lightbulb,
  Mail,
  Github,
  Linkedin
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AboutPage() {
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
              Back
            </Button>
            
            <div className="flex items-center space-x-3 mb-2">
              <Heart className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900">
                About Mood Buddy
              </h1>
            </div>
            <p className="text-gray-600">
              Meet the team behind your mental health companion
            </p>
          </div>

          <div className="space-y-6">
            {/* Mission Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span>Our Mission</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Mood Buddy was created with a simple but powerful mission: to provide teenagers with a safe, 
                  supportive, and accessible space to track their mental health and find the help they need.
                </p>
                <p className="text-gray-700">
                  We believe that every teen deserves access to mental health resources and tools that 
                  understand their unique challenges and experiences.
                </p>
              </CardContent>
            </Card>

            {/* Development Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>Development Team</span>
                </CardTitle>
                <CardDescription>
                  The passionate individuals who brought Mood Buddy to life
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Team Member 1 */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">SS</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Sayda Sirelkhatim</h3>
                        <p className="text-sm text-gray-600">Doctor & Lead Developer</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Doctor who led the development architecture and implemented core features of Mood Buddy, ensuring medical accuracy in mental health tracking.
                    </p>
                  </div>

                  {/* Team Member 2 */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">AO</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Abdullah Obadi</h3>
                        <p className="text-sm text-gray-600">Doctor & UI/UX Designer</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Doctor who designed the user interface and experience, creating teen-friendly and accessible mental health interfaces.
                    </p>
                  </div>

                  {/* Team Member 3 */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">AM</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Aseel Magzoub</h3>
                        <p className="text-sm text-gray-600">Doctor & Project Member</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Doctor who spearheaded the Mood Buddy project, coordinating the team and ensuring the app meets clinical standards for teen mental health support.
                    </p>
                  </div>

                  {/* Team Member 4 */}
                  <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">DE</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Dalia Elbuluk</h3>
                        <p className="text-sm text-gray-600">Doctor & UI/UX Designer</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Doctor who focused on visual design and user experience, ensuring the app is both medically sound and visually appealing for teenagers.
                    </p>
                  </div>

                  {/* Team Member 5 */}
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">LA</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Ladin Ali</h3>
                        <p className="text-sm text-gray-600">Doctor & Research Specialist</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Doctor who conducted mental health research and compiled educational resources, ensuring evidence-based content for teen depression awareness.
                    </p>
                  </div>

                  {/* Team Member 6 */}
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">HA</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Hajer Ali</h3>
                        <p className="text-sm text-gray-600">Doctor & Backend Developer</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Doctor who developed the backend systems and database architecture, ensuring secure and reliable data handling for teen users.
                    </p>
                  </div>

                  {/* Team Member 7 */}
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">LM</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Linah Mohamed Elhassan</h3>
                        <p className="text-sm text-gray-600">Doctor & Content Specialist</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Doctor who created educational content and crisis resources, developing teen-appropriate mental health information and safety protocols.
                    </p>
                  </div>

                  {/* Team Member 8 */}
                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">AO</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Alaa Osama</h3>
                        <p className="text-sm text-gray-600">Doctor & Quality Assurance</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Doctor who handled testing and quality assurance, ensuring the app meets medical standards and provides reliable mental health tracking.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* App Version & Credits */}
            <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Image 
                    src="/icon-192x192.png" 
                    alt="Mood Buddy" 
                    width={48} 
                    height={48} 
                    className="rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-xl">Mood Buddy</h3>
                    <p className="text-blue-100 text-sm">Version 1.0.0</p>
                  </div>
                </div>
                <p className="text-blue-100 text-sm">
                  Made with ❤️ for teenagers everywhere
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}