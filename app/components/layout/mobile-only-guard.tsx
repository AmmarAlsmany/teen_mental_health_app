'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, Monitor, AlertTriangle } from 'lucide-react'

export function MobileOnlyGuard({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const checkIfMobile = () => {
      // Check for mobile user agents
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = [
        'android', 'webos', 'iphone', 'ipad', 'ipod', 
        'blackberry', 'windows phone', 'mobile', 'opera mini'
      ]
      
      const hasMobileKeyword = mobileKeywords.some(keyword => 
        userAgent.includes(keyword)
      )
      
      // Check screen size (mobile-first approach)
      const isSmallScreen = window.innerWidth <= 768
      
      // Check for touch capability
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Consider it mobile if any of these conditions are true
      const isMobileDevice = hasMobileKeyword || (isSmallScreen && hasTouch) || isSmallScreen
      
      setIsMobile(isMobileDevice)
    }

    checkIfMobile()
    
    // Listen for resize events
    const handleResize = () => {
      checkIfMobile()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                <Smartphone className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                Mobile Only App
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="text-center">
                  <Smartphone className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-green-600 font-medium">Mobile ✓</p>
                </div>
                <div className="text-center opacity-50">
                  <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Desktop ✗</p>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-medium text-orange-800 mb-1">
                      This app is designed for mobile devices only
                    </h3>
                    <p className="text-sm text-orange-700">
                      Mood Buddy is specifically designed for teenagers aged 10-19 
                      and optimized for mobile use. Please access this app from 
                      your smartphone or tablet for the best experience.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-left space-y-2 text-sm text-gray-600">
                <p><strong>Why mobile-only?</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Teen-focused design optimized for phone use</li>
                  <li>Touch-friendly interface for daily check-ins</li>
                  <li>Better privacy on personal devices</li>
                  <li>Notifications for medication reminders</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Please visit this website on your mobile device to continue.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return <>{children}</>
}