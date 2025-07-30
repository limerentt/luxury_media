import React from 'react'
import Navigation from '@/components/navigation'
import HeroSection from '@/components/hero-section'
import FeaturesSection from '@/components/features-section'
import PricingSection from '@/components/pricing-section'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
    </div>
  )
} 