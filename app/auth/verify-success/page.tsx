"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VerifySuccessPage() {
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
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Email Berhasil Diverifikasi!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Selamat! Email Anda telah berhasil diverifikasi. Sekarang Anda dapat masuk ke akun SmartCity Anda.
          </p>
          
          <Link href="/login">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-medium">
              Masuk ke Akun
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
