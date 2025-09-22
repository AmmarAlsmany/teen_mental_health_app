
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AuthGuard } from '@/components/layout/auth-guard'
import { MobileHeader } from '@/components/layout/mobile-header'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ChatHistory } from '@/components/chat/chat-history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MessageCircle, History, Heart, AlertTriangle } from 'lucide-react'

export default function ChatPage() {
  const { data: session } = useSession() || {}
  const [chatSessions, setChatSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchChatSessions()
  }, [])

  const fetchChatSessions = async () => {
    try {
      const response = await fetch('/api/chat/sessions')
      if (response.ok) {
        const data = await response.json()
        setChatSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewSession = (session: any) => {
    setChatSessions([session, ...chatSessions])
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <MobileHeader />
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center">
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <MobileHeader />
        
        <div className="container mx-auto px-3 py-4 max-w-4xl">
          {/* Header - Hide on mobile to save space */}
          <div className="mb-4 hidden sm:block">
            <div className="flex items-center space-x-3 mb-2">
              <MessageCircle className="h-6 w-6 text-indigo-500" />
              <h1 className="text-2xl font-bold text-gray-900">
                AI Support Chat
              </h1>
            </div>
            <p className="text-gray-600 text-sm">
              Talk to our AI companion whenever you need someone to listen.
            </p>
          </div>

          {/* Mobile Disclaimer */}
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <Heart className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-800">
              <strong>Remember:</strong> I'm here to support you, but if you're in crisis, 
              please call 988 (U.S.) or your local emergency hotline.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="chat" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="chat" className="flex items-center space-x-1 text-xs">
                <MessageCircle className="h-3 w-3" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center space-x-1 text-xs">
                <History className="h-3 w-3" />
                <span>History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-4">
              {/* Mobile-first layout */}
              <div className="space-y-4">
                {/* Chat Interface - Full width on mobile */}
                <div className="w-full">
                  <ChatInterface onNewSession={handleNewSession} />
                </div>
                
                {/* Tips - Collapsible on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {/* Chat Tips */}
                  <Card className="bg-indigo-50 border-indigo-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-indigo-800 text-sm font-medium">💭 Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-indigo-700 space-y-1">
                      <p>• Be honest about your feelings</p>
                      <p>• Take breaks if needed</p>
                      <p>• This is a judgment-free space</p>
                    </CardContent>
                  </Card>

                  {/* What AI can help with */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">I can help with:</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-1">
                      <p>• Processing emotions</p>
                      <p>• Coping strategies</p>
                      <p>• School challenges</p>
                    </CardContent>
                  </Card>

                  {/* Crisis Resources */}
                  <Card className="bg-red-50 border-red-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-red-800 text-sm font-medium flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Crisis Help</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-red-700 space-y-1">
                      <p><strong>U.S.:</strong> Call 988</p>
                      <p><strong>Text:</strong> HOME to 741741</p>
                      <p><strong>Outside U.S.:</strong> Local emergency</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <ChatHistory sessions={chatSessions} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
