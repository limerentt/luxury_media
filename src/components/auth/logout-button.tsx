'use client'

import React from 'react'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'

// Simple Button component
const Button: React.FC<{
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  onClick?: () => void
  disabled?: boolean
}> = ({ children, variant = 'default', size = 'default', className = '', onClick, disabled }) => {
  const cn = (...classes: (string | undefined | null | boolean)[]) => {
    return classes.filter(Boolean).join(' ')
  }

  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
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
      disabled={disabled}
    >
      {children}
    </button>
  )
}

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  callbackUrl?: string
  showIcon?: boolean
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'default', 
  className,
  callbackUrl = '/',
  showIcon = true
}: LogoutButtonProps) {
  const t = useTranslations('navigation')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut({ callbackUrl })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {showIcon && (
        <motion.div
          animate={isLoading ? { rotate: 360 } : {}}
          transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
          className="mr-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
        </motion.div>
      )}
      {isLoading ? 'Signing out...' : t('signOut')}
    </Button>
  )
}

export default LogoutButton 