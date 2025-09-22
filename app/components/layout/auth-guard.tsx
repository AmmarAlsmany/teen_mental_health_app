
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Age verification check
    if (session.user?.age && (session.user.age < 10 || session.user.age > 19)) {
      router.push('/age-restriction')
      return
    }
  }, [session, status, router, mounted])

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center px-4">
          <Heart className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading your space...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center px-4">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  if (session.user?.age && (session.user.age < 10 || session.user.age > 19)) {
    return null
  }

  return <>{children}</>
}
