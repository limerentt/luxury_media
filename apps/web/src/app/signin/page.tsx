'use client'

import React, { useState } from 'react'
import Navigation from '@/components/navigation'
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Sparkles } from 'lucide-react'

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const benefits = [
    "Access to premium AI-powered luxury templates",
    "Generate unlimited high-resolution content",
    "Custom brand training and style guides",
    "Priority customer support and onboarding",
    "Advanced analytics and performance insights",
    "White-label solutions for agencies"
  ]

  const socialProviders = [
    { name: "Google", icon: "🔗", color: "border-red-200 hover:bg-red-50" },
    { name: "Microsoft", icon: "🏢", color: "border-blue-200 hover:bg-blue-50" },
    { name: "Apple", icon: "🍎", color: "border-gray-200 hover:bg-gray-50" }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            
            {/* Left Side - Marketing Content */}
            <div className="order-2 lg:order-1">
              <div className="max-w-lg mx-auto lg:mx-0">
                <div className="inline-flex items-center px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-full mb-8">
                  <Sparkles className="w-4 h-4 text-amber-500 mr-2" />
                  <span className="text-amber-600 dark:text-amber-400 font-medium text-sm">
                    Join 500+ Luxury Brands
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-6 luxury-text-gradient">
                  Elevate Your Brand with Premium AI
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Create stunning, luxury-grade content that captures the essence of your brand. 
                  Join the platform trusted by the world's most prestigious brands.
                </p>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">Trusted by luxury brands worldwide:</p>
                  <div className="flex items-center gap-6 opacity-60">
                    <div className="text-lg font-bold">Hermès</div>
                    <div className="text-lg font-bold">Cartier</div>
                    <div className="text-lg font-bold">Tiffany</div>
                    <div className="text-lg font-bold">Bulgari</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Sign In Form */}
            <div className="order-1 lg:order-2">
              <div className="max-w-md mx-auto">
                <div className="bg-card border rounded-2xl p-8 shadow-lg">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">
                      {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-muted-foreground">
                      {isSignUp 
                        ? 'Start your luxury content creation journey' 
                        : 'Sign in to your luxury account'
                      }
                    </p>
                  </div>
                  
                  {/* Social Sign In */}
                  <div className="space-y-3 mb-8">
                    {socialProviders.map((provider, index) => (
                      <button 
                        key={index}
                        className={`w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-lg transition-all ${provider.color}`}
                      >
                        <span className="text-xl">{provider.icon}</span>
                        <span className="font-medium">Continue with {provider.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-card text-muted-foreground">Or continue with email</span>
                    </div>
                  </div>
                  
                  {/* Email Form */}
                  <form className="space-y-6">
                    {isSignUp && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input 
                          type="email" 
                          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                          placeholder="your.email@company.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input 
                          type={showPassword ? "text" : "password"}
                          className="w-full pl-10 pr-12 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                          placeholder="Enter your password"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    {!isSignUp && (
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded border-border" />
                          <span className="text-sm text-muted-foreground">Remember me</span>
                        </label>
                        <a href="#" className="text-sm text-amber-600 dark:text-amber-400 hover:underline">
                          Forgot password?
                        </a>
                      </div>
                    )}
                    
                    {isSignUp && (
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="rounded border-border mt-1" />
                        <span className="text-sm text-muted-foreground">
                          I agree to the <a href="#" className="text-amber-600 dark:text-amber-400 hover:underline">Terms of Service</a> and <a href="#" className="text-amber-600 dark:text-amber-400 hover:underline">Privacy Policy</a>
                        </span>
                      </div>
                    )}
                    
                    <button 
                      type="submit"
                      className="w-full luxury-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      {isSignUp ? 'Create Account' : 'Sign In'}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
                  
                  <div className="text-center mt-8">
                    <span className="text-muted-foreground">
                      {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    </span>
                    <button 
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="ml-2 text-amber-600 dark:text-amber-400 font-medium hover:underline"
                    >
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                  </div>
                </div>
                
                {isSignUp && (
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                        🎉 14-day free trial • No credit card required
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 