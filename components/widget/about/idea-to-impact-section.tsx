"use client"

import { motion } from "framer-motion"
import { Search, Layout, Code, Rocket } from "lucide-react"

export default function IdeaToImpactSection() {
  const processCards = [
    {
      id: 1,
      title: "Discovery",
      description: "Understanding your goals, audience, and brand vision",
      icon: Search,
      isHighlighted: true,
    },
    {
      id: 2,
      title: "Design",
      description: "Bringing concepts to life with sleek visuals and intuitive UX",
      icon: Layout,
      isHighlighted: false,
    },
    {
      id: 3,
      title: "Development",
      description: "Turning ideas into functional, high-performing digital experiences",
      icon: Code,
      isHighlighted: false,
    },
    {
      id: 4,
      title: "Launch",
      description: "Ensuring successful delivery and post-launch support",
      icon: Rocket,
      isHighlighted: false,
    },
  ]

  return (
    <section className="bg-white lg:py-16 py-4 px-8 lg:px-48 w-full">
      <div className="w-full mx-auto">
        {/* Heading Area */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="text-center lg:mb-16 mb-6"
        >
          {/* Split Heading with Line */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex-row items-center justify-center gap-8 lg:mb-4 mb-0 lg:flex hidden"
          >
            <h1 className="text-black font-bold text-4xl lg:text-5xl whitespace-nowrap">From idea</h1>
            <div className="border-t-2 border-gray-200 w-full"></div>
            <h1 className="text-black font-bold text-4xl lg:text-5xl whitespace-nowrap">to impact</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-start justify-start gap-8 lg:mb-4 mb-0 lg:hidden block"
          >
            <h1 className="text-black font-bold text-4xl lg:text-5xl whitespace-nowrap">From idea to impact</h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-gray-400 text-base lg:text-lg lg:mt-3 mt-2 text-start mx-auto"
          >
            Every project is built on a foundation of collaboration, strategy, and innovation.
          </motion.p>
        </motion.div>

        {/* Horizontally Scrollable Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-6 snap-x snap-mandatory pb-4">
            {processCards.map((card, idx) => {
              const IconComponent = card.icon
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, delay: 0.4 + idx * 0.15 }}
                  className={`min-w-[240px] lg:min-w-[300px] snap-start rounded-xl px-6 py-8 flex-shrink-0 ${
                    card.isHighlighted ? "bg-teal-600 text-white" : "bg-gray-100 border border-gray-200 text-black"
                  }`}
                >
                  {/* Icon */}
                  <IconComponent className={`w-6 h-6 mb-4 ${card.isHighlighted ? "text-white" : "text-black"}`} />

                  {/* Title */}
                  <h3 className="font-semibold text-xl">{card.title}</h3>

                  {/* Description */}
                  <p className={`text-sm ${card.isHighlighted ? "text-white" : "text-gray-500"}`}>
                    {card.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
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
