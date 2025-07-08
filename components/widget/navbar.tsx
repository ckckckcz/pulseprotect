import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto py-2">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Enhanced */}
          <motion.div className="flex items-center cursor-pointer" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 bg-white rounded-lg"></div>
              </div>
              <span className="text-2xl font-bold text-gray-900">Bakekok</span>
            </div>
          </motion.div>

          {/* Desktop Navigation - Enhanced */}
          <div className="hidden lg:flex items-center space-x-8">
            {[
              { name: "Solusi", hasDropdown: true },
              { name: "Pelanggan", hasDropdown: true },
              { name: "Harga", hasDropdown: false, href: "/pricing" },
              { name: "Blog", hasDropdown: false, href: "/blog" },
            ].map((item, index) => (
              <div key={index} className="relative group">
                {item.hasDropdown ? (
                  <Button className="flex items-center text-md rounded-xl bg-white hover:bg-white space-x-1 text-gray-700 hover:text-teal-600 transition-all duration-300 font-medium group">
                    <span>{item.name}</span>
                    <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                  </Button>
                ) : (
                  <Link href={item.href || "#"} className="text-gray-700 hover:text-teal-600 transition-all duration-300 font-medium relative">
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right side Buttons - Enhanced */}
          <div className="flex items-center space-x-4">
            <Link href={"/login"}>
              <Button className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 lg:block hidden ">Masuk</Button>
            </Link>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 lg:block hidden  shadow-lg hover:shadow-xl">Daftar</Button>
            {/* Mobile menu Button */}
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-gray-700 hover:text-teal-600 transition-colors rounded-lg hover:bg-gray-100">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Enhanced */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl"
          >
            <div className="px-4 py-6 space-y-4">
              {["Solusi", "Pelanggan", "Harga", "Blog", "Masuk"].map((item, index) => (
                <Link key={index} href="#" className="block text-gray-700 hover:text-teal-600 transition-colors duration-300 font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                  {item}
                </Link>
              ))}
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-full transition-all duration-300 mt-4" onClick={() => setIsMenuOpen(false)}>
                Mulai Sekarang
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
