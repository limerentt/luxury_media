import React from 'react'
import Navigation from '@/components/navigation'
import { Award, Users, Globe, Target, Heart, Sparkles } from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { value: "2023", label: "Founded", description: "Started with a vision to revolutionize luxury content" },
    { value: "500+", label: "Luxury Brands", description: "Trust our platform for their content needs" },
    { value: "10M+", label: "Assets Created", description: "High-quality AI-generated content delivered" },
    { value: "150+", label: "Countries", description: "Serving luxury brands worldwide" }
  ]

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Luxury Excellence",
      description: "We believe in delivering nothing but the finest quality, matching the standards of the most prestigious brands in the world.",
      gradient: "from-red-400 to-pink-400"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Innovation First",
      description: "Pioneering the future of AI-powered content creation with cutting-edge technology and creative vision.",
      gradient: "from-purple-400 to-indigo-400"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Client Partnership",
      description: "Building lasting relationships with our clients, understanding their unique brand identity and vision.",
      gradient: "from-blue-400 to-cyan-400"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Impact",
      description: "Empowering luxury brands across the globe to create stunning content that resonates with their audience.",
      gradient: "from-green-400 to-emerald-400"
    }
  ]

  const team = [
    {
      name: "Alexandra Chen",
      role: "CEO & Founder",
      bio: "Former luxury brand consultant with 15+ years at Louis Vuitton and Hermès",
      gradient: "from-purple-400 to-pink-400"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO",
      bio: "AI researcher from Stanford, former lead engineer at Adobe Creative Cloud",
      gradient: "from-blue-400 to-cyan-400"
    },
    {
      name: "Sophie Laurent",
      role: "Head of Design",
      bio: "Creative director with experience at Chanel and Dior, luxury design expert",
      gradient: "from-amber-400 to-orange-400"
    },
    {
      name: "James Thompson",
      role: "VP of Engineering",
      bio: "Former tech lead at Google and Meta, specializing in machine learning",
      gradient: "from-green-400 to-emerald-400"
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
              About Luxury Account
            </h1>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              We are pioneering the future of luxury content creation through AI-powered media generation. 
              Our platform combines cutting-edge technology with sophisticated design to deliver premium 
              results for the world's most discerning brands.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold luxury-text-gradient mb-2">{stat.value}</div>
                <div className="text-lg font-semibold mb-2">{stat.label}</div>
                <p className="text-muted-foreground text-sm">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 luxury-text-gradient">Our Story</h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2023 by a team of luxury industry veterans and AI researchers, 
                  Luxury Account was born from a simple observation: luxury brands needed 
                  content creation tools that matched their exceptional standards.
                </p>
                <p>
                  Traditional design tools and generic AI platforms couldn't capture the 
                  sophistication, elegance, and attention to detail that luxury brands demand. 
                  We set out to change that.
                </p>
                <p>
                  Today, we serve over 500 luxury brands worldwide, from emerging boutiques 
                  to global fashion houses, helping them create stunning visual content that 
                  truly represents their brand's essence.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-2xl p-8 backdrop-blur-sm border border-amber-200/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card rounded-lg p-4 text-center">
                    <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <div className="font-semibold">Industry Recognition</div>
                    <div className="text-sm text-muted-foreground">AI Innovation Award 2024</div>
                  </div>
                  <div className="bg-card rounded-lg p-4 text-center">
                    <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="font-semibold">Precision Focus</div>
                    <div className="text-sm text-muted-foreground">Luxury brands only</div>
                  </div>
                  <div className="bg-card rounded-lg p-4 text-center">
                    <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="font-semibold">Expert Team</div>
                    <div className="text-sm text-muted-foreground">50+ specialists</div>
                  </div>
                  <div className="bg-card rounded-lg p-4 text-center">
                    <Globe className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="font-semibold">Global Reach</div>
                    <div className="text-sm text-muted-foreground">150+ countries</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 luxury-text-gradient">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The principles that guide everything we do and drive our commitment to excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-card border rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${value.gradient} p-4 mb-6`}>
                  <div className="text-white">
                    {value.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 luxury-text-gradient">Leadership Team</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meet the visionaries behind Luxury Account, bringing together expertise in luxury brands, 
              AI technology, and creative design
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="text-center group"
              >
                <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${member.gradient} p-1 mx-auto mb-6`}>
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <div className="text-2xl font-bold text-muted-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <div className="text-amber-600 dark:text-amber-400 font-semibold mb-3">{member.role}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6">Join the Luxury Revolution</h3>
            <p className="text-xl text-muted-foreground mb-8">
              Ready to experience the future of luxury content creation? 
              Let's elevate your brand together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="luxury-gradient text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all">
                Start Your Journey
              </button>
              <button className="border border-amber-500/20 px-8 py-4 rounded-xl font-semibold hover:bg-amber-500/10 transition-all">
                Contact Our Team
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 