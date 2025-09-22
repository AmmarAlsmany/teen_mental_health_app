
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, sessionId, messages } = await request.json()
    const userId = session.user.id

    let chatSession: any = null
    
    // Create or get session
    if (sessionId) {
      chatSession = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId }
      })
    }
    
    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          userId,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        }
      })
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        content: message,
        role: 'user'
      }
    })

    // Prepare messages for LLM
    const systemPrompt = `You are a compassionate AI mental health support companion designed specifically for teenagers aged 10-19. Your role is to:

1. Provide emotional support and active listening
2. Help teens process their feelings and thoughts
3. Offer healthy coping strategies and perspective
4. Validate their experiences without judgment
5. Guide them toward appropriate resources when needed

Key guidelines:
- Use teen-friendly, empathetic language
- Be supportive but not overly clinical
- Acknowledge their feelings as valid
- Ask follow-up questions to encourage reflection
- Suggest healthy coping strategies when appropriate
- If they mention self-harm, suicidal thoughts, or crisis situations, gently encourage them to reach out to crisis resources. If you are in the United States, call 988 (Suicide & Crisis Lifeline), text HOME to 741741 (Crisis Text Line), or call 1-800-852-8336 (Teen Line). If you are outside the U.S., please call your local emergency hotline.
- Remember this is not therapy or medical advice - you're a supportive companion
- Keep responses concise but meaningful (2-4 sentences typically)
- Show genuine care and interest in their wellbeing

The user's name is ${session.user.name?.split(' ')[0] || 'there'}. Be warm, understanding, and supportive.`

    const llmMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    // Call LLM API with streaming
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: llmMessages,
        stream: true,
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error('LLM API request failed')
    }

    // Set up streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.error(new Error('No response stream'))
          return
        }

        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let assistantMessage = ''
        let buffer = ''

        try {
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
                  // Save assistant message to database
                  if (assistantMessage.trim()) {
                    await prisma.chatMessage.create({
                      data: {
                        sessionId: chatSession.id,
                        content: assistantMessage.trim(),
                        role: 'assistant'
                      }
                    })
                  }
                  
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  controller.close()
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ''
                  
                  if (content) {
                    assistantMessage += content
                    
                    // Stream the content along with session info
                    const streamData = JSON.stringify({
                      content,
                      sessionId: chatSession.id,
                      session: chatSession
                    })
                    
                    controller.enqueue(encoder.encode(`data: ${streamData}\n\n`))
                  }
                } catch (e) {
                  console.error('Error parsing streaming data:', e)
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
