"use client";
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Base URL for FastAPI
  // const API_BASE_URL = "http://127.0.0.1:8000";
  const API_BASE_URL = "https://blowfish-willing-ghost.ngrok-free.app"; // For ngrok

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setStatus(""); // Reset status
    }
  };

  // Check connection to FastAPI
  const checkConnection = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/ping`, {
        method: "GET",
        headers: {
          ...(API_BASE_URL.includes("ngrok") && { "ngrok-skip-browser-warning": "true" }),
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setStatus(data.message);
    } catch (err) {
      console.error("Error connecting to server:", err);
      if (err instanceof Error) {
        setStatus(`Gagal konek ke server: ${err.message}`);
      } else {
        setStatus("Gagal konek ke server: Unknown error");
      }
    }
  };

  // Send image to FastAPI
  const sendImage = async () => {
    if (!file) {
      setStatus("Pilih file gambar terlebih dahulu!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/receive-image`, {
        method: "POST",
        body: formData, // browser otomatis set Content-Type + boundary
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();

      if (data.status === "success") {
        setStatus(
          `${data.message}: ${data.image_details.original_filename} (${data.image_details.format}, ${data.image_details.size[0]}x${data.image_details.size[1]})`
        );
      } else {
        setStatus(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error("Error sending image:", err);
      if (err instanceof Error) {
        setStatus(`Gagal mengirim gambar: ${err.message}`);
      } else {
        setStatus("Gagal mengirim gambar: Unknown error");
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Uji Pengiriman Gambar</h1>

      {/* Button to check connection */}
      <button
        onClick={checkConnection}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Cek Koneksi Server
      </button>

      {/* File input for image */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      {/* Button to send image */}
      <button
        onClick={sendImage}
        disabled={!file} // Disable button if no file is selected
        className={`px-4 py-2 rounded mb-4 text-white ${file ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"
          }`}
      >
        Kirim Gambar
      </button>

      {/* Display status */}
      <p className="mt-4">{status}</p>
    </div>
  );
}