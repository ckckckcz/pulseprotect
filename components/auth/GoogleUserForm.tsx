"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RefreshCw, Save, Loader2, User, Info, BadgeInfo } from "lucide-react";

interface GoogleUserFormProps {
  googleUserInfo: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    verified_email: boolean;
  };
  onSubmit: (data: { fullName: string; phone: string }) => void;
  isLoading: boolean;
  error: string;
}

export default function GoogleUserForm({ googleUserInfo, onSubmit, isLoading, error }: GoogleUserFormProps) {
  const [fullName, setFullName] = useState(googleUserInfo.name || "");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("");
  const [isAvatarChanged, setIsAvatarChanged] = useState(false);

  // Avatar seeds yang sama seperti di profile
  const avatarSeeds = ["Adrian", "Sadie", "Nolan", "Ryan", "Aiden", "Andrea", "Aidan", "Wyatt", "Ryker", "Alexander", "Brian", "Amaya", "Avery", "Easton", "Destiny", "Christopher", "Sara", "Vivian", "Mackenzie"];

  const generateAvatarUrl = () => {
    const seed = avatarSeeds[Math.floor(Math.random() * avatarSeeds.length)];
    setAvatarSeed(seed);
    return `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(seed)}`;
  };

  useEffect(() => {
    if (googleUserInfo.picture) {
      setAvatarUrl(googleUserInfo.picture);
      setIsAvatarChanged(false);
    } else {
      const url = generateAvatarUrl();
      setAvatarUrl(url);
      setIsAvatarChanged(true);
    }
  }, [googleUserInfo.picture]);

  const handleRandomAvatar = () => {
    const url = generateAvatarUrl();
    setAvatarUrl(url);
    setIsAvatarChanged(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    onSubmit({
      fullName: fullName.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lengkapi Profile Anda</h2>
        <p className="text-gray-600">Selamat datang! Silakan lengkapi informasi profil Anda</p>
      </div>

      {/* <div className="flex flex-col items-start gap-4">
        <Avatar className="h-20 w-20 rounded-full border-4 border-teal-600 shadow-lg">
          <AvatarImage src={avatarUrl} alt={fullName || "User"} />
          <AvatarFallback className="bg-teal-600 text-white">{getInitials(fullName || googleUserInfo.name)}</AvatarFallback>
        </Avatar>

        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" className="rounded-xl flex items-center gap-2 bg-white text-black hover:text-black border border-gray-300 hover:bg-gray-50" onClick={handleRandomAvatar} disabled={isLoading}>
            <RefreshCw className="w-4 h-4" />
            Ganti Avatar
          </Button>
        </div>

        {avatarSeed && (
          <div className="text-xs text-gray-500 text-start">
            {isAvatarChanged && <div className="text-teal-600 font-semibold mt-1">Avatar baru akan disimpan saat mendaftar</div>}
          </div>
        )}
      </div> */}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </motion.div>
        )}

        {/* Google Email (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Google</label>
          <div className="flex items-center gap-3 h-12 bg-teal-100 border border-teal-200 text-teal-600 rounded-xl px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className="h-5 w-5 fill-teal-600" viewBox="0 0 50 50">
              <path d="M 25.996094 48 C 13.3125 48 2.992188 37.683594 2.992188 25 C 2.992188 12.316406 13.3125 2 25.996094 2 C 31.742188 2 37.242188 4.128906 41.488281 7.996094 L 42.261719 8.703125 L 34.675781 16.289063 L 33.972656 15.6875 C 31.746094 13.78125 28.914063 12.730469 25.996094 12.730469 C 19.230469 12.730469 13.722656 18.234375 13.722656 25 C 13.722656 31.765625 19.230469 37.269531 25.996094 37.269531 C 30.875 37.269531 34.730469 34.777344 36.546875 30.53125 L 24.996094 30.53125 L 24.996094 20.175781 L 47.546875 20.207031 L 47.714844 21 C 48.890625 26.582031 47.949219 34.792969 43.183594 40.667969 C 39.238281 45.53125 33.457031 48 25.996094 48 Z"></path>
            </svg>
            <span className="text-sm text-teal-600 font-bold">{googleUserInfo.email}</span>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-white border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Masukkan nama lengkap Anda"
            required
            disabled={isLoading}
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nomor Telepon <span className="text-gray-400 text-xs">(Opsional)</span>
          </label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-white border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Contoh: +6281234567890"
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isLoading || !fullName.trim()} className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-medium transition-all duration-200">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin rounded-full h-5 w-5 mr-2" />
              Membuat Akun...
            </div>
          ) : (
            "Buat Akun"
          )}
        </Button>
      </form>

      {/* Info Box */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
        <div className="text-sm text-teal-600">
          <div className="font-medium mb-1 flex items-center justify-start gap-2">
            <BadgeInfo className="w-4 h-4" />
            <span>Informasi:</span>
          </div>
          <div>• Nama lengkap wajib diisi untuk membuat akun</div>
          <div>• Nomor telepon bersifat opsional</div>
          <div>• Avatar akan otomatis disimpan ke profil Anda</div>
        </div>
      </div>
    </motion.div>
  );
}
