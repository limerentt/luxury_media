import React from 'react'
import Navigation from '@/components/navigation'
import { Sparkles, Zap, Shield, Brain, Palette, Globe, Camera, Settings } from 'lucide-react'

export default function FeaturesPage() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Generation",
      description: "Advanced neural networks trained specifically for luxury brand aesthetics, delivering premium quality content that matches your brand identity.",
      gradient: "from-purple-400 to-pink-400"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Luxury Design System",
      description: "Sophisticated design templates and styles curated for high-end brands, ensuring every piece of content maintains premium standards.",
      gradient: "from-amber-400 to-orange-400"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Processing",
      description: "Generate stunning visuals in seconds with our optimized AI pipeline, powered by cutting-edge cloud infrastructure.",
      gradient: "from-blue-400 to-cyan-400"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Security",
      description: "Bank-grade encryption and security protocols ensure your brand assets and data remain completely protected and confidential.",
      gradient: "from-green-400 to-emerald-400"
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Multi-Format Support",
      description: "Create content across all formats - from social media posts to billboard campaigns, all optimized for their specific platforms.",
      gradient: "from-red-400 to-pink-400"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global CDN Delivery",
      description: "Instant worldwide content delivery through our premium CDN network, ensuring fast access from anywhere in the world.",
      gradient: "from-indigo-400 to-purple-400"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Custom Brand Training",
      description: "Train our AI models specifically on your brand guidelines, ensuring consistent and on-brand content generation every time.",
      gradient: "from-teal-400 to-blue-400"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Premium Templates",
      description: "Access to exclusive luxury templates designed by world-class creative directors and used by Fortune 500 companies.",
      gradient: "from-yellow-400 to-amber-400"
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
              Premium Features
            </h1>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Discover the powerful capabilities that make our platform the choice of luxury brands worldwide. 
              From AI-powered generation to enterprise-grade security, every feature is designed with excellence in mind.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-card border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4 group-hover:luxury-text-gradient transition-all duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 luxury-text-gradient">Platform Performance</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform delivers exceptional results for luxury brands across the globe
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold luxury-text-gradient mb-2">99.9%</div>
              <p className="text-muted-foreground">Uptime Guarantee</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold luxury-text-gradient mb-2">&lt;2s</div>
              <p className="text-muted-foreground">Average Generation Time</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold luxury-text-gradient mb-2">150+</div>
              <p className="text-muted-foreground">Countries Served</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold luxury-text-gradient mb-2">10M+</div>
              <p className="text-muted-foreground">Assets Generated</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6">Ready to Experience Premium AI?</h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the world's leading luxury brands who trust our platform to create exceptional content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="luxury-gradient text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all">
                Start Free Trial
              </button>
              <button className="border border-amber-500/20 px-8 py-4 rounded-xl font-semibold hover:bg-amber-500/10 transition-all">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 