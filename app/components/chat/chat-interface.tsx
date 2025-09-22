
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface Props {
  onNewSession?: (session: any) => void
}

export function ChatInterface({ onNewSession }: Props) {
  const { data: session } = useSession() || {}
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      })
    }
  }

  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timer)
  }, [messages])

  useEffect(() => {
    // Force scroll on initial load
    setTimeout(scrollToBottom, 500)
  }, [])

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Hi ${session?.user?.name?.split(' ')[0] || 'there'}! 👋 I'm here to listen and support you. How are you feeling today? Feel free to share whatever's on your mind.`,
      role: 'assistant',
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [session])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: sessionId,
          messages: messages.concat(userMessage)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let assistantMessage = ''
      let buffer = ''

      // Create assistant message placeholder
      const assistantId = Date.now().toString() + '_assistant'
      const assistantMessageObj: Message = {
        id: assistantId,
        content: '',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessageObj])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') {
              break
            }
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantMessage += parsed.content
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantId 
                    ? { ...msg, content: assistantMessage }
                    : msg
                ))
              }
              
              if (parsed.sessionId && !sessionId) {
                setSessionId(parsed.sessionId)
                onNewSession?.(parsed.session)
              }
            } catch (error) {
              console.error('Error parsing streaming data:', error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to send message. Please try again.')
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or if you need immediate help, please call 988 for crisis support.",
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      ?.map(n => n[0])
      ?.join('')
      ?.toUpperCase() || 'U'
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-indigo-500" />
          <span className="font-semibold text-gray-900">AI Support</span>
          <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
            Online
          </Badge>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth" 
          style={{ 
            height: 'calc(100vh - 220px - env(safe-area-inset-bottom))',
            minHeight: '300px'
          }}
          id="messages-container"
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Bot className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Start a conversation...</p>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="h-7 w-7 flex-shrink-0 mt-1">
                  <AvatarFallback className={message.role === 'user' 
                    ? 'bg-blue-500 text-white text-xs' 
                    : 'bg-indigo-500 text-white'
                  }>
                    {message.role === 'user' 
                      ? getInitials(session?.user?.name || '') 
                      : <Bot className="h-3 w-3" />
                    }
                  </AvatarFallback>
                </Avatar>
                
                <div className={`rounded-2xl px-3 py-2 shadow-sm animate-in slide-in-from-bottom-2 duration-300 ${message.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}>
                  {message.content === '' && message.role === 'assistant' && isLoading ? (
                    <div className="flex items-center space-x-2 text-gray-500 py-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">Thinking...</span>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Input Area */}
        <div className="border-t bg-gray-50/50 p-3">
          <form onSubmit={sendMessage} className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                value={currentMessage}
                onChange={(e) => {
                  setCurrentMessage(e.target.value)
                  // Auto-resize textarea
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                }}
                placeholder="Share what's on your mind..."
                className="min-h-[44px] max-h-[120px] resize-none border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(e)
                  }
                }}
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!currentMessage.trim() || isLoading}
              className="bg-indigo-500 hover:bg-indigo-600 h-[44px] px-4 flex-shrink-0 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Tap send or press Enter • Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  )
}
