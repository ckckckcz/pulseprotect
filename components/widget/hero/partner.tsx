"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Avatar1 from "@/public/images/partner/12.png";
import Avatar2 from "@/public/images/partner/13.png";
import Avatar3 from "@/public/images/partner/21.png";
import Avatar4 from "@/public/images/partner/34.png";
import BPOM from "@/public/images/partner/BPOM.png";
import Kemenkes from "@/public/images/partner/Kemenkes.png";
import Komdigi from "@/public/images/partner/Komdigi.png";
import Polri from "@/public/images/partner/Polri.png";
import Kimia from "@/public/images/partner/Kimia_Farma.png";
import Halodoc from "@/public/images/partner/Halodoc.png";
import Kalbe from "@/public/images/partner/Kalbe.png";
import Kompas from "@/public/images/partner/Kompas.png";
import CNN from "@/public/images/partner/CNN.png";

const fallbackImg = "/images/partner/fallback.png"; // Place a valid PNG here

function safeSrc(src: any) {
  // If src is undefined or null, fallback
  return src || fallbackImg;
}

export default function ClientTrustSection() {
  return (
    <section className="w-full lg:py-12 py-4">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row lg:items-center justify-between gap-8 bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm"
          >
            {/* Left side - Trust indicators */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {[
                  Avatar1,
                  Avatar2,
                  Avatar3,
                  Avatar4,
                ].map((src, idx) => (
                  <motion.div
                    key={`avatar-${idx}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.15 * idx }}
                    className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-sm overflow-hidden ${
                      idx === 0
                        ? "bg-gradient-to-br from-blue-400 to-blue-600"
                        : idx === 1
                        ? "bg-gradient-to-br from-green-400 to-green-600"
                        : idx === 2
                        ? "bg-gradient-to-br from-purple-400 to-purple-600"
                        : "bg-gradient-to-br from-orange-400 to-orange-600"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`Client avatar ${idx + 1}`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-start md:text-left"
              >
                <p className="text-sm text-gray-600 font-medium">Trusted by</p>
                <p className="text-lg md:text-xl font-semibold text-gray-900">
                  8000+ Clients
                </p>
              </motion.div>
            </div>

            {/* Vertical divider - hidden on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="hidden md:block w-px h-16 bg-gray-300"
            />

            {/* Right side - Company logos */}
            <div className="w-full md:w-auto flex flex-wrap justify-start md:justify-start gap-4 md:gap-6 lg:gap-1">
              {[
                { src: BPOM, alt: "BADAN POM" },
                { src: Kemenkes, alt: "Kementrian Kesehatan RI" },
                { src: Komdigi, alt: "Komdigi" },
                { src: Polri, alt: "Polri" },
                { src: Kimia, alt: "Kimia Farma" },
                { src: Halodoc, alt: "Halodoc" },
                { src: Kalbe, alt: "Kalbe Farma" },
                { src: Kompas, alt: "Kompas TV" },
                { src: CNN, alt: "CNN Indonesia" },
              ].map((logo, idx) => (
                <motion.div
                  key={`${logo.alt}-${idx}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * idx }}
                  className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-xl bg-white border border-gray-200"
                  style={{ minWidth: "5rem" }}
                >
                  <Image
                    src={safeSrc(logo.src)}
                    alt={logo.alt}
                    width={56}
                    height={56}
                    className="object-contain w-14 h-14"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}