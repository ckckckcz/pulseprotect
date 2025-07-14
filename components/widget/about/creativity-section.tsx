"use client";
import { motion } from "framer-motion";

export default function CreativitySection() {
  return (
    <section className="bg-white text-black lg:py-16 pt-8 pb-28 px-8 lg:px-48 w-full">
      <div className="relative w-full mx-auto">

        {/* Main Content Grid */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Heading */}
          <motion.div
            initial={{ opacity: 0, x: -60, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="lg:col-span-1"
          >
            <h1 className=" font-bold text-5xl lg:text-7xl leading-tight"><span className="italic text-teal-700">Creativity</span>  <br /> with purpose</h1>
          </motion.div>

          {/* Right Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="lg:col-span-1 mt-4 lg:mt-0"
          >
            <p className="lg:text-lg text-md font-medium leading-relaxed">
              Mechaminds is a forward-thinking IT collective proudly based in Malang, East Java — a rising tech hub in Indonesia. 
              Formed by a group of passionate and highly-driven individuals, our team consists of 2 to 10 core members 
              who share a common goal: to innovate, compete, and lead in the dynamic world of information technology.
            </p>

            <p className="lg:text-lg text-md font-medium leading-relaxed mt-4">
            Our strength lies not only in technical skills, but also in our collaborative mindset. 
            We actively participate in national and international IT competitions, where we test our ideas, challenge ourselves, and build solutions that matter. 
            Each challenge fuels our growth and sharpens our expertise.
            </p>
          </motion.div>
        </div>

        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="mt-8 lg:mt-12"
        >
          <div className="lg:ml-auto lg:max-w-1xl">
            <img
              src="/placeholder.svg?height=400&width=600"
              alt="Creative team working collaboratively in a modern office environment with multiple monitors and design tools"
              className="w-full h-64 lg:h-96 object-cover rounded-xl grayscale"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
