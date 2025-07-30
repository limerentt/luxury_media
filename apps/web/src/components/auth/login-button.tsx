'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { LogIn, Loader2 } from 'lucide-react'

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
  disabled?: boolean
}> = ({ children, variant = 'default', size = 'default', className = '', onClick, disabled }) => {
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
      disabled={disabled}
    >
      {children}
    </button>
  )
}

interface LoginButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

const LoginButton: React.FC<LoginButtonProps> = ({ 
  variant = 'default', 
  size = 'default',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('auth')

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('Error signing in:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogIn className="mr-2 h-4 w-4" />
      )}
      {isLoading ? t('signingIn') : t('signIn')}
    </Button>
  )
}

export default LoginButton 