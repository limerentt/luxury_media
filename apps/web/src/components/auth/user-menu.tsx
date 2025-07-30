'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Settings, 
  CreditCard, 
  LogOut, 
  ChevronDown, 
  Crown 
} from 'lucide-react'

const UserMenu: React.FC = () => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('userMenu')

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!session?.user) return null

  const menuItems = [
    {
      icon: User,
      label: t('profile'),
      href: '/profile',
    },
    {
      icon: CreditCard,
      label: t('billing'),
      href: '/billing',
    },
    {
      icon: Settings,
      label: t('settings'),
      href: '/settings',
    },
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-black">
          {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium">{session.user.name}</p>
          <p className="text-xs text-muted-foreground">
            {session.user.email}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-background border rounded-lg shadow-lg z-50"
          >
            <div className="p-3 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-sm font-bold text-black">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
                <Crown className="h-4 w-4 text-yellow-500" />
              </div>
            </div>
            
            <div className="py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            
            <div className="border-t py-2">
              <button
                onClick={() => {
                  setIsOpen(false)
                  signOut()
                }}
                className="flex items-center space-x-3 px-3 py-2 text-sm w-full text-left hover:bg-accent transition-colors text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('signOut')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserMenu 