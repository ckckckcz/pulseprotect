"use client";
import { motion } from "framer-motion";

export default function AnimatedCrossBanner() {
  const text1 = "We Are MechaMinds!"
  const text2 = "We Are MechaMinds!"
  // const text3 = "We Are MechaMinds!"
  const separator = " • "
  const fullText = Array(8)
    .fill(text1 + separator + text2 + separator)
    .join(" ")

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }} // animasi dari bawah ke atas
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
      className="w-full lg:h-24 lg:mt-0 mt-10 bg-white flex items-center justify-center relative z-20"
    >
      {/* Second diagonal stripe - top-right to bottom-left */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-[70px] lg:h-full">
          {/* Background stripe */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.8 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="absolute inset-0 bg-teal-600 transform origin-center shadow-lg"
            style={{
              width: "150%",
              left: "-25%",
            }}
          />

          {/* Text container */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} // animasi dari bawah ke atas
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="absolute inset-0 flex items-center overflow-hidden transform"
          >
            <div className="flex animate-scroll-left-continuous">
              <span className="text-white font-bold lg:text-3xl text-2xl whitespace-nowrap">
                {fullText}
              </span>
              <span className="text-white font-bold lg:text-3xl text-2xl whitespace-nowrap">
                {fullText}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-right-continuous {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes scroll-left-continuous {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        .animate-scroll-right-continuous {
          animation: scroll-right-continuous 50s linear infinite;
        }
        
        .animate-scroll-left-continuous {
          animation: scroll-left-continuous 50s linear infinite;
        }
      `}</style>
    </motion.div>
  )
}
