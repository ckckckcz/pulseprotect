"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function TeamSection() {
  const teamMembers = [
    {
      name: "Gabriel Batavia",
      title: "AI Engineer",
      image: "/images/developer/gabriel-batavia.png",
    },
    {
      name: "Michelle Dorani Shiba",
      title: "Data and Analytics Specialist",
      image: "/images/developer/michelle-dorani-shiba.png",
    },
    {
      name: "Riovaldo Alfiyan Fahmi Rahman",
      title: "Fullstack Web Developer",
      image: "/images/developer/riovaldo-alfiyan-fahmi-rahman.png",
    },
  ];

  return (
    <section className="bg-white lg:py-16 py-4 px-8 lg:px-48 w-full">
      <div className="w-full mx-auto">
        <div className="flex flex-col lg:flex-row lg:gap-20 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -60, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="flex lg:h-[440px]"
          >
            <h1 className="text-black font-bold text-5xl leading-tight text-left">
              <span>
                The <span className="text-6xl text-teal-700 cardo italic">Minds</span>
              </span>
              <span>
                <div className="bg-white border-l-2 lg:block hidden border-gray-300 border-dashed ml-1 w-full h-full"></div>
              </span>
              <br className="block lg:hidden" />
              <span>
                Behind The <span className="text-6xl text-teal-700 cardo italic">Magic</span>
              </span>
            </h1>
          </motion.div>
          {/* Right Column - Team Grid */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="flex-[2] w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, delay: 0.3 + index * 0.15 }}
                  className="relative overflow-hidden rounded-2xl shadow-md h-[260px] group bg-gray-100"
                >
                  {/* Team Member Image */}
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={`${member.name}, ${member.title}`}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Gradient Overlay with Text */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent px-4 py-3">
                    <h3 className="text-white font-semibold text-base">{member.name}</h3>
                    <p className="text-white text-sm opacity-80">{member.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

