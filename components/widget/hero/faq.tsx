"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Play } from "lucide-react";

export default function FAQ() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLIFrameElement>(null);

  const faqs = [
    {
      id: 0,
      question: "How can I make an Appointment?",
      answer: "To make an appointment, simply contact our office by phone or use our online scheduling system. Choose your preferred date and time, and we'll confirm your appointment promptly.",
    },
    {
      id: 1,
      question: "Are Consultants available 24 hours at Medicare Hospital?",
      answer: "Yes, our consultants are available 24/7 at Medicare Hospital. We have a dedicated team of specialists on call to handle any medical emergencies or urgent consultations at any time of the day or night.",
    },
    {
      id: 2,
      question: "Can I get a weekend appointment? I'm unavailable during weekdays.",
      answer: "Absolutely! We understand that many patients have busy weekday schedules. We offer weekend appointments on both Saturdays and Sundays. Please call our scheduling department to book your preferred weekend slot.",
    },
    {
      id: 3,
      question: "Does Medicare Hospital Provide Emergency Services?",
      answer: "Yes, Medicare Hospital provides comprehensive 24/7 emergency services. Our emergency department is fully equipped with state-of-the-art medical equipment and staffed by experienced emergency physicians and nurses.",
    },
    {
      id: 4,
      question: "Can I reschedule or cancel my appointment?",
      answer: "Yes, you can reschedule or cancel your appointment. We recommend giving us at least 24 hours notice when possible. You can call our office directly or use our online patient portal to manage your appointments.",
    },
    {
      id: 5,
      question: "How can I access my medical records?",
      answer: "You can access your medical records through our secure online patient portal. Simply create an account with your personal information, and you'll have 24/7 access to your test results, medical history, and treatment plans.",
    },
  ];

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
    // Focus on the iframe for better accessibility
    if (videoRef.current) {
      videoRef.current.focus();
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Header and Video */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-4">
                <div className="inline-block bg-teal-50 border-2 border-teal-100 px-4 py-2 rounded-full">
                  <span className="text-teal-600 text-sm font-medium flex items-center gap-2">
                      FAQ
                  </span>
                </div>              
              </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
            >
              Questions? We're Glad you{" "}
              <span className="text-teal-600">asked.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-gray-600 mb-8"
            >
              Quick answer to questions you have. Can't find what you're looking for?
            </motion.p>

            {/* YouTube Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative bg-teal-700 rounded-3xl overflow-hidden aspect-video group transition-all duration-300 shadow-md hover:shadow-xl"
            >
              {!isVideoPlaying ? (
                <>
                  {/* Video thumbnail with overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-600/80 to-teal-800/80"></div>
                  <button 
                    onClick={handlePlayVideo}
                    className="absolute inset-0 flex items-center justify-center w-full h-full cursor-pointer"
                    aria-label="Play video"
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </button>
                  <p className="absolute bottom-4 left-4 text-white text-sm">See in action</p>
                </>
              ) : (
                /* Actual YouTube embedded video */
                <iframe
                  ref={videoRef}
                  src="https://www.youtube.com/embed/a38AIsbLlkw?autoplay=1&rel=0"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              )}
            </motion.div>
          </div>

          {/* Right Side - FAQ List */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openFAQ === faq.id ? (
                      <Minus className="w-5 h-5 text-teal-600" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {openFAQ === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}