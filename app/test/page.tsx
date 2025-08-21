"use client";
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("");

  const checkConnection = async () => {
    try {
      const res = await fetch("https://cc85e8d44c05.ngrok-free.app/ping", {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setStatus(data.message);
    } catch (err) {
      console.error("Error connecting to server:", err);
    //   setStatus(`Gagal konek ke server ngrok: ${err.message}`);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={checkConnection}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Cek Koneksi Server (Ngrok)
      </button>
      <p className="mt-4">{status}</p>
    </div>
  );
}