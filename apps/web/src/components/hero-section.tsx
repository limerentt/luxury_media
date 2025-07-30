'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Star, Zap } from 'lucide-react'

// Simple Button component
const Button: React.FC<{
  children: React.ReactNode
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  onClick?: () => void
}> = ({ children, variant = 'default', size = 'default', className = '', onClick }) => {
  const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  }
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8'
  }
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  const features = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      text: "AI-Powered Generation",
      gradient: "from-yellow-400 to-amber-500"
    },
    {
      icon: <Star className="w-5 h-5" />,
      text: "Premium Quality",
      gradient: "from-amber-400 to-orange-500"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      text: "Lightning Fast",
      gradient: "from-orange-400 to-red-500"
    }
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-amber-400/10 to-yellow-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-400/10 to-amber-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants} 
            transition={{ duration: 0.6 }}
            className="mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-foreground">
                Next-Generation Luxury Platform
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            variants={itemVariants}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="block">
              Elevate Your Brand with
            </span>
            <span className="block luxury-text-gradient">
              AI-Powered Luxury
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            transition={{ duration: 0.6 }}
            className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Create stunning, premium content that captures the essence of luxury. 
            Our AI-powered platform delivers sophisticated results for discerning brands.
          </motion.p>

          {/* Feature highlights */}
          <motion.div 
            variants={itemVariants}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className={`p-1 rounded-full bg-gradient-to-r ${feature.gradient}`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/get-started">
              <Button 
                size="lg"
                className="luxury-gradient text-white font-semibold px-8 py-4 text-lg hover:opacity-90 transition-all"
              >
                Start Creating
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg border-amber-500/20 hover:bg-amber-500/10"
              >
                Watch Demo
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            variants={itemVariants}
            transition={{ duration: 0.6 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold luxury-text-gradient mb-2">50+</div>
              <div className="text-muted-foreground">Luxury Brands</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold luxury-text-gradient mb-2">1M+</div>
              <div className="text-muted-foreground">Assets Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold luxury-text-gradient mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-amber-500/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gradient-to-b from-amber-500 to-transparent rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  )
} 