
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  MessageCircle, 
  Calendar, 
  Bot, 
  User, 
  ChevronDown,
  ChevronRight,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  sessions: any[]
}

export function ChatHistory({ sessions }: Props) {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())

  if (!sessions || sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-600">
            Start your first chat to begin building a history of your conversations.
          </p>
        </CardContent>
      </Card>
    )
  }

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions)
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId)
    } else {
      newExpanded.add(sessionId)
    }
    setExpandedSessions(newExpanded)
  }

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Conversation deleted')
        // In a real app, you'd refresh the sessions list here
      } else {
        toast.error('Failed to delete conversation')
      }
    } catch (error) {
      toast.error('Failed to delete conversation')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Conversation History</span>
          </CardTitle>
          <CardDescription>
            Your previous chats with the AI support companion
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {sessions.map((session) => {
          const isExpanded = expandedSessions.has(session.id)
          const messageCount = session.messages?.length || 0
          const lastMessage = session.messages?.[session.messages.length - 1]
          
          return (
            <Card key={session.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSession(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <CardTitle className="text-base">
                        {session.title || `Chat from ${new Date(session.createdAt).toLocaleDateString()}`}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(session.createdAt).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {messageCount} messages
                          </Badge>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSession(session.id)
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="border-t">
                    <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                      {session.messages?.map((message: any) => (
                        <div key={message.id} className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}>
                          <div className={`flex items-start space-x-2 max-w-[80%] ${
                            message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                          }`}>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className={`text-xs ${
                                message.role === 'user' 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-indigo-500 text-white'
                              }`}>
                                {message.role === 'user' ? (
                                  <User className="h-3 w-3" />
                                ) : (
                                  <Bot className="h-3 w-3" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className={`rounded-lg px-3 py-2 text-sm ${
                              message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="whitespace-pre-wrap">
                                {message.content.length > 200 
                                  ? `${message.content.substring(0, 200)}...`
                                  : message.content
                                }
                              </p>
                              <div className={`text-xs mt-1 opacity-70 ${
                                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {messageCount > 5 && (
                      <div className="px-4 pb-4">
                        <p className="text-xs text-gray-500 text-center">
                          Showing recent messages from this conversation
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
