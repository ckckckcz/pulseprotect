"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"

export default function VerifyErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Terjadi kesalahan saat verifikasi email'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <XCircle className="w-8 h-8 text-red-600" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Verifikasi Gagal
          </h1>
          
          <p className="text-gray-600 mb-8">
            {message}
          </p>
          
          <div className="space-y-3">
            <Link href="/register">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-medium">
                Daftar Ulang
              </Button>
            </Link>
            
            <Link href="/login">
              <Button variant="outline" className="w-full py-3 rounded-xl font-medium">
                Kembali ke Login
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
