"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { authService } from "@/lib/auth"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token verifikasi tidak ditemukan')
      return
    }

    const verifyEmail = async () => {
      try {
        const result = await authService.verifyEmail(token)
        setStatus('success')
        setMessage('Email berhasil diverifikasi!')
        setUserInfo(result.user)
      } catch (error: any) {
        setStatus('error')
        setMessage(error.message || 'Gagal memverifikasi email')
      }
    }

    verifyEmail()
  }, [token])

  if (status === 'loading') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Memverifikasi Email...
        </h1>
        
        <p className="text-gray-600">
          Mohon tunggu, sedang memverifikasi email Anda.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className={`w-16 h-16 ${status === 'success' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-6`}
      >
        {status === 'success' ? (
          <CheckCircle className="w-8 h-8 text-green-600" />
        ) : (
          <XCircle className="w-8 h-8 text-red-600" />
        )}
      </motion.div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        {status === 'success' ? 'Email Berhasil Diverifikasi!' : 'Verifikasi Gagal'}
      </h1>
      
      <p className="text-gray-600 mb-8">
        {message}
      </p>

      {userInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Selamat datang, <strong>{userInfo.nama_lengkap}</strong>!
          </p>
        </div>
      )}
      
      <div className="space-y-3">
        {status === 'success' ? (
          <Link href="/login">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-medium">
              Masuk ke Akun
            </Button>
          </Link>
        ) : (
          <>
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
          </>
        )}
      </div>
    </motion.div>
  )
}

function LoadingFallback() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Memuat...
      </h1>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto">
        <Suspense fallback={<LoadingFallback />}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
}
