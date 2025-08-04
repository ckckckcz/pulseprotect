import Link from "next/link"
import { useAuth } from "@/context/auth-context"

export default function Header() {
  const { user, loading } = useAuth()
  
  // Show user immediately if available, don't wait for loading to complete
  const showUser = user && user.id

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="text-2xl font-bold text-teal-600">
            <Link href="/">pulseprotect</Link>
          </div>

          {/* Navigation Links - Only show if not loading */}
          {!loading && (
            <nav className="hidden md:flex space-x-10">
              <Link href="/" className="text-gray-600 hover:text-teal-600 transition-colors duration-200">
                Beranda
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-teal-600 transition-colors duration-200">
                Tentang Kami
              </Link>
              <Link href="/services" className="text-gray-600 hover:text-teal-600 transition-colors duration-200">
                Layanan
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-teal-600 transition-colors duration-200">
                Kontak
              </Link>
            </nav>
          )}

          {/* User section - show loading skeleton or user info */}
          <div className="flex items-center space-x-4">
            {loading ? (
              // Skeleton placeholder
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="w-32 h-4 rounded bg-gray-200 animate-pulse"></div>
              </div>
            ) : showUser ? (
              // User profile section
              <div className="flex items-center space-x-2">
                <img 
                  src={user.foto_profile || '/default-avatar.png'} 
                  alt={user.nama_lengkap}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-gray-800 font-medium">{user.nama_lengkap}</span>
              </div>
            ) : (
              // Auth links for guests
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-600 hover:text-teal-600 transition-colors duration-200">
                  Masuk
                </Link>
                <Link href="/register" className="text-gray-600 hover:text-teal-600 transition-colors duration-200">
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}