import React from 'react'
import Navigation from '@/components/navigation'
import HeroSection from '@/components/hero-section'
import PricingSection from '@/components/pricing-section'

export default function HomePage() {
  return (
    <main className="relative">
      <Navigation />
      <HeroSection />
      
      {/* Features section placeholder */}
      <section id="features" className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Features Section</h2>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </section>
      
      {/* Pricing section */}
      <PricingSection />
      
      {/* About section placeholder */}
      <section id="about" className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">About Section</h2>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </section>
      
      {/* Contact section placeholder */}
      <section id="contact" className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Contact Section</h2>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </section>
    </main>
  )
} 