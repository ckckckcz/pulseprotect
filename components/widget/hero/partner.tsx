import Image from "next/image"
import { motion } from "framer-motion"

export default function ClientTrustSection() {
  return (
    <section className="w-full lg:py-12 py-4">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row lg:items-center justify-between gap-8 bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm"
          >
            {/* Left side - Trust indicators */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex items-center gap-4"
            >
              {/* Overlapping avatars */}
              <div className="flex -space-x-4">
                {/* Animasi avatar stagger */}
                { [
                  "https://avatar.iran.liara.run/public/12",
                  "https://avatar.iran.liara.run/public/13",
                  "https://avatar.iran.liara.run/public/21",
                  "https://avatar.iran.liara.run/public/34"
                ].map((src, idx) => (
                  <motion.div
                    key={src}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: 0.15 * idx }}
                    className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-sm overflow-hidden ${idx === 0 ? "bg-gradient-to-br from-blue-400 to-blue-600" : idx === 1 ? "bg-gradient-to-br from-green-400 to-green-600" : idx === 2 ? "bg-gradient-to-br from-purple-400 to-purple-600" : "bg-gradient-to-br from-orange-400 to-orange-600"}`}
                  >
                    <Image
                      src={src}
                      alt="Client avatar"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )) }
              </div>

              {/* Trust text */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-start md:text-left"
              >
                <p className="text-sm text-gray-600 font-medium">Trusted by</p>
                <p className="text-lg md:text-xl font-semibold text-gray-900">8000+ Clients</p>
              </motion.div>
            </motion.div>

            {/* Vertical divider - hidden on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="hidden md:block w-px h-16 bg-gray-300"
            />

            {/* Right side - Company logos */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.08 }
                }
              }}
              className="w-full md:w-auto flex flex-wrap justify-start md:justify-start gap-1 md:gap-6 lg:gap-1"
            >
              { [
                {
                  src: "https://upload.wikimedia.org/wikipedia/id/a/a8/BADAN_POM.png",
                  alt: "BADAN POM"
                },
                {
                  src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Logo_Kementerian_Kesehatan_Republik_Indonesia_%282024_rev%29.svg/1200px-Logo_Kementerian_Kesehatan_Republik_Indonesia_%282024_rev%29.svg.png",
                  alt: "Kementrian Kesehatan RI"
                },
                {
                  src: "https://upload.wikimedia.org/wikipedia/commons/6/65/Logo_Kementerian_Komunikasi_dan_Digital_Republik_Indonesia_%282024%29.svg",
                  alt: "Komdigi"
                },
                {
                  src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Insignia_of_the_Indonesian_National_Police.svg/1200px-Insignia_of_the_Indonesian_National_Police.svg.png",
                  alt: "Polri"
                },
                {
                  src: "https://upload.wikimedia.org/wikipedia/id/thumb/c/c3/Kimia_Farma_logo.svg/1200px-Kimia_Farma_logo.svg.png",
                  alt: "Kimia Farma"
                },
                {
                  src: "https://upload.wikimedia.org/wikipedia/id/thumb/3/39/Logo_Halodoc.png/1200px-Logo_Halodoc.png",
                  alt: "Halodoc"
                },
                {
                  src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Kalbe_Farma.svg/640px-Kalbe_Farma.svg.png",
                  alt: "Kalbe Farma"
                },
                {
                  src: "https://upload.wikimedia.org/wikipedia/en/7/7a/KOMPAS_TV_%282017%29.png",
                  alt: "Kompas TV"
                },
                {
                  src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/CNN_Indonesia_logo_%282023%29.svg/1200px-CNN_Indonesia_logo_%282023%29.svg.png",
                  alt: "CNN Indonesia"
                }
              ].map((logo, idx) => (
                <motion.div
                  key={logo.alt}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.1 * idx }}
                  className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-xl bg-white border border-gray-200"
                  style={{ minWidth: "5rem" }}
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={56}
                    height={56}
                    className="object-contain w-14 h-14"
                  />
                </motion.div>
              )) }
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}