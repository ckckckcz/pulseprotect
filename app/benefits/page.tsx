"use client"

import { motion } from "framer-motion"
import { Shield, TrendingUp, Users, Zap, Clock, DollarSign, Leaf, Globe, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const mainBenefits = [
  {
    icon: Shield,
    title: "Enhanced Security & Safety",
    description: "Advanced monitoring and rapid response capabilities ensure citizen safety 24/7.",
    metrics: [
      { label: "Response Time Reduction", value: "40%" },
      { label: "Crime Rate Decrease", value: "25%" },
      { label: "Emergency Response", value: "99.9%" },
    ],
    color: "from-red-500/20 to-teal-500/20",
  },
  {
    icon: TrendingUp,
    title: "Operational Efficiency",
    description: "Streamlined processes and automated systems reduce costs and improve service delivery.",
    metrics: [
      { label: "Cost Reduction", value: "30%" },
      { label: "Process Automation", value: "85%" },
      { label: "Service Efficiency", value: "50%" },
    ],
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Users,
    title: "Citizen Satisfaction",
    description: "Direct engagement channels and transparent governance improve citizen experience.",
    metrics: [
      { label: "Satisfaction Rate", value: "95%" },
      { label: "Service Requests", value: "60%" },
      { label: "Response Rate", value: "90%" },
    ],
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Leaf,
    title: "Environmental Impact",
    description: "Smart resource management and optimization reduce environmental footprint.",
    metrics: [
      { label: "Energy Savings", value: "25%" },
      { label: "Carbon Reduction", value: "35%" },
      { label: "Waste Optimization", value: "40%" },
    ],
    color: "from-green-500/20 to-emerald-500/20",
  },
]

const additionalBenefits = [
  {
    icon: Clock,
    title: "Real-time Monitoring",
    description: "24/7 monitoring of all city systems with instant alerts and notifications.",
  },
  {
    icon: DollarSign,
    title: "Cost Optimization",
    description: "Reduce operational costs through automation and efficient resource allocation.",
  },
  {
    icon: Globe,
    title: "Scalable Solution",
    description: "Platform grows with your city, supporting expansion and new requirements.",
  },
  {
    icon: Zap,
    title: "Smart Automation",
    description: "Intelligent automation reduces manual work and improves system reliability.",
  },
  {
    icon: Shield,
    title: "Data Security",
    description: "Enterprise-grade security ensures all citizen and city data remains protected.",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description: "Advanced analytics provide insights for continuous improvement and optimization.",
  },
]

const testimonials = [
  {
    name: "Mayor Sarah Johnson",
    city: "Metro City",
    quote:
      "SmartCity platform transformed our operations. We've seen remarkable improvements in efficiency and citizen satisfaction.",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Dr. Michael Chen",
    city: "Tech Valley",
    quote: "The environmental benefits alone justify the investment. We've reduced our carbon footprint significantly.",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Director Lisa Rodriguez",
    city: "Green Harbor",
    quote:
      "Citizens love the transparency and direct communication channels. It's revolutionized our community engagement.",
    image: "/placeholder.svg?height=60&width=60",
  },
]

export default function BenefitsPage() {
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
            <Link href="/features" className="hover:text-[#00D4AA] transition-colors">
              Features
            </Link>
            <Link href="/benefits" className="text-[#00D4AA]">
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
            Measurable <span className="text-[#00D4AA]">Benefits</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-12"
          >
            See the real-world impact SmartCity platform delivers to cities worldwide. From cost savings to improved
            citizen satisfaction, the results speak for themselves.
          </motion.p>
        </div>
      </section>

      {/* Main Benefits */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mainBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`bg-gradient-to-br ${benefit.color} border-gray-800 p-8 h-full hover:border-[#00D4AA]/50 transition-all duration-300`}
                >
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-16 h-16 bg-[#00D4AA]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-8 w-8 text-[#00D4AA]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3">{benefit.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {benefit.metrics.map((metric, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-3xl font-bold text-[#00D4AA] mb-1">{metric.value}</div>
                        <div className="text-sm text-gray-400">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Benefits */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-900/10 to-purple-900/10">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Additional <span className="text-[#00D4AA]">Advantages</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Beyond the core benefits, SmartCity platform offers numerous additional advantages that enhance overall
              city operations and citizen experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-[#1A1A2E] border-gray-800 p-6 h-full hover:border-[#00D4AA]/50 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-[#00D4AA]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#00D4AA]/20 transition-colors">
                    <benefit.icon className="h-6 w-6 text-[#00D4AA]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What City Leaders <span className="text-[#00D4AA]">Say</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Hear from city leaders who have experienced the transformative benefits of SmartCity platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-[#1A1A2E] border-gray-800 p-8 h-full">
                  <div className="mb-6">
                    <p className="text-gray-300 leading-relaxed italic">"{testimonial.quote}"</p>
                  </div>
                  <div className="flex items-center">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-[#00D4AA] text-sm">{testimonial.city}</div>
                    </div>
                  </div>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Experience These Benefits Today</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the growing number of cities that have transformed their operations with SmartCity platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-black px-8 py-4 text-lg font-semibold"
                >
                  Start Your Transformation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg bg-transparent"
              >
                Calculate ROI
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
