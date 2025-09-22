'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { Heart, User, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function MobileHeader() {
  const { data: session } = useSession() || {}
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/auth/signin')
    } catch (error) {
      console.error('Sign out error:', error)
      router.push('/auth/signin')
    }
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      ?.toUpperCase() || 'U'
  }

  const getPageTitle = () => {
    const titles: { [key: string]: string } = {
      '/dashboard': 'Home',
      '/daily-log': 'Daily Check-in',
      '/chat': 'AI Support',
      '/progress': 'Progress',
      '/weekly-report': 'Weekly Report',
      '/medications': 'Medications',
      '/profile': 'Profile'
    }
    return titles[pathname] || 'Mood Buddy'
  }

  // Don't show on auth pages
  const authPages = ['/auth/signin', '/auth/signup', '/landing', '/']
  if (authPages.includes(pathname) || !session) {
    return null
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo and page title */}
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-lg text-gray-900">
              {getPageTitle()}
            </div>
            {session?.user?.name && (
              <div className="text-xs text-gray-600">
                Hi, {session.user.name.split(' ')[0]}!
              </div>
            )}
          </div>
        </div>

        {/* User avatar with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-8 w-8 rounded-full p-0"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium">
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}