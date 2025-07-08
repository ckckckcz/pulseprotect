"use client";

import { motion } from "framer-motion";
import { Heart, Brain, Zap, ArrowRight } from "lucide-react";

export default function Services() {
  const services = [
    {
      id: 1,
      title: "Cardiology",
      description:
        "Tortor posuere ac ut consequat semper viverra nam. Orci ac auctor augue mauris augue neque gravida in.",
      icon: Heart,
      color: "bg-white",
      highlight: true,
    },
    {
      id: 2,
      title: "Neurology",
      description:
        "Tortor posuere ac ut consequat semper viverra nam. Orci ac auctor augue mauris augue neque gravida in.",
      icon: Brain,
      color: "bg-white",
      highlight: true,
    },
    {
      id: 3,
      title: "Radiology",
      description:
        "Tortor posuere ac ut consequat semper viverra nam. Orci ac auctor augue mauris augue neque gravida in.",
      icon: Zap,
      color: "bg-white",
      highlight: true,
    },
    {
      id: 4,
      title: "Pulmonary",
      description:
        "Tortor posuere ac ut consequat semper viverra nam. Orci ac auctor augue mauris augue neque gravida in.",
      icon: Zap,
      color: "bg-white",
      highlight: true,
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4"
          >
            <span className="text-teal-600 font-semibold text-sm bg-teal-100 px-3 py-1 rounded-full">
              Our Services
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            Find Our Different Services
            <br />
            For Your Whole Family
          </motion.h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`${
                service.color
              } border-2 border-gray-200 hover:border-transparent hover:bg-teal-600 hover:animate-pulse ${service.highlight ? "lg:scale-110 lg:-mt-8" : ""} rounded-3xl p-8 group hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden`}
              style={{
                animation: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.animation = 'shake 0.5s ease-in-out';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.animation = 'none';
              }}
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-white group-hover:bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="w-8 h-8 text-teal-600 group-hover:text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-white">
                {service.title}
              </h3>

              <p className="text-sm leading-relaxed mb-6 text-gray-600 group-hover:text-white/80">
                {service.description}
              </p>

              {/* View Details Link - Always present but hidden by default */}
              <div
                className={`flex items-center font-medium transition-all duration-300 cursor-pointer opacity-0 group-hover:opacity-100 text-white`}
              >
                <span>View Details</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}