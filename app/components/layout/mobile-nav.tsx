'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Home, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  User,
  Calendar,
  BookOpen,
  FileText,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { 
    path: '/dashboard', 
    icon: Home, 
    label: 'Home',
    color: 'text-blue-600'
  },
  { 
    path: '/daily-log', 
    icon: Heart, 
    label: 'Check-in',
    color: 'text-pink-600'
  },
  { 
    path: '/chat', 
    icon: MessageCircle, 
    label: 'Chat',
    color: 'text-purple-600'
  },
  { 
    path: '/progress', 
    icon: TrendingUp, 
    label: 'Progress',
    color: 'text-green-600'
  },
  { 
    path: '/weekly-report', 
    icon: FileText, 
    label: 'Report',
    color: 'text-orange-600'
  },
  { 
    path: '/profile', 
    icon: User, 
    label: 'Profile',
    color: 'text-gray-600'
  },
  { 
    path: '/about', 
    icon: Info, 
    label: 'About',
    color: 'text-indigo-600'
  }
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  // Don't show navigation on auth pages or when not authenticated
  const authPages = ['/auth/signin', '/auth/signup', '/landing', '/']
  const isAuthPage = authPages.includes(pathname)
  
  if (status === 'loading' || !session || isAuthPage) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-bottom md:hidden">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full px-2 transition-all",
                "active:scale-95 touch-manipulation",
                isActive && "bg-gradient-to-t from-blue-50/50 to-transparent"
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-all",
                    isActive ? item.color : "text-gray-400",
                    isActive && "transform -translate-y-0.5"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full" />
                )}
              </div>
              <span 
                className={cn(
                  "text-[10px] mt-1 font-medium",
                  isActive ? "text-gray-900" : "text-gray-500"
                )}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}