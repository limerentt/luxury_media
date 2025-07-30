'use client'

import React, { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import Link from 'next/link'

// Simple Avatar component
const Avatar: React.FC<{
  src?: string | null
  alt?: string
  className?: string
  fallback?: React.ReactNode
}> = ({ src, alt, className = '', fallback }) => {
  const cn = (...classes: (string | undefined | null | boolean)[]) => {
    return classes.filter(Boolean).join(' ')
  }

  const [imageError, setImageError] = useState(false)

  if (!src || imageError) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-muted text-muted-foreground rounded-full',
        className
      )}>
        {fallback || <User className="w-4 h-4" />}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('rounded-full object-cover', className)}
      onError={() => setImageError(true)}
    />
  )
}

export function UserMenu() {
  const { data: session, status } = useSession()
  const t = useTranslations('navigation')
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
    )
  }

  if (!session?.user) {
    return null
  }

  const user = session.user

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-full p-1 hover:bg-accent transition-colors"
      >
        <Avatar
          src={user.image}
          alt={user.name || 'User'}
          className="w-8 h-8"
          fallback={
            <span className="text-xs font-medium">
              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          }
        />
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-72 bg-background border rounded-lg shadow-lg z-50"
            >
              {/* User Info */}
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-12 h-12"
                    fallback={
                      <span className="text-lg font-medium">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  href={`/${locale}/dashboard`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors"
                >
                  <User className="w-4 h-4 mr-3" />
                  {t('dashboard')}
                </Link>
                
                <Link
                  href={`/${locale}/settings`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Link>
                
                <hr className="my-2" />
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-3 text-sm text-destructive hover:bg-accent transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  {t('signOut')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserMenu 