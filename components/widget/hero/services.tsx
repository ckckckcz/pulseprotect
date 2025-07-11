"use client";

import { motion } from "framer-motion";
import { Heart, Brain, Zap, ArrowRight } from "lucide-react";

export default function Services() {
  const services = [
    {
      id: 1,
        title: "Kardiologi",
      description:
        "Layanan jantung terbaik untuk keluarga Anda. Tim kami siap membantu kesehatan jantung Anda secara menyeluruh.",
      icon: Heart,
      color: "bg-white",
      highlight: true,
    },
    {
      id: 2,
      title: "Neurologi",
      description:
        "Perawatan saraf dan otak dengan teknologi terkini. Konsultasi dan penanganan oleh dokter spesialis berpengalaman.",
      icon: Brain,
      color: "bg-white",
      highlight: true,
    },
    {
      id: 3,
      title: "Radiologi",
      description:
        "Pemeriksaan radiologi modern untuk diagnosa yang akurat dan cepat. Didukung alat canggih dan tenaga ahli.",
      icon: Zap,
      color: "bg-white",
      highlight: true,
    },
    {
      id: 4,
      title: "Paru-paru",
      description:
        "Layanan kesehatan paru-paru untuk semua usia. Pencegahan dan pengobatan penyakit pernapasan secara profesional.",
      icon: Zap,
      color: "bg-white",
      highlight: true,
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="lg:text-center lg:mb-24 mb-14"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4"
          >
            <div className="inline-block bg-teal-50 border-2 border-teal-100 px-4 py-2 rounded-full">
              <span className="text-teal-600 text-sm font-medium flex items-center gap-2">
                Layanan Kami
              </span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            Temukan Beragam Layanan Kami
            <br />
            Untuk Kesehatan Keluarga Anda
          </motion.h2>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.15 },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.1 * index }}
              className={`${
                service.color
              } border-2 border-gray-200 hover:border-transparent hover:bg-teal-600 hover:animate-pulse ${
                service.highlight ? "lg:scale-110 lg:-mt-8" : ""
              } rounded-3xl lg:p-8 p-6 group hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden`}
              style={{
                animation: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.animation = "shake 0.5s ease-in-out";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.animation = "none";
              }}
            >
              {/* Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                className="w-16 h-16 bg-white group-hover:bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
              >
                <service.icon className="w-8 h-8 text-teal-600 group-hover:text-white" />
              </motion.div>

              {/* Content */}
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.25 + index * 0.05 }}
                className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-white"
              >
                {service.title}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                className="text-sm leading-relaxed mb-6 text-gray-600 group-hover:text-white/80"
              >
                {service.description}
              </motion.p>

              {/* View Details Link - Always present but hidden by default */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.35 + index * 0.05 }}
                className={`flex items-center font-medium transition-all duration-300 cursor-pointer opacity-0 group-hover:opacity-100 text-white`}
              >
                <span>Lihat Detail</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}