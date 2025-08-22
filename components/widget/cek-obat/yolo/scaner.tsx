"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Camera, X, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VerificationResponse } from "@/types/yolo"

interface CameraCaptureProps {
  onClose: () => void
  onDetected: (data: VerificationResponse) => Promise<void>
}

export default function YOLOScanner({ onClose, onDetected }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<string>("Menginisialisasi kamera...")
  const [result, setResult] = useState<VerificationResponse | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string
  const API_KEY = process.env.NEXT_PUBLIC_YOLO_KEY as string

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: "environment" },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setStatus("Kamera siap. Ambil foto...")
        }
      } catch (err) {
        console.error("Camera init error:", err)
        setStatus("Gagal mengakses kamera. Pastikan izin kamera diberikan.")
      }
    }
    initCamera()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  const sendImage = async (imageBase64: string) => {
    try {
      setStatus("Mengirim gambar ke server...")
      console.log("Sending image to", `${API_BASE_URL}/v1/verify-photo`)

      // Convert base64 to blob
      const byteString = atob(imageBase64.split(',')[1])
      const mimeString = imageBase64.split(',')[0].split(':')[1].split(';')[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      const blob = new Blob([ab], { type: mimeString })

      const form = new FormData()
      form.append("img", blob, "captured_image.jpg")

      const response = await fetch(`${API_BASE_URL}/v1/verify-photo`, {
        method: "POST",
        headers: {
          "X-Api-Key": API_KEY,
          "ngrok-skip-browser-warning": "true",
        },
        body: form,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Received response:", data)

      // Map response ke format VerificationResponse
      const mappedData: VerificationResponse = {
        status: data.data?.status || "unknown",
        source: data.data?.source || "camera",
        confidence: data.confidence || 0,
        explanation: data.message || "No explanation provided",
        data: {
          product: {
            nie: data.data?.product?.nie || null,
            name: data.data?.product?.name || null,
            manufacturer: data.data?.product?.manufacturer || null,
            dosage_form: data.data?.product?.dosage_form || null,
            strength: data.data?.product?.strength || null,
            category: data.data?.product?.category || null,
            composition: data.data?.product?.composition || null,
            updated_at: data.data?.product?.updated_at || null,
            status: data.data?.product ? "valid" : "invalid", 
          },
        },
      }

      setResult(mappedData)
      setStatus("Verifikasi selesai!")
      await onDetected(mappedData)
    } catch (e: any) {
      console.error("Send image error:", e)
      setStatus(`Gagal mengirim gambar: ${e?.message || e}`)
    }
  }

  const captureFrame = async () => {
    const video = videoRef.current, canvas = canvasRef.current
    if (!video || !canvas) return
    setIsLoading(true)
    setStatus("Memproses gambar...")
    try {
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Gagal mendapatkan context canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)
      const base64 = canvas.toDataURL("image/jpeg", 0.9)
      setCapturedImage(base64)
      await sendImage(base64)
    } catch (err) {
      console.error("Frame capture error:", err)
      setStatus("Gagal memproses gambar. Coba lagi...")
    } finally {
      setIsLoading(false)
    }
  }

  const pct = (n?: number) => typeof n === "number" ? `${(n * 100).toFixed(1)}%` : "-"
  const prod = result?.data?.product

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
    >
      <div className="w-full max-w-4xl mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Camera Capture</h3>
              <p className="text-teal-100 text-sm">Ambil foto untuk verifikasi label</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="relative bg-black rounded-xl overflow-hidden mb-4">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-96 object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-black/70 rounded-lg px-4 py-2 text-white text-sm flex items-center gap-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                  capturedImage ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                    <AlertCircle className="w-4 h-4 text-yellow-400" />}
                <span>{status}</span>
              </div>
            </div>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-xl p-4 mb-4"
            >
              <h4 className="font-semibold mb-2">Hasil Verifikasi</h4>
              <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                <div><span className="text-gray-500">Status:</span> <b>{prod?.status || "-"}</b></div>
                <div><span className="text-gray-500">Confidence:</span> <b>{pct(result.confidence)}</b></div>
                <div><span className="text-gray-500">Nama Produk:</span> <b>{prod?.name || "-"}</b></div>
                <div><span className="text-gray-500">NIE:</span> <b>{prod?.nie || "-"}</b></div>
                <div><span className="text-gray-500">Pabrik:</span> <b>{prod?.manufacturer || "-"}</b></div>
                <div><span className="text-gray-500">Kategori:</span> <b>{prod?.category || "-"}</b></div>
                <div><span className="text-gray-500">Terakhir Diperbarui:</span> <b>{prod?.updated_at || "-"}</b></div>
              </div>
              {result.explanation && (
                <p className="mt-3 text-sm text-gray-700">
                  <span className="font-medium">Penjelasan:</span> {result.explanation}
                </p>
              )}
            </motion.div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={captureFrame}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r rounded-xl from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Memproses...</>
              ) : (
                <><Camera className="w-4 h-4 mr-2" />Ambil Foto</>
              )}
            </Button>
            <Button onClick={onClose} variant="outline" className="px-6 rounded-xl">Batal</Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}