import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
export default function Footer() {
  const partners = [
    { name: "WHO", logo: "/placeholder.svg?height=40&width=120" },
    { name: "FDA", logo: "/placeholder.svg?height=40&width=120" },
    { name: "Pfizer", logo: "/placeholder.svg?height=40&width=120" },
    { name: "Johnson & Johnson", logo: "/placeholder.svg?height=40&width=120" },
    { name: "Novartis", logo: "/placeholder.svg?height=40&width=120" },
    { name: "Roche", logo: "/placeholder.svg?height=40&width=120" },
    { name: "Merck", logo: "/placeholder.svg?height=40&width=120" },
  ];
  return (
    <footer className="py-16 sm:py-20 bg-white text-gray-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/30 rounded-full blur-3xl translate-x-40 translate-y-40"></div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 bg-white rounded-lg"></div>
              </div>
              <span className="text-3xl font-bold">Bakekok</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed text-lg">Platform deteksi obat palsu untuk melindungi kesehatan masyarakat Indonesia dengan teknologi AI terdepan dan database resmi BPOM.</p>
            <div className="flex space-x-4">
              {/* Social media icons */}
              <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300 cursor-pointer">
                <Globe className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300 cursor-pointer">
                <Mail className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300 cursor-pointer">
                <Phone className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-teal-600">Tautan Cepat</h3>
            <ul className="space-y-4">
              {[
                { name: "Tentang Kami", href: "/about" },
                { name: "Cara Kerja", href: "/how-it-works" },
                { name: "Kontak", href: "/contact" },
                { name: "Feedback", href: "/feedback" },
                { name: "Blog", href: "/blog" },
              ].map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-teal-600 transition-colors duration-300 flex items-center group">
                    {/* <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-teal-600">Sumber Daya</h3>
            <ul className="space-y-4">
              {[
                { name: "Kebijakan Privasi", href: "/privacy" },
                { name: "Syarat & Ketentuan", href: "/terms" },
                { name: "FAQ", href: "/faq" },
                { name: "API Documentation", href: "/api" },
                { name: "Panduan Pengguna", href: "/guide" },
              ].map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-teal-600 transition-colors duration-300 flex items-center group">
                    {/* <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-teal-600">Tim Pengembang</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-teal-600 mr-3" />
                <a href="mailto:mechaminds.contact@gmail.com" className="text-gray-400 hover:text-teal-600 transition-colors">
                  mechaminds.contact@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-teal-600 mr-3" />
                <span className="text-gray-400">+62 21 7863 8888</span>
              </div>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mt-6">
                <p className="text-sm text-gray-400 mb-2">Versi Platform:</p>
                <p className="text-teal-600 font-semibold">v1.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Partners section */}
        {/* <div className="border-t border-gray-200 pt-12 mb-12">
          <h3 className="text-xl font-bold text-center mb-8 text-teal-600">Stakeholder Terkait</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {partners.map((partner, index) => (
              <div key={index} className="bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors duration-300">
                <img src={partner.logo || "/placeholder.svg"} alt={partner.name} className="h-8 opacity-70 hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div> */}

        {/* Bottom section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left">
              <p className="text-gray-400 text-lg">&copy; 2025 MechaMinds. Dibuat dengan 💚 untuk melindungi kesehatan masyarakat Indonesia.</p>
              <p className="text-gray-300 text-sm mt-1">Platform ini merupakan karya mahasiswa Politeknik Negeri Malang untuk kepentingan sosial.</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-green-400">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-5 h-5 bg-green-200 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute w-4 h-4 bg-green-300 rounded-full animate-pulse"></div>
                  <div className="relative w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">Server Online</span>
              </div>
              <div className="text-gray-400 text-sm">Uptime: 99.9%</div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
