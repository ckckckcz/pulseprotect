"use client";
import { motion } from "framer-motion";

export default function StrategyDesignSection() {
  const services = [
    {
      title: "Branding & identity",
      subtitle: "Crafting strong visual identities that tell your brand's story",
    },
    {
      title: "Web design & development",
      subtitle: "Stunning, high-performance websites tailored for growth",
    },
    {
      title: "Digital strategy & marketing",
      subtitle: "SEO, paid ads, and social media campaigns that drive results",
    },
    {
      title: "UI/UX design",
      subtitle: "Intuitive, beautiful interfaces that elevate user experience",
    },
  ]

  return (
    <section className="bg-white py-16 px-8 lg:px-48 w-full">
      <div className="w-full mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Heading */}
          <motion.div
            initial={{ opacity: 0, x: -60, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="lg:col-span-1 mb-12 lg:mb-0"
          >
            <h1 className="text-teal-600 font-bold text-4xl lg:text-7xl leading-tight">
              <span className="block">Where</span>
              <span className="block italic text-teal-700">strategy</span>
              <span className="block">meets</span>
              <span className="block">design</span>
            </h1>
          </motion.div>

          {/* Right Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="lg:col-span-1"
          >
            {/* Intro Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-black text-base lg:text-lg leading-relaxed mb-8"
            >
              We specialize in brand transformation, helping businesses stand out with visually stunning and
              strategically crafted experiences. Our expertise spans
            </motion.p>

            {/* Service List */}
            <div className="space-y-6">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, delay: 0.4 + index * 0.15 }}
                  className="group"
                >
                  <h3 className="text-black font-semibold text-2xl mb-1 group-hover:text-teal-600 transition-colors duration-200">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 mb-6 text-md">{service.subtitle}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
