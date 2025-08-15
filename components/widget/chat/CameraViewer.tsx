"use client";
import React, { useEffect, useRef, useState } from "react";

const CameraViewer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const startCamera = async () => {
      setError("");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        setError(
          err?.name === "NotAllowedError"
            ? "Akses kamera ditolak."
            : err?.name === "NotFoundError"
            ? "Tidak ada perangkat kamera yang ditemukan."
            : "Gagal mengakses kamera."
        );
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg w-full max-w-xs aspect-video bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      {error && (
        <div className="mt-3 text-sm text-red-600 text-center">{error}</div>
      )}
    </div>
  );
};

export default CameraViewer;
