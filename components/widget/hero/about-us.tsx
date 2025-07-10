import Image from "next/image";
import { motion } from "framer-motion";
import {Button} from "@/components/ui/button";
export default function AboutUs() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Image */}
          <div className="relative">
            <div className="absolute -top-6 lg:-left-6 -left-3 w-28 h-28 lg:w-40 lg:h-40 bg-teal-600 rounded-3xl"></div>
            <div className="absolute -bottom-6 lgl:-right-6 -right-3 lg:w-32 lg:h-32 w-20 h-20 bg-teal-500/30 rounded-2xl"></div>

            {/* Main image */}
            <div className="relative z-10">
              <Image src="https://dinkesp2kb.lumajangkab.go.id/uploads/berita/obat.jpg" alt="Healthcare professionals" width={600} height={400} className="rounded-2xl w-full h-auto" />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-8">
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-4">
                <span className="text-teal-600 font-semibold text-sm bg-teal-100 px-3 py-1 rounded-full">Tentang Bakekok</span>
              </motion.div>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Kebutuhan Kesehatan Anda <span className="text-teal-600">Adalah Fokus</span> Utama Kami.
              </motion.h2>

              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-gray-600 text-lg leading-relaxed mb-8">
                Secara berkelanjutan kami koordinasi aksi kolaboratif untuk layanan pelanggan generasi berikutnya. Secara khusus dipercepat di seluruh dunia adalah platform turnkey. Secara profesional menyebarkan proses yang didorong oleh
                tim.
              </motion.p>
            </div>

            <div className="space-y-6">
              {[
                {
                  title: "Ultra Test Anesthesiology Healthcare",
                  description: "Pasien dapat terhubung dengan penyedia layanan kesehatan untuk konsultasi dari kenyamanan... Baca selengkapnya",
                },
                {
                  title: "Cerebral plus multi-body skin or head testing",
                  description: "Pasien dapat terhubung dengan penyedia layanan kesehatan untuk konsultasi dari kenyamanan... Baca selengkapnya",
                },
                {
                  title: "Resource for human anti-body operations",
                  description: "Pasien dapat terhubung dengan penyedia layanan kesehatan untuk konsultasi dari kenyamanan... Baca selengkapnya",
                },
              ].map((item, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-4 h-4 bg-teal-200 rounded-full animate-ping opacity-75"></div>
                      <div className="absolute w-3 h-3 bg-teal-300 rounded-full animate-pulse"></div>
                      <div className="relative w-2 h-2 bg-teal-400 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.description.split("...")[0]}... <span className="text-teal-600 font-medium cursor-pointer hover:underline">Baca selengkapnya</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="pt-6">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white p-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg">Temukan Lebih Banyak 🧐</Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
