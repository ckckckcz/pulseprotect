"use client"

import { motion } from "framer-motion"
import { Shield, Camera, MessageSquare, TrendingUp, Users, Zap, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Shield,
    title: "Advanced Security Monitoring",
    description: "Real-time threat detection and response across all city infrastructure with AI-powered analytics.",
    benefits: ["24/7 monitoring", "Instant alerts", "Automated responses", "Threat intelligence"],
  },
  {
    icon: Camera,
    title: "Smart CCTV Network",
    description: "Intelligent video surveillance with facial recognition and behavior analysis capabilities.",
    benefits: ["HD video quality", "Night vision", "Motion detection", "Cloud storage"],
  },
  {
    icon: MessageSquare,
    title: "Citizen Engagement Platform",
    description: "Direct communication channel between citizens and city officials for reporting and feedback.",
    benefits: ["Real-time reporting", "Status tracking", "Multi-language support", "Mobile app"],
  },
  {
    icon: TrendingUp,
    title: "Data Analytics Dashboard",
    description: "Comprehensive analytics and insights for better decision making and resource allocation.",
    benefits: ["Real-time metrics", "Predictive analytics", "Custom reports", "Data visualization"],
  },
  {
    icon: Users,
    title: "Community Management",
    description: "Tools for managing citizen services, events, and community engagement initiatives.",
    benefits: ["Event management", "Service requests", "Community forums", "Feedback system"],
  },
  {
    icon: Zap,
    title: "Smart Infrastructure Control",
    description: "Automated control and monitoring of city infrastructure including lights, traffic, and utilities.",
    benefits: ["Energy efficiency", "Traffic optimization", "Automated scheduling", "Remote control"],
  },
]

const benefits = [
  {
    title: "Improved Safety",
    description: "Enhanced security monitoring and faster emergency response times",
    icon: Shield,
    stats: "40% faster response",
  },
  {
    title: "Better Efficiency",
    description: "Optimized resource allocation and automated city operations",
    icon: TrendingUp,
    stats: "30% cost reduction",
  },
  {
    title: "Citizen Satisfaction",
    description: "Direct communication channels and transparent governance",
    icon: Users,
    stats: "95% satisfaction rate",
  },
  {
    title: "Environmental Impact",
    description: "Reduced energy consumption and optimized traffic flow",
    icon: Zap,
    stats: "25% energy savings",
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 w-full z-50 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-gray-800"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Smart<span className="text-[#00D4AA]">City</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-[#00D4AA]">
              Features
            </Link>
            <Link href="/benefits" className="hover:text-[#00D4AA] transition-colors">
              Benefits
            </Link>
            <Link href="/login" className="hover:text-[#00D4AA] transition-colors">
              Login
            </Link>
          </div>
          <Link href="/login">
            <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black font-semibold">Get Started</Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Platform <span className="text-[#00D4AA]">Features</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-12"
          >
            Discover the comprehensive suite of tools and capabilities that make SmartCity the most trusted platform for
            urban management and citizen engagement.
          </motion.p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-[#1A1A2E] border-gray-800 p-8 h-full hover:border-[#00D4AA]/50 transition-all duration-300 group">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-[#00D4AA]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#00D4AA]/20 transition-colors mb-4">
                      <feature.icon className="h-8 w-8 text-[#00D4AA]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed mb-6">{feature.description}</p>
                  </div>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-300">
                        <CheckCircle className="h-4 w-4 text-[#00D4AA] mr-2 flex-shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-900/10 to-purple-900/10">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Key <span className="text-[#00D4AA]">Benefits</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See how SmartCity platform delivers measurable improvements across all aspects of urban management.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-[#1A1A2E] border-gray-800 p-6 text-center hover:border-[#00D4AA]/50 transition-all duration-300">
                  <div className="w-16 h-16 bg-[#00D4AA]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-[#00D4AA]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{benefit.description}</p>
                  <div className="text-2xl font-bold text-[#00D4AA]">{benefit.stats}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#00D4AA]/20 via-blue-500/20 to-purple-500/20 rounded-3xl p-12 text-center border border-[#00D4AA]/30"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your City?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of cities worldwide that trust SmartCity platform for their digital transformation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black px-8 py-4 text-lg font-semibold"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg bg-transparent"
              >
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
