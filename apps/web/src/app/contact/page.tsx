import React from 'react'
import Navigation from '@/components/navigation'
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Headphones, Building } from 'lucide-react'

export default function ContactPage() {
  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      description: "Get in touch via email for general inquiries",
      contact: "hello@luxuryaccount.ai",
      action: "Send Email",
      gradient: "from-blue-400 to-cyan-400"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      description: "Speak directly with our luxury specialists",
      contact: "+1 (555) 123-4567",
      action: "Call Now",
      gradient: "from-green-400 to-emerald-400"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Live Chat",
      description: "Instant support through our live chat system",
      contact: "Available 24/7",
      action: "Start Chat",
      gradient: "from-purple-400 to-indigo-400"
    },
    {
      icon: <Building className="w-6 h-6" />,
      title: "Visit Us",
      description: "Meet our team at our luxury headquarters",
      contact: "Schedule a visit",
      action: "Book Meeting",
      gradient: "from-amber-400 to-orange-400"
    }
  ]

  const departments = [
    {
      name: "Sales & Partnerships",
      email: "sales@luxuryaccount.ai",
      description: "Enterprise solutions and strategic partnerships",
      icon: <Building className="w-5 h-5" />
    },
    {
      name: "Customer Success",
      email: "success@luxuryaccount.ai", 
      description: "Account management and customer support",
      icon: <Headphones className="w-5 h-5" />
    },
    {
      name: "Technical Support",
      email: "support@luxuryaccount.ai",
      description: "Platform assistance and technical issues",
      icon: <MessageCircle className="w-5 h-5" />
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
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Ready to elevate your brand with AI-powered luxury content? 
              Our team of experts is here to help you transform your creative vision into reality.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <div 
                key={index}
                className="bg-card border rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${method.gradient} p-4 mx-auto mb-4`}>
                  <div className="text-white">
                    {method.icon}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold mb-2">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                <div className="font-semibold text-amber-600 dark:text-amber-400 mb-4">{method.contact}</div>
                
                <button className="w-full py-2 px-4 border border-amber-500/20 rounded-lg hover:bg-amber-500/10 transition-all text-sm font-medium">
                  {method.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6 luxury-text-gradient">Send us a Message</h2>
              <p className="text-muted-foreground mb-8">
                Tell us about your project and we'll get back to you within 24 hours with a customized solution.
              </p>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    placeholder="your.email@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    placeholder="Your luxury brand or company"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <select className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all">
                    <option>General Inquiry</option>
                    <option>Sales & Pricing</option>
                    <option>Technical Support</option>
                    <option>Partnership Opportunity</option>
                    <option>Media & Press</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea 
                    rows={6}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none"
                    placeholder="Tell us about your project, goals, and how we can help elevate your brand..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full luxury-gradient text-white py-4 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>
            
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold mb-6 luxury-text-gradient">Contact Information</h2>
              
              {/* Office Info */}
              <div className="bg-card border rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 p-3">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Global Headquarters</h3>
                    <p className="text-muted-foreground text-sm">
                      123 Luxury Avenue<br />
                      Beverly Hills, CA 90210<br />
                      United States
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-400 to-cyan-400 p-3">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Business Hours</h3>
                    <p className="text-muted-foreground text-sm">
                      Monday - Friday: 9:00 AM - 6:00 PM PST<br />
                      Weekend: Available for enterprise clients<br />
                      24/7 Support for premium plans
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Department Contacts */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Department Contacts</h3>
                {departments.map((dept, index) => (
                  <div key={index} className="bg-card border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-amber-500">
                        {dept.icon}
                      </div>
                      <h4 className="font-semibold">{dept.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{dept.description}</p>
                    <a 
                      href={`mailto:${dept.email}`}
                      className="text-amber-600 dark:text-amber-400 text-sm font-medium hover:underline"
                    >
                      {dept.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6">Prefer to Schedule a Call?</h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Book a personalized consultation with our luxury brand specialists to discuss your specific needs and see our platform in action.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="luxury-gradient text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all">
                Schedule Demo
              </button>
              <button className="border border-amber-500/20 px-8 py-4 rounded-xl font-semibold hover:bg-amber-500/10 transition-all">
                View Calendar
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 