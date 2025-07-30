'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Globe, Sparkles } from 'lucide-react'
import LoginButton from '@/components/auth/login-button'
import UserMenu from '@/components/auth/user-menu'

// Simple utility function
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ')
}

// Simple Button component
const Button: React.FC<{
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  onClick?: () => void
}> = ({ children, variant = 'default', size = 'default', className = '', onClick }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  }
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3 text-sm',
    lg: 'h-11 rounded-md px-8'
  }
  
  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { data: session, status } = useSession()
  const t = useTranslations('navigation')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const switchLanguage = (newLocale: string) => {
    const path = pathname.split('/').slice(2).join('/')
    router.push(`/${newLocale}/${path}`)
  }

  const navItems = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}#features`, label: t('features') },
    { href: `/${locale}#pricing`, label: t('pricing') },
    { href: `/${locale}#about`, label: t('about') },
    { href: `/${locale}#contact`, label: t('contact') },
  ]

  // Add dashboard to nav items if user is authenticated
  const authenticatedNavItems = session?.user 
    ? [
        ...navItems,
        { href: `/${locale}/dashboard`, label: t('dashboard') }
      ]
    : navItems

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-yellow-500" />
              <motion.div
                className="absolute inset-0 rounded-full bg-yellow-500/20"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="font-bold text-xl luxury-text-gradient">
              Luxury Account
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {authenticatedNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-yellow-500 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="relative group">
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span className="uppercase text-xs">{locale}</span>
              </Button>
              <div className="absolute right-0 top-full mt-2 w-24 bg-background border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={() => switchLanguage('en')}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-t-md"
                >
                  EN
                </button>
                <button
                  onClick={() => switchLanguage('ru')}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-b-md"
                >
                  RU
                </button>
              </div>
            </div>

            {/* Authentication */}
            {status === 'loading' ? (
              <div className="w-32 h-9 bg-muted animate-pulse rounded" />
            ) : session?.user ? (
              <div className="flex items-center space-x-3">
                <UserMenu />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <LoginButton variant="outline" size="sm" />
                <Button size="sm" className="luxury-gradient text-black font-semibold">
                  {t('getStarted')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background/95 backdrop-blur-md"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {authenticatedNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium hover:text-yellow-500 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">Language:</span>
                  <button
                    onClick={() => switchLanguage('en')}
                    className={cn(
                      'px-2 py-1 text-xs rounded',
                      locale === 'en' ? 'bg-yellow-500 text-black' : 'bg-accent'
                    )}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => switchLanguage('ru')}
                    className={cn(
                      'px-2 py-1 text-xs rounded',
                      locale === 'ru' ? 'bg-yellow-500 text-black' : 'bg-accent'
                    )}
                  >
                    RU
                  </button>
                </div>
                
                <div className="space-y-2">
                  {status === 'loading' ? (
                    <div className="w-full h-10 bg-muted animate-pulse rounded" />
                  ) : session?.user ? (
                    <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-black">
                          {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{session.user.name}</p>
                          <p className="text-xs text-muted-foreground">{session.user.email}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <LoginButton variant="outline" className="w-full" />
                      <Button className="w-full luxury-gradient text-black font-semibold">
                        {t('getStarted')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navigation 