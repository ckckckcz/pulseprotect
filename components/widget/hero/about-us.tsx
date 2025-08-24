import Image from "next/image";
import { motion } from "framer-motion";
import Team from "@/public/images/team.png";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ScanLine, TriangleAlert, Bot, Accessibility, HeartPulse, Building2, Globe2 } from "lucide-react";

const features = [
  {
    title: "Verifikasi Obat Berbasis Data BPOM",
    description:
      "Pulse Protect memastikan keaslian obat dengan memanfaatkan data resmi dari Badan Pengawas Obat dan Makanan (BPOM). Setiap obat dapat diverifikasi secara cepat dengan memindai kode unik atau memasukkan nomor registrasi, sehingga pengguna terhindar dari risiko obat palsu.",
    icon: ShieldCheck,
  },
  {
    title: "Chatbot Interaktif",
    description:
      "Pulse Protect dilengkapi dengan chatbot cerdas yang siap menjawab pertanyaan seputar keaslian obat, cara penggunaan aplikasi, maupun informasi dasar mengenai obat yang diverifikasi. Chatbot membantu pengguna mendapat jawaban cepat tanpa perlu mencari di banyak sumber.",
    icon: Bot,
  },
  // {
  //   title: "Antarmuka Sederhana & Mudah Digunakan",
  //   description:
  //     "Dirancang dengan tampilan yang intuitif, Pulse Protect dapat digunakan oleh siapa saja. Proses verifikasi dilakukan hanya dengan beberapa langkah sederhana, mempersingkat akses ke informasi kesehatan yang krusial.",
  //   icon: Accessibility,
  // },
  // {
  //   title: "Perlindungan Kesehatan Publik",
  //   description:
  //     "Dengan membantu masyarakat menghindari obat ilegal, Pulse Protect mendukung peningkatan keselamatan pasien serta memperkuat kepercayaan publik terhadap sistem kesehatan nasional.",
  //   icon: HeartPulse,
  // },
  {
    title: "Dukungan Smart City & SDGs",
    description:
      "Pulse Protect berkontribusi pada layanan kesehatan yang aman, transparan, dan berkelanjutan dalam ekosistem kota cerdas. Aplikasi ini juga mendukung SDGs nomor 3: Kehidupan Sehat dan Sejahtera dengan memastikan akses masyarakat terhadap obat yang aman dan berkualitas.",
    icon: Globe2,
  },
];

export default function AboutUs() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left side - Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            <div className="absolute -top-6 lg:-left-6 -left-3 w-28 h-28 lg:w-40 lg:h-40 bg-teal-600 rounded-3xl"></div>
            <div className="absolute -bottom-6 lg:-right-6 -right-3 lg:w-32 lg:h-32 w-20 h-20 bg-teal-500/30 rounded-2xl"></div>
            <div className="relative z-10">
              <Image src={Team} alt="Our Team" width={600} height={400} className="rounded-2xl w-full h-auto" />
            </div>
          </motion.div>

          {/* Right side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="space-y-8 order-1 lg:order-2"
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-50 border-2 border-teal-100 px-4 py-2 rounded-full mb-4">
                <span className="text-teal-600 text-sm font-medium">About Us</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Keaslian Obat <span className="text-teal-600 cardio italic">Terverifikasi</span> untuk Semua.
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Pulse Protect adalah inisiatif untuk membantu masyarakat Indonesia memastikan keaslian obat melalui verifikasi cepat berbasis data resmi BPOM. Kami mengajak publik berkolaborasi mencegah peredaran obat ilegal, sekaligus menghadirkan pengalaman yang sederhana, akurat, dan dapat dipercaya.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-teal-100/70 rounded-xl flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
              Pelajari Pulse Protect 🛡️
            </Button> */}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
