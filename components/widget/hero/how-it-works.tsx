import React from "react";
import { motion } from "framer-motion";
import { Upload, Zap, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Unggah Gambar atau Teks",
      description: "Kirim foto obat atau deskripsi teks untuk verifikasi.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Proses Analisis AI",
      description: "Sistem AI kami menganalisis dan memverifikasi keaslian obat.",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Dapatkan Hasil Verifikasi",
      description: "Terima laporan detail tentang keaslian dan keamanan obat.",
    },
  ];

  // Framer Motion variants for step-by-step animation
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  // Perbaikan: gunakan ease "easeInOut" dari framer-motion, bukan string
  const stepVariants = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeInOut" as any },
    },
  };

  return (
    <section className="lg:py-20 py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="lg:text-center text-start mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <div className="inline-block bg-teal-50 border-2 border-teal-100 px-4 py-2 rounded-full">
              <span className="text-teal-600 text-sm font-medium flex items-center gap-2">Langkah Demi Langkah</span>
            </div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, amount: 0.2 }}
            className="text-4xl font-bold text-gray-900"
          >
            Bagaimana Deteksi Obat Palsu Bekerja?
          </motion.h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="flex flex-col lg:flex-row justify-between items-center gap-8 relative"
        >
          {/* Dotted connecting lines */}
          <div className="hidden lg:block absolute top-1/4 left-[10%] right-[10%] border-t-2 border-dashed border-gray-200 z-0"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={stepVariants}
              className="flex flex-col items-center text-center w-full lg:w-1/3 z-10"
            >
              <div className="mb-6 relative">
                {/* Step icon box */}
                {index === 1 ? (
                  <motion.div
                    initial={{ boxShadow: "0 0 0 0 rgba(45, 212, 191, 0.5)" }}
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(45, 212, 191, 0.5)",  
                        "0 0 12px 4px rgba(94, 234, 212, 0.7)",
                        "0 0 18px 6px rgba(20, 184, 166, 0.8)", 
                        "0 0 24px 8px rgba(13, 148, 136, 1)",   
                        "0 0 18px 6px rgba(20, 184, 166, 0.8)", 
                        "0 0 12px 4px rgba(94, 234, 212, 0.7)",
                        "0 0 0 0 rgba(45, 212, 191, 0.5)",     
                      ],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="border-2 border-gray-100 bg-white p-6 rounded-xl shadow-sm"
                  >
                    <div className="rounded-full border-2 border-teal-600 p-2 inline-flex justify-center">
                      <Zap className="w-4 h-4 text-teal-600" fill="currentColor" />
                    </div>
                  </motion.div>
                ) : (
                  <div className="border-2 border-gray-100 bg-white p-6 rounded-xl shadow-sm">
                    {index === 0 && (
                      <div className="flex items-center">
                        <div className="h-1 w-8 bg-teal-600 mr-1"></div>
                        <div className="h-1 w-24 bg-gray-800"></div>
                      </div>
                    )}
                    {index === 2 && (
                      <div className="flex">
                        <div className="h-1 w-10 bg-gray-800 mr-1"></div>
                        <div className="h-1 w-10 bg-gray-800 mr-1"></div>
                        <div className="h-1 w-10 bg-teal-600"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
