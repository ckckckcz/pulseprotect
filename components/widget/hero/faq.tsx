"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Play } from "lucide-react";

export default function FAQ() {
  const [FAQTerbuka, setFAQTerbuka] = useState<number | null>(0);
  const [videoSedangDiputar, setVideoSedangDiputar] = useState(false);
  const referensiVideo = useRef<HTMLIFrameElement>(null);

  const daftarFAQ = [
    {
      id: 0,
      pertanyaan: "Bagaimana cara memverifikasi obat?",
      jawaban:
        "Pulse Protect memastikan keaslian obat dengan memanfaatkan data resmi dari Badan Pengawas Obat dan Makanan (BPOM). Cukup pindai kode unik atau masukkan nomor registrasi obat, maka Anda bisa langsung mengetahui status keasliannya.",
    },
    {
      id: 1,
      pertanyaan: "Bagaimana cara melaporkan obat bermasalah?",
      jawaban:
        "Pengguna dapat melaporkan obat yang mencurigakan, palsu, atau tidak sesuai standar langsung melalui aplikasi. Laporan Anda akan membantu meningkatkan pengawasan obat di Indonesia.",
    },
    {
      id: 2,
      pertanyaan: "Apakah ada fitur chatbot untuk membantu pengguna?",
      jawaban:
        "Ya, Pulse Protect dilengkapi dengan chatbot interaktif yang siap menjawab pertanyaan mengenai keaslian obat, cara penggunaan aplikasi, maupun informasi dasar seputar obat yang diverifikasi.",
    },
    {
      id: 3,
      pertanyaan: "Apakah aplikasi ini mudah digunakan?",
      jawaban:
        "Tentu saja. Pulse Protect dirancang dengan antarmuka sederhana dan intuitif, sehingga siapa pun bisa menggunakannya hanya dalam beberapa langkah sederhana.",
    },
    {
      id: 4,
      pertanyaan: "Apa manfaat Pulse Protect bagi masyarakat?",
      jawaban:
        "Dengan membantu masyarakat menghindari obat ilegal, Pulse Protect berkontribusi dalam meningkatkan keselamatan pasien sekaligus memperkuat kepercayaan publik terhadap sistem kesehatan nasional.",
    },
    {
      id: 5,
      pertanyaan: "Apakah aplikasi ini mendukung Smart City & SDGs?",
      jawaban:
        "Ya. Pulse Protect mendukung terwujudnya kota cerdas dengan layanan kesehatan yang aman, transparan, dan berkelanjutan. Aplikasi ini juga sejalan dengan SDGs nomor 3: Kehidupan Sehat dan Sejahtera.",
    },
  ];


  const toggleFAQ = (id: number) => {
    setFAQTerbuka(FAQTerbuka === id ? null : id);
  };

  const putarVideo = () => {
    setVideoSedangDiputar(true);
    // Fokus pada iframe untuk aksesibilitas yang lebih baik
    if (referensiVideo.current) {
      referensiVideo.current.focus();
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
      className="py-20 bg-white"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
        >
          {/* Sisi Kiri - Header dan Video */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-4"
            >
              <div className="inline-block bg-teal-50 border-2 border-teal-100 px-4 py-2 rounded-full">
                <span className="text-teal-600 text-sm font-medium flex items-center gap-2">
                  FAQ
                </span>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
            >
              Pertanyaan? Kami senang Anda{" "}
              <span className="text-teal-600 cardo">bertanya.</span>
            </motion.h2>

            {/* Video YouTube */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="relative bg-teal-700 rounded-3xl overflow-hidden aspect-video group transition-all duration-300 shadow-md hover:shadow-xl"
            >
              {!videoSedangDiputar ? (
                <>
                  {/* Thumbnail video dengan overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-600/80 to-teal-800/80"></div>
                  <button
                    onClick={putarVideo}
                    className="absolute inset-0 flex items-center justify-center w-full h-full cursor-pointer"
                    aria-label="Putar video"
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </button>
                  <p className="absolute bottom-4 left-4 text-white text-sm">Lihat di aksi</p>
                </>
              ) : (
                /* Video YouTube yang disematkan */
                <iframe
                  ref={referensiVideo}
                  src="https://www.youtube.com/embed/jD0j3MP9Kz8?si=ybuckrOugvLp-4lr"
                  title="Pemutar video YouTube"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              )}
            </motion.div>
          </div>

          {/* Sisi Kanan - Daftar FAQ */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12 }
              }
            }}
            className="space-y-4"
          >
            {daftarFAQ.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="border border-gray-200 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.pertanyaan}
                  </h3>
                  <div className="flex-shrink-0">
                    {FAQTerbuka === faq.id ? (
                      <Minus className="w-5 h-5 text-teal-600" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {FAQTerbuka === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.jawaban}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}