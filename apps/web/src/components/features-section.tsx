'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Globe, 
  Workflow, 
  BarChart3,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    key: 'aiGeneration',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Zap,
    key: 'instantResults',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Shield,
    key: 'premiumQuality',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Globe,
    key: 'globalAccess',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Workflow,
    key: 'smartIntegration',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    icon: BarChart3,
    key: 'analytics',
    gradient: 'from-rose-500 to-pink-500'
  }
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6 luxury-text-gradient">Features</h2>
          <p className="text-xl text-muted-foreground">
            Discover the power of AI-driven luxury content creation
          </p>
        </div>
      </div>
    </section>
  )
} 