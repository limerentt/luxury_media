'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Play, Sparkles, Zap, Shield } from 'lucide-react'

// Simple Button component (reused from navigation)
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
  
  const cn = (...classes: (string | undefined | null | boolean)[]) => {
    return classes.filter(Boolean).join(' ')
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

const HeroSection: React.FC = () => {
  const t = useTranslations('hero')

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-yellow-500/5" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-yellow-500/10"
            style={{
              width: Math.random() * 400 + 100,
              height: Math.random() * 400 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 mb-8 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-full"
          >
            <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="text-yellow-600 dark:text-yellow-400">
              AI-Powered Content Creation
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            {t('title')}
            <br />
            <span className="luxury-text-gradient">
              {t('subtitle')}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {t('description')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button 
              size="lg" 
              className="luxury-gradient text-black font-semibold px-8 py-4 text-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              {t('cta')}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-4 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              {t('watchDemo')}
            </Button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Generate media in seconds with our optimized AI pipeline
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="font-semibold mb-2">Premium Quality</h3>
              <p className="text-sm text-muted-foreground">
                Luxury-grade content that meets the highest standards
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Advanced algorithms trained specifically for luxury brands
              </p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center"
          >
            <div>
              <div className="text-2xl sm:text-3xl font-bold luxury-text-gradient mb-1">
                10K+
              </div>
              <div className="text-sm text-muted-foreground">Assets Created</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold luxury-text-gradient mb-1">
                500+
              </div>
              <div className="text-sm text-muted-foreground">Happy Clients</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold luxury-text-gradient mb-1">
                99.9%
              </div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold luxury-text-gradient mb-1">
                24/7
              </div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default HeroSection 