'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import PricingCard from '@/components/payments/pricing-card'

// Types
interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: string
  features: string[]
  popular?: boolean
  priceId: string
}

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6 luxury-text-gradient">Pricing</h2>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your luxury brand
          </p>
        </div>
      </div>
    </section>
  )
} 