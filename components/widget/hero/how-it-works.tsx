import React from "react";
import { motion } from "framer-motion";
import { Upload, Zap, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Upload Image or Text",
      description: "Submit your medicine photo or text description for verification."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI Analysis Processing",
      description: "Our AI system analyzes and verifies the authenticity of the medicine."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Get Verification Results",
      description: "Receive detailed report on the medicine's authenticity and safety information."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="lg:text-center text-start mb-16">
          <div className="inline-block bg-teal-50 border-2 border-teal-100 px-4 py-2 rounded-full mb-4">
            <span className="text-teal-600 font-medium flex lg:items-center items-start gap-2">
              <Zap className="w-4 h-4 text-teal-600" fill="currentColor" />
              Step By Step
            </span>
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-gray-900"
          >
            How The Fake Medicine Detection Works?
          </motion.h2>
        </div>

        <div className="flex flex-col lg:flex-row justify-between lg:items-center items-start gap-8 relative">
          {/* Dotted connecting lines */}
          <div className="hidden lg:block absolute top-1/4 left-[10%] right-[10%] border-t-2 border-dashed border-gray-200 z-0"></div>
          
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col lg:items-center items-start lg:text-center text-start w-full lg:w-1/3 z-10"
              >
                <div className="mb-6 relative">
                  {/* Step icon box */}
                  <div className="border-2 border-gray-100 bg-white p-6 rounded-lg shadow-sm">
                    {index === 0 && (
                      <div className="flex items-center">
                        <div className="h-1 w-8 bg-teal-600 mr-1"></div>
                        <div className="h-1 w-24 bg-gray-800"></div>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="rounded-full border-2 border-teal-600 p-2 inline-flex justify-center">
                        <Zap className="w-4 h-4 text-teal-600" fill="currentColor" />
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
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
              
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}