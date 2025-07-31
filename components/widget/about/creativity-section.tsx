"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Users, Trophy, Code, ArrowRight, Sparkles } from "lucide-react";

export default function CreativitySection() {
  const highlights = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "2-10 Core Members",
      description: "Tim inti yang kompak dan berdedikasi",
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "National & International",
      description: "Kompetisi IT tingkat nasional dan internasional",
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Innovation Driven",
      description: "Solusi teknologi yang inovatif dan bermakna",
    },
  ];

  const values = [
    { label: "Innovation", color: "bg-teal-100 text-teal-700" },
    { label: "Collaboration", color: "bg-blue-100 text-blue-700" },
    { label: "Excellence", color: "bg-purple-100 text-purple-700" },
    { label: "Growth", color: "bg-green-100 text-green-700" },
  ];

  return (
    <section className="bg-white text-black py-20 lg:py-28 px-6 lg:px-12 w-full relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
          {/* Left Column - Heading & Values */}
          <motion.div
            initial={{ opacity: 0, x: -60, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="lg:col-span-5 space-y-8"
          >
            <div>
              <h1 className="font-bold text-5xl lg:text-7xl leading-tight mb-8">
                <span className="italic text-teal-600 cardo">Creativity</span>
                <br />
                <span className="text-gray-900">with purpose</span>
              </h1>

              {/* Values badges */}
              <div className="flex flex-wrap gap-3">
                {values.map((value, index) => (
                  <motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                    <Badge className={`${value.color} border-0 px-4 py-2 font-medium`}>{value.label}</Badge>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Location highlight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-600">Based in</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Malang, East Java</h3>
              <p className="text-gray-600 text-sm mt-1">Rising tech hub in Indonesia</p>
            </motion.div>
          </motion.div>

          {/* Right Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="prose prose-lg max-w-none">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-teal-100 px-6 py-3 rounded-full shadow-sm mb-6">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span className="text-teal-700 font-medium text-sm">Tentang Mechaminds</span>
              </div>
              <p className="text-lg lg:text-xl font-medium leading-relaxed text-gray-700 mb-6">
                <strong className="text-gray-900">Mechaminds</strong> is a forward-thinking IT collective proudly based in Malang, East Java — a rising tech hub in Indonesia. Formed by a group of passionate and highly-driven individuals,
                our team consists of 2 to 10 core members who share a common goal: to innovate, compete, and lead in the dynamic world of information technology.
              </p>

              <p className="text-lg lg:text-xl font-medium leading-relaxed text-gray-700">
                Our strength lies not only in technical skills, but also in our <span className="text-teal-600 cardo italic">collaborative mindset</span>. We actively participate in national and international IT competitions, where we test
                our ideas, challenge ourselves, and build solutions that matter. Each challenge fuels our growth and sharpens our expertise.
              </p>
            </div>

            {/* Highlights Cards */}
            {/* <div className="grid gap-4">
              {highlights.map((highlight, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}>
                  <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">{highlight.icon}</div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{highlight.title}</h4>
                          <p className="text-sm text-gray-600">{highlight.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div> */}
          </motion.div>
        </div>

        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="relative"
        >
          <div className="relative w-full mx-auto">
            {/* Decorative elements around image */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-500 rounded-3xl opacity-80 shadow-xl"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl opacity-60"></div>
            {/* <div className="absolute top-1/2 -left-8 w-16 h-16 z-20 bg-white rounded-full shadow-lg flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-teal-600" />
            </div> */}

            {/* Main image container */}
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl bg-white p-2">
              <img
                src="/placeholder.svg?height=500&width=800"
                alt="Creative team working collaboratively in a modern office environment with multiple monitors and design tools"
                className="w-full h-64 lg:h-[500px] object-cover rounded-2xl filter grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-2 rounded-2xl bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
            </div>

            {/* Floating stats card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -bottom-8 left-8 z-20 bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">100+</div>
                  <div className="text-xs text-gray-600">Projects</div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">10+</div>
                  <div className="text-xs text-gray-600">Competitions</div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">2+</div>
                  <div className="text-xs text-gray-600">Years</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Call to action */}
        {/* <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, delay: 0.6 }} className="text-center mt-20">
          <button className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl group">
            Explore Our Work
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div> */}
      </div>
    </section>
  );
}
