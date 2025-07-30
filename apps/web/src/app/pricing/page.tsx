import React from 'react'
import Navigation from '@/components/navigation'
import { Check, Star, Crown, Zap } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "99",
      period: "month",
      description: "Perfect for small luxury boutiques and emerging brands",
      icon: <Zap className="w-6 h-6" />,
      gradient: "from-blue-400 to-cyan-400",
      popular: false,
      features: [
        "50 AI-generated assets per month",
        "Basic luxury templates",
        "Standard resolution (2K)",
        "Email support",
        "Brand color customization",
        "Social media formats",
        "7-day revision period"
      ]
    },
    {
      name: "Professional",
      price: "299",
      period: "month", 
      description: "Ideal for established luxury brands and agencies",
      icon: <Star className="w-6 h-6" />,
      gradient: "from-amber-400 to-orange-400",
      popular: true,
      features: [
        "200 AI-generated assets per month",
        "Premium luxury templates",
        "Ultra HD resolution (4K)",
        "Priority support",
        "Custom brand training",
        "All formats + print ready",
        "14-day revision period",
        "Advanced analytics",
        "Team collaboration tools",
        "API access"
      ]
    },
    {
      name: "Enterprise",
      price: "999",
      period: "month",
      description: "Comprehensive solution for luxury conglomerates",
      icon: <Crown className="w-6 h-6" />,
      gradient: "from-purple-400 to-pink-400",
      popular: false,
      features: [
        "Unlimited AI-generated assets",
        "Exclusive luxury templates",
        "Ultra HD + Vector formats",
        "24/7 dedicated support",
        "Full custom brand training",
        "White-label solution",
        "Unlimited revisions",
        "Advanced analytics + reporting",
        "Multi-team management",
        "Full API access",
        "Custom integrations",
        "Dedicated account manager"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 luxury-text-gradient">
              Luxury Pricing
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Choose the perfect plan for your luxury brand. All plans include our premium AI generation, 
              luxury templates, and world-class support.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-full mb-12">
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                🎉 30% off your first 3 months with code LUXURY30
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-card border rounded-2xl p-8 ${
                  plan.popular 
                    ? 'border-amber-500 shadow-xl scale-105 ring-2 ring-amber-500/20' 
                    : 'hover:shadow-lg hover:-translate-y-1'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} p-4 mx-auto mb-4`}>
                    <div className="text-white">
                      {plan.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold luxury-text-gradient">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  className={`w-full py-4 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'luxury-gradient text-white hover:opacity-90'
                      : 'border border-border hover:bg-muted'
                  }`}
                >
                  {plan.popular ? 'Start Free Trial' : 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 luxury-text-gradient">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about our luxury pricing plans
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card border rounded-lg p-6">
              <h4 className="font-semibold mb-3">Can I change plans anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h4 className="font-semibold mb-3">What payment methods do you accept?</h4>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, wire transfers, and various local payment methods through Stripe.
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h4 className="font-semibold mb-3">Is there a free trial?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! All plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h4 className="font-semibold mb-3">Do you offer custom enterprise plans?</h4>
              <p className="text-sm text-muted-foreground">
                Absolutely! For large organizations with specific needs, we offer fully customized enterprise solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6">Ready to Elevate Your Brand?</h3>
            <p className="text-xl text-muted-foreground mb-8">
              Join over 500+ luxury brands who trust our platform for their content creation needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="luxury-gradient text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all">
                Start Free Trial
              </button>
              <button className="border border-amber-500/20 px-8 py-4 rounded-xl font-semibold hover:bg-amber-500/10 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 