"use client"

import { useEffect, useRef, useState } from "react"
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser"
import { NotFoundException } from "@zxing/library"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Camera, AlertCircle, Loader2 } from "lucide-react"

export default function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (result: string) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const scannerControlsRef = useRef<IScannerControls | null>(null)

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()
    let active = true

    const startScanning = async () => {
      try {
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices()

        if (videoInputDevices.length === 0) {
          setError("No camera found on this device")
          setIsLoading(false)
          return
        }

        // Prefer back camera on mobile devices
        const preferredDevice =
          videoInputDevices.find(
            (device) => device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("rear"),
          ) || videoInputDevices[0]

        await codeReader.decodeFromVideoDevice(preferredDevice.deviceId, videoRef.current!, (result, err, controls) => {
          if (controls && !scannerControlsRef.current) {
            scannerControlsRef.current = controls
            setIsLoading(false)
          }

          if (result && active) {
            onDetected(result.getText())
            active = false
            scannerControlsRef.current?.stop()
          }

          if (err && !(err instanceof NotFoundException)) {
            console.warn("Scanning error:", err)
          }
        })
      } catch (err) {
        console.error("Camera access error:", err)
        setError("Camera access denied. Please allow camera permissions and try again.")
        setIsLoading(false)
      }
    }

    startScanning()

    return () => {
      scannerControlsRef.current?.stop()
      active = false
    }
  }, [onDetected])

  const handleClose = () => {
    scannerControlsRef.current?.stop()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-xl mx-auto bg-white rounded-xl dark:bg-slate-800 border-0 shadow-2xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between text-teal-600 mb-6">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Barcode Scanner</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 text-black hover:bg-gray-200 hover:text-black rounded-xl"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Scanner Area */}
          <div className="relative">
            <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Starting camera...</p>
                  </div>
                </div>
              )}

              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

              {/* Enhanced Scanning Overlay with Multiple Animations */}
              {!isLoading && !error && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Animated corner brackets */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-teal-600 rounded-tl-xl animate-pulse"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-teal-600 rounded-tr-xl animate-pulse"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-teal-600 rounded-bl-xl animate-pulse"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-teal-600 rounded-br-xl animate-pulse"></div>

                  {/* Center scanning frame with glow effect */}
                  <div className="absolute inset-8 border-2 border-teal-600/40 rounded-xl shadow-lg shadow-teal-600/20"></div>

                  {/* Inner scanning frame */}
                  <div className="absolute inset-12 border border-teal-600/20 rounded-md"></div>

                  {/* Main animated scanning line that moves up and down */}
                  <div className="absolute inset-x-8 top-8 bottom-8 overflow-hidden">
                    <div className="scanning-line absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-600 via-teal-600 to-transparent shadow-lg shadow-teal-600/50 rounded-full"></div>
                  </div>

                  {/* Secondary scanning line with different timing */}
                  <div className="absolute inset-x-12 top-12 bottom-12 overflow-hidden">
                    <div
                      className="scanning-line absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 via-blue-400 to-transparent opacity-60 rounded-full"
                      style={{ animationDelay: "1s" }}
                    ></div>
                  </div>

                  {/* Pulsing center crosshair */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 border-2 border-white rounded-full scanner-pulse"></div>
                    {/* <div className="absolute top-[10px] left-[10px] transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-ping"></div> */}
                  </div>

                  {/* Scanning status indicator */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center space-x-1 bg-white backdrop-blur-sm rounded-full px-3 py-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-teal-600">Scanning...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error State */}
            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center">
            <p className="text-sm text-teal-600 dark:text-slate-400 mb-4">
              Position the barcode or QR code within the frame to scan
            </p>

            <Button onClick={handleClose} variant="outline" className="w-full bg-transparent border border-gray-200 text-black rounded-xl hover:bg-teal-600 hover:text-white cursor-pointer">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
