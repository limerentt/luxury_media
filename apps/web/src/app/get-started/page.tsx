import React from 'react'
import Navigation from '@/components/navigation'
import { Play, Check, ArrowRight, Users, Palette, Sparkles, Zap, Target, Settings } from 'lucide-react'

export default function GetStartedPage() {
  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Sign up for your luxury account in under 60 seconds. No credit card required for your 14-day free trial.",
      icon: <Users className="w-8 h-8" />,
      gradient: "from-blue-400 to-cyan-400",
      features: ["14-day free trial", "No setup fees", "Instant access"]
    },
    {
      number: "02", 
      title: "Define Your Brand",
      description: "Upload your brand guidelines, colors, and style preferences. Our AI will learn your unique aesthetic.",
      icon: <Palette className="w-8 h-8" />,
      gradient: "from-purple-400 to-indigo-400",
      features: ["Brand analysis", "Color extraction", "Style learning"]
    },
    {
      number: "03",
      title: "Generate Content",
      description: "Start creating stunning luxury content with our AI-powered tools. From social posts to campaign materials.",
      icon: <Sparkles className="w-8 h-8" />,
      gradient: "from-amber-400 to-orange-400",
      features: ["AI generation", "Multiple formats", "High quality"]
    },
    {
      number: "04",
      title: "Scale & Optimize",
      description: "Use advanced features, analytics, and team collaboration tools to scale your content creation.",
      icon: <Zap className="w-8 h-8" />,
      gradient: "from-green-400 to-emerald-400",
      features: ["Team features", "Analytics", "Optimization"]
    }
  ]

  const quickActions = [
    {
      title: "Start Free Trial",
      description: "Begin your 14-day free trial instantly",
      icon: <Play className="w-6 h-6" />,
      buttonText: "Start Now",
      buttonStyle: "luxury-gradient text-white",
      popular: true
    },
    {
      title: "Schedule Demo",
      description: "See the platform in action with our experts",
      icon: <Users className="w-6 h-6" />,
      buttonText: "Book Demo",
      buttonStyle: "border border-amber-500/20 hover:bg-amber-500/10",
      popular: false
    },
    {
      title: "Contact Sales",
      description: "Discuss enterprise solutions and pricing",
      icon: <Target className="w-6 h-6" />,
      buttonText: "Get Quote",
      buttonStyle: "border border-border hover:bg-muted",
      popular: false
    }
  ]

  const faqs = [
    {
      question: "How quickly can I start creating content?",
      answer: "You can start generating luxury content within 5 minutes of signing up. Our onboarding process is designed to get you creating immediately."
    },
    {
      question: "Do I need design experience to use the platform?",
      answer: "Not at all! Our AI handles the complex design work. Simply describe what you want, and our platform creates professional luxury content automatically."
    },
    {
      question: "Can I customize the AI to match my brand exactly?",
      answer: "Yes! Our brand training feature learns your specific style, colors, fonts, and aesthetic preferences to ensure every piece of content matches your brand perfectly."
    },
    {
      question: "What file formats and resolutions are supported?",
      answer: "We support all major formats including PNG, JPG, SVG, PDF, and more. Content is generated in ultra-high resolution (up to 8K) suitable for any use case."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-full mb-8">
              <span className="text-green-600 dark:text-green-400 font-medium">
                🚀 Get started in under 5 minutes
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 luxury-text-gradient">
              Start Creating Luxury Content Today
            </h1>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Follow our simple 4-step process to transform your brand's content creation. 
              Join 500+ luxury brands already creating stunning AI-powered content.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {quickActions.map((action, index) => (
              <div 
                key={index}
                className={`relative bg-card border rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  action.popular ? 'border-amber-500 ring-2 ring-amber-500/20' : ''
                }`}
              >
                {action.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Recommended
                    </div>
                  </div>
                )}
                
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 p-4 mx-auto mb-4">
                  <div className="text-white">
                    {action.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                <p className="text-muted-foreground mb-6">{action.description}</p>
                
                <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${action.buttonStyle}`}>
                  {action.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Process */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 luxury-text-gradient">How to Get Started</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our streamlined process gets you from signup to creating luxury content in minutes
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 ${
                  index % 2 === 1 ? 'lg:grid-flow-row-dense' : ''
                }`}>
                  
                  {/* Content */}
                  <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-6xl font-bold text-muted-foreground/20">
                        {step.number}
                      </div>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.gradient} p-4`}>
                        <div className="text-white">
                          {step.icon}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-bold mb-4">{step.title}</h3>
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      {step.description}
                    </p>
                    
                    <div className="space-y-3">
                      {step.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-500" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Visual */}
                  <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                    <div className={`relative bg-gradient-to-br ${step.gradient}/10 rounded-2xl p-12 border border-border/50`}>
                      <div className="text-center">
                        <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${step.gradient} p-8 mx-auto mb-6`}>
                          <div className="text-white text-4xl">
                            {step.icon}
                          </div>
                        </div>
                        <div className="text-2xl font-bold mb-2">Step {step.number}</div>
                        <div className="text-muted-foreground">{step.title}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-amber-400 to-orange-400 opacity-30"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 luxury-text-gradient">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know to get started with confidence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card border rounded-2xl p-6">
                <h4 className="text-lg font-semibold mb-3">{faq.question}</h4>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl font-bold mb-6">Ready to Transform Your Brand?</h3>
            <p className="text-xl text-muted-foreground mb-8">
              Join hundreds of luxury brands creating exceptional content with AI. 
              Start your free trial today and see the difference in 5 minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button className="luxury-gradient text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Start Free Trial
              </button>
              <button className="border border-amber-500/20 px-8 py-4 rounded-xl font-semibold hover:bg-amber-500/10 transition-all">
                Schedule Demo
              </button>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                  ✨ 14-day free trial • No credit card required • Cancel anytime
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 