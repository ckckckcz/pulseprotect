"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Layout, Code, Rocket, ArrowRight, CheckCircle, Clock, Users } from "lucide-react"

export default function IdeaToImpactSection() {
  const processCards = [
    {
      id: 1,
      step: "01",
      title: "Discovery",
      description: "Understanding goals, audience, and brand vision through research and analysis",
      icon: Search,
      isHighlighted: true,
      duration: "1-2 weeks",
      deliverables: ["Research Report", "User Personas", "Project Roadmap"],
    },
    {
      id: 2,
      step: "02",
      title: "Design",
      description: "Bringing concepts to life with sleek visuals and intuitive UX that resonates with your audience",
      icon: Layout,
      isHighlighted: false,
      duration: "2-3 weeks",
      deliverables: ["Wireframes", "UI Design", "Prototype"],
    },
    {
      id: 3,
      step: "03",
      title: "Development",
      description: "Turning ideas into functional, high-performing digital experiences using cutting-edge technology",
      icon: Code,
      isHighlighted: false,
      duration: "3-6 weeks",
      deliverables: ["Frontend", "Backend", "Testing"],
    },
    {
      id: 4,
      step: "04",
      title: "Launch",
      description: "Ensuring successful delivery and comprehensive post-launch support for optimal performance",
      icon: Rocket,
      isHighlighted: false,
      duration: "1 week",
      deliverables: ["Deployment", "Training", "Support"],
    },
  ]

  const stats = [
    { number: "150+", label: "Projects Completed" },
    { number: "98%", label: "Client Satisfaction" },
    { number: "24/7", label: "Support Available" },
  ]

  return (
    <section className="bg-gradient-to-br from-slate-50 via-white to-teal-50/20 py-20 lg:py-28 px-6 lg:px-12 w-full relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-teal-100 px-6 py-3 rounded-full shadow-sm mb-8">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
            <span className="text-teal-700 font-medium text-sm">Our Process</span>
          </div>

          {/* Split Heading with Enhanced Design */}
          <div className="relative mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="hidden lg:flex items-center justify-center gap-8 mb-6"
            >
              <h1 className="text-transparent cardo italic bg-clip-text bg-gradient-to-r from-teal-600 to-teal-700 font-bold text-5xl lg:text-6xl whitespace-nowrap">From idea</h1>
              <div className="relative flex-1 max-w-xs">
                <div className="border-t-2 border-gray-200 w-full"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4">
                  <ArrowRight className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <h1 className="text-transparent cardo italic bg-clip-text bg-gradient-to-r from-teal-600 to-teal-700 font-bold text-5xl lg:text-6xl whitespace-nowrap">
                to impact
              </h1>
            </motion.div>

            {/* Mobile heading */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="lg:hidden block mb-6"
            >
              <h1 className="text-gray-900 font-bold text-4xl leading-tight">
                From idea to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-700">impact</span>
              </h1>
            </motion.div>
          </div>

          {/* Enhanced Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-gray-600 text-lg lg:text-xl leading-relaxed mb-8">
              Every project is built on a foundation of{" "}
              <span className="text-teal-600 font-semibold">collaboration</span>,{" "}
              <span className="text-blue-600 font-semibold">strategy</span>, and{" "}
              <span className="text-purple-600 font-semibold">innovation</span>.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl lg:text-3xl font-bold text-teal-600 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Process Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="relative"
        >
          {/* Desktop Grid Layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-8 mb-12">
            {processCards.map((card, idx) => {
              const IconComponent = card.icon
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: 0.4 + idx * 0.15 }}
                  className="relative"
                >
                  <Card
                    className={`h-full rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
                      card.isHighlighted
                        ? "bg-gradient-to-br from-teal-600 to-teal-700 text-white"
                        : "bg-white/80 backdrop-blur-sm text-gray-900"
                    }`}
                  >
                    <CardContent className="p-8">
                      {/* Step number */}
                      <div className="flex items-center justify-between mb-6">
                        <Badge
                          className={`${
                            card.isHighlighted
                              ? "bg-white/20 text-white border-white/30"
                              : "bg-teal-100 text-teal-700 border-teal-200"
                          } font-bold px-3 py-1`}
                        >
                          {card.step}
                        </Badge>
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            card.isHighlighted
                              ? "bg-white/20"
                              : "bg-gradient-to-br from-teal-500 to-teal-600 text-white"
                          } shadow-lg`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="font-bold text-2xl mb-4">{card.title}</h3>
                      <p
                        className={`text-sm leading-relaxed mb-6 ${
                          card.isHighlighted ? "text-white/90" : "text-gray-600"
                        }`}
                      >
                        {card.description}
                      </p>

                      {/* Duration */}
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{card.duration}</span>
                      </div>

                      {/* Deliverables */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Deliverables:</span>
                        </div>
                        <div className="space-y-1">
                          {card.deliverables.map((deliverable, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-current rounded-full opacity-60"></div>
                              <span className="text-xs">{deliverable}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Connection arrow */}
                  {idx < processCards.length - 1 && (
                    <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-teal-600" />
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Mobile Horizontal Scroll */}
          <div className="lg:hidden overflow-x-auto scrollbar-hide ">
            <div className="flex gap-6 snap-x snap-mandatory pb-4">
              {processCards.map((card, idx) => {
                const IconComponent = card.icon
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, delay: 0.4 + idx * 0.15 }}
                    className="min-w-[280px] snap-start flex-shrink-0"
                  >
                    <Card
                      className={`h-full border rounded-xl ${
                        card.isHighlighted
                          ? "bg-gradient-to-br border-0 from-teal-600 to-teal-700 text-white"
                          : "bg-white/80 bordr border-gray-200 backdrop-blur-sm text-gray-900"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge
                            className={`${
                              card.isHighlighted
                                ? "bg-white/20 text-white border-white/30"
                                : "bg-teal-100 text-teal-700 border-teal-200"
                            } font-bold px-3 py-1`}
                          >
                            {card.step}
                          </Badge>
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              card.isHighlighted
                                ? "bg-white/20"
                                : "bg-gradient-to-br from-teal-500 to-teal-600 text-white"
                            } shadow-lg`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                        </div>
                        <h3 className="font-bold text-xl mb-3">{card.title}</h3>
                        <p
                          className={`text-sm leading-relaxed mb-4 ${
                            card.isHighlighted ? "text-white/90" : "text-gray-600"
                          }`}
                        >
                          {card.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">{card.duration}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-5 h-5 text-teal-600" />
              <span className="text-teal-700 font-medium text-sm">Ready to Start?</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Let's Turn Your Idea Into Reality</h3>
            <p className="text-gray-600 mb-6">
              Schedule a free consultation to discuss your project and see how we can help bring your vision to life.
            </p>
            <button className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl group">
              Start Your Project
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div> */}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
