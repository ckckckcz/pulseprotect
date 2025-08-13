"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Mail, Shield, Save, User, Key, CreditCard, FileText, Code, Loader2, ChevronDown, Info, RefreshCw, Sun, Moon, MessageCircle, Bolt, LogOut, Globe2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { authService } from "@/lib/auth";
import { jwtService } from "@/lib/jwt-service"; // Add this import for jwtService
import { toast } from "sonner";
import Navbar from "@/components/widget/navbar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Define UserData type locally since it's not exported from auth-context
interface UserData {
  id?: string | number;
  nama_lengkap?: string;
  email?: string;
  [key: string]: any; // Allow for other properties that might be accessed
}
// Define a type for the user with status
type UserWithStatus = UserData & {
  id?: string | number;
  nama_lengkap?: string;
  email?: string;
  nomor_telepon?: string;
  role?: string;
  created_at?: string;
  foto_profile?: string;
  status?: string;
  verifikasi_email?: boolean;
  email_confirmed_at?: string | null;
};

// Define country type
type Country = {
  name: string;
  dial_code: string;
  code: string;
};

// Add new type definitions for payment intent
type PaymentIntent = {
  id: number;
  email: string;
  order_id: string;
  package_id: string;
  package_name: string;
  period: "monthly" | "yearly";
  amount: number;
  status: string;
  created_at: string;
  updated_at: string | null;
};

export default function UserProfile() {
  const [activeSetting, setActiveSetting] = useState("general");
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Form fields
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);

  // Add search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; label: string; matches: string[] }[]>([]);

  // Form states
  const [isUpdating, setIsUpdating] = useState(false);
  const [formErrors, setFormErrors] = useState({
    nama_lengkap: "",
    nomor_telepon: "",
  });
  const [formChanged, setFormChanged] = useState(false);

  // Add state for payments
  const [payments, setPayments] = useState<PaymentIntent[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarId, setAvatarId] = useState<number | null>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isAvatarChanged, setIsAvatarChanged] = useState(false);

  // Language and theme state
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [feedback, setFeedback] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // Ganti daftar seed sesuai permintaan user
  const avatarSeeds = ["Adrian", "Sadie", "Nolan", "Ryan", "Aiden", "Andrea", "Aidan", "Wyatt", "Ryker", "Alexander", "Brian", "Amaya", "Avery", "Easton", "Destiny", "Christopher", "Sara", "Vivian", "Mackenzie"];

  // Tambahkan state untuk seed avatar
  const [avatarSeed, setAvatarSeed] = useState<string>("");

  // Fetch countries data
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/countries");
        if (!response.ok) throw new Error("Failed to fetch countries");
        const data = await response.json();

        // Log the total number of countries loaded
        // console.log(`Loaded ${data.length} countries`);

        // Check if Indonesia exists in the data
        const indonesia = data.find((country: Country) => country.name === "Indonesia" || country.code === "ID");

        if (indonesia) {
          // console.log("Indonesia found in country data:", indonesia);
        } else {
          console.warn("Indonesia not found in country data");
        }

        setCountries(data);

        // Set Indonesia as default if available
        if (indonesia) {
          setSelectedCountry(indonesia);
        } else if (data.length > 0) {
          setSelectedCountry(data[0]);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push("/login");
    }

    // Initialize form values from user data
    if (user) {
      setDisplayName(user.nama_lengkap || "");

      // Parse phone number if exists
      if ((user as UserWithStatus).nomor_telepon) {
        // console.log("Original phone:", (user as UserWithStatus).nomor_telepon);

        // If countries not yet loaded, use the full number temporarily
        if (countries.length === 0) {
          setPhoneNumber((user as UserWithStatus).nomor_telepon || "");
        } else {
          const phoneWithoutCode = parsePhoneNumber((user as UserWithStatus).nomor_telepon || "");
          // console.log("Parsed phone:", phoneWithoutCode);

          // Use the national number part
          setPhoneNumber(phoneWithoutCode.nationalNumber);

          // If we can identify the country code, set it
          if (phoneWithoutCode.countryCode) {
            const matchedCountry = countries.find((c) => c.dial_code.replace("+", "") === phoneWithoutCode.countryCode);
            if (matchedCountry) {
              // console.log("Matched country:", matchedCountry);
              setSelectedCountry(matchedCountry);
            }
          } else if (selectedCountry === null && countries.length > 0) {
            // If no country code detected but we have a phone number,
            // try to set a default country (Indonesia if available)
            const indonesia = countries.find((c) => c.code === "ID");
            if (indonesia) {
              setSelectedCountry(indonesia);
            }
          }
        }
      }
    }
  }, [user, loading, router, countries]);

  // Helper to parse phone number - improved version
  const parsePhoneNumber = (phoneWithCode: string) => {
    // Default values
    let countryCode = "";
    let nationalNumber = phoneWithCode;

    if (!phoneWithCode) return { countryCode, nationalNumber };

    try {
      if (phoneWithCode.startsWith("+")) {
        // Format: +62812345678
        // Find the country that matches this dial code
        for (const country of countries) {
          if (phoneWithCode.startsWith(country.dial_code)) {
            countryCode = country.dial_code.replace("+", "");
            nationalNumber = phoneWithCode.substring(country.dial_code.length);
            return { countryCode, nationalNumber };
          }
        }
      } else {
        // Format without +: 62812345678
        // Try to identify common country codes (1-4 digits)
        for (let i = 1; i <= 4; i++) {
          const potentialCode = phoneWithCode.substring(0, i);
          const potentialMatch = countries.find((c) => c.dial_code === `+${potentialCode}`);
          if (potentialMatch) {
            countryCode = potentialCode;
            nationalNumber = phoneWithCode.substring(i);
            return { countryCode, nationalNumber };
          }
        }

        // If no country code detected, assume it's already a national number
        // This handles cases where the user entered a number without country code
        return { countryCode: "", nationalNumber: phoneWithCode };
      }
    } catch (error) {
      console.error("Error parsing phone number:", error);
    }

    // Return the whole number as national number if parsing failed
    return { countryCode, nationalNumber };
  };

  // Check if form has changed compared to original user data
  useEffect(() => {
    if (user) {
      // Combine dial code and phone for comparison
      const formattedPhone = selectedCountry ? `${selectedCountry.dial_code}${phoneNumber.replace(/^0+/, "")}` : phoneNumber;

      const userPhone = (user as UserWithStatus).nomor_telepon || "";

      // Compare normalized phone numbers (remove spaces, dashes, etc.)
      const normalizedFormPhone = formattedPhone.replace(/[\s-]/g, "");
      const normalizedUserPhone = userPhone.replace(/[\s-]/g, "");

      const hasChanged = displayName !== user.nama_lengkap || normalizedFormPhone !== normalizedUserPhone;

      setFormChanged(hasChanged);
    }
  }, [displayName, phoneNumber, selectedCountry, user]);

  // Get user initials for the avatar fallback
  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get flag emoji from country code
  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  // Add state for country search query
  const [countrySearchQuery, setCountrySearchQuery] = useState("");

  // Improved filter countries function
  const filteredCountries = useMemo(() => {
    // If no search query, return all countries
    if (!countrySearchQuery.trim()) {
      return countries;
    }

    const normalizedQuery = countrySearchQuery.toLowerCase().trim();

    return countries.filter((country) => {
      // Check if any of these fields contains the search query
      return country.name.toLowerCase().includes(normalizedQuery) || country.dial_code.toLowerCase().includes(normalizedQuery) || country.code.toLowerCase().includes(normalizedQuery);
    });
  }, [countries, countrySearchQuery]);

  // Handle form submit - updates both name and phone number
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("ID pengguna tidak valid");
      return;
    }

    // Validate form
    let hasErrors = false;
    const errors = {
      nama_lengkap: "",
      nomor_telepon: "",
    };

    // Validate name
    if (!displayName.trim()) {
      errors.nama_lengkap = "Nama lengkap tidak boleh kosong";
      hasErrors = true;
    }

    // Validate phone number format (if provided)
    if (phoneNumber) {
      const phoneRegex = /^[0-9\s-]{8,15}$/;
      if (!phoneRegex.test(phoneNumber)) {
        errors.nomor_telepon = "Format nomor telepon tidak valid";
        hasErrors = true;
      }
    }

    setFormErrors(errors);

    if (hasErrors) return;

    setIsUpdating(true);

    // Format the phone number with country code
    let formattedPhone = phoneNumber;
    if (phoneNumber) {
      if (selectedCountry) {
        // Check if the phone number already has the country code
        if (phoneNumber.startsWith(selectedCountry.dial_code)) {
          formattedPhone = phoneNumber;
        } else if (phoneNumber.startsWith("0")) {
          // Replace leading zero with country code
          formattedPhone = `${selectedCountry.dial_code}${phoneNumber.substring(1)}`;
        } else {
          // Just add the country code
          formattedPhone = `${selectedCountry.dial_code}${phoneNumber}`;
        }
      }

      // console.log("Formatted phone to save:", formattedPhone);
    }

    try {
      // Ensure user.id is converted to a number
      const userId = typeof user.id === "string" ? parseInt(user.id, 10) : user.id;

      // Make sure userId is valid after conversion
      if (isNaN(Number(userId))) {
        throw new Error("ID pengguna tidak valid");
      }

      // Update user profile
      const result = await authService.updateUser(Number(userId), {
        nama_lengkap: displayName.trim(),
        nomor_telepon: formattedPhone.trim() || undefined,
        foto_profile: avatarUrl,
      });

      if (!result.success) {
        toast.error("Gagal memperbarui profil: " + (result.error || "Unknown error"));
        return;
      }

      // Refresh user data only if update was successful
      try {
        const refreshed = await refreshUser();
        if (!refreshed) {
          toast.error("Gagal mengambil data user terbaru. Silakan reload halaman.");
        }
      } catch (err) {
        console.error("Error in refreshUser after profile update:", err);
        toast.error("Terjadi error saat refresh user. Silakan reload halaman.");
      }

      toast.success("Profil berhasil diperbarui");
      setFormChanged(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Gagal memperbarui profil: " + (error.message || "Unknown error"));
    } finally {
      setIsUpdating(false);
    }
  };

  // Add function to fetch user payments with JWT auth
  const fetchUserPayments = async () => {
    if (!user?.email) return;

    setLoadingPayments(true);
    try {
      // Get JWT token if available
      const token = jwtService.getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Use JWT auth if available, otherwise include email as query parameter as well
      const baseEndpoint = `/api/payments/user-intents`;
      const endpoint = `${baseEndpoint}?email=${encodeURIComponent(user.email)}`;

      const response = await fetch(endpoint, { headers });

      if (!response.ok) {
        throw new Error("Failed to fetch payment data");
      }

      const result = await response.json();

      // Process and set payments data
      if (result.data && Array.isArray(result.data)) {
        setPayments(result.data);
        // console.log(`Loaded ${result.data.length} payment records from payment_intent table`);
      } else {
        console.warn("Unexpected payment data format:", result);
        setPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
      toast.error("Gagal memuat data transaksi");
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Fetch payments when billing tab is selected
  useEffect(() => {
    if (activeSetting === "billing" && user?.email) {
      fetchUserPayments();
    }
  }, [activeSetting, user?.email]);

  // Add formatCurrency helper function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Add function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Update generateAvatarUrl agar pakai DiceBear dan seed
  const generateAvatarUrl = () => {
    // Pilih seed random dari daftar
    const seed = avatarSeeds[Math.floor(Math.random() * avatarSeeds.length)];
    setAvatarSeed(seed);
    return `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(seed)}`;
  };

  // Set initial avatar or from user data
  useEffect(() => {
    if (user?.foto_profile) {
      setAvatarUrl(user.foto_profile);
      // Cek jika url mengandung seed, ambil seed-nya
      const match = user.foto_profile.match(/seed=([^&]+)/);
      setAvatarSeed(match ? decodeURIComponent(match[1]) : "");
      setIsAvatarChanged(false);
    } else {
      const url = generateAvatarUrl();
      setAvatarUrl(url);
      setIsAvatarChanged(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.foto_profile, user?.id]);

  // Handler for dice button (refresh avatar preview only)
  const handleRandomAvatar = () => {
    const url = generateAvatarUrl();
    setAvatarUrl(url);
    setIsAvatarChanged(true);
  };

  // Handler to save avatar to DB (foto_profile column)
  const handleSaveAvatar = async () => {
    if (!user?.id) {
      console.error("User ID is missing or invalid:", user);
      toast.error("ID pengguna tidak valid");
      return;
    }

    if (!avatarUrl) {
      console.error("Avatar URL is missing or invalid:", avatarUrl);
      toast.error("URL avatar tidak valid");
      return;
    }

    setIsSavingAvatar(true);
    try {
      const userId = typeof user.id === "string" ? parseInt(user.id, 10) : user.id;

      if (isNaN(Number(userId))) {
        console.error("Parsed User ID is invalid:", user.id);
        throw new Error("ID pengguna tidak valid");
      }

      console.log("Saving avatar for user ID:", userId, "with URL:", avatarUrl);
      await authService.updateUser(Number(userId), { foto_profile: avatarUrl });
      toast.success("Avatar berhasil disimpan!");
      // Tambahkan error handling di sini:
      try {
        const refreshed = await refreshUser();
        if (!refreshed) {
          toast.error("Gagal mengambil data user terbaru. Silakan reload halaman.");
        }
      } catch (err) {
        console.error("Error in refreshUser after save avatar:", err);
        toast.error("Terjadi error saat refresh user. Silakan reload halaman.");
      }
      setIsAvatarChanged(false);
    } catch (err: any) {
      console.error("Error saving avatar:", err);
      toast.error("Gagal menyimpan avatar: " + (err.message || "Terjadi kesalahan server"));
    } finally {
      setIsSavingAvatar(false);
    }
  };

  // Add search functionality
  const sidebarItems = [
    { id: "general", label: "Umum", icon: User },
    { id: "security", label: "Keamanan", icon: Shield },
    { id: "billing", label: "Transaksi", icon: CreditCard },
    { id: "settings", label: "Pengaturan", icon: Bolt },
  ];

  const searchableContent = {
    general: {
      label: "Umum",
      keywords: ["avatar", "profil", "nama", "telepon", "informasi", "foto", "gambar", "identitas", "data diri"],
    },
    security: {
      label: "Keamanan",
      keywords: ["password", "kata sandi", "autentikasi", "keamanan", "login", "masuk", "verifikasi", "2fa"],
    },
    billing: {
      label: "Transaksi",
      keywords: ["pembayaran", "transaksi", "tagihan", "paket", "langganan", "invoice", "riwayat", "bayar"],
    },
    settings: {
      label: "Pengaturan",
      keywords: ["bahasa", "tema", "tampilan", "feedback", "dukungan", "aplikasi", "konfigurasi", "preferensi"],
    },
  };

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results: { id: string; label: string; matches: string[] }[] = [];
    const searchTerm = query.toLowerCase().trim();

    Object.entries(searchableContent).forEach(([id, content]) => {
      const matches: string[] = [];

      // Check if label matches
      if (content.label.toLowerCase().includes(searchTerm)) {
        matches.push(content.label);
      }

      // Check if any keywords match
      const matchingKeywords = content.keywords.filter((keyword) => keyword.toLowerCase().includes(searchTerm));
      matches.push(...matchingKeywords);

      if (matches.length > 0) {
        results.push({
          id,
          label: content.label,
          matches: [...new Set(matches)], // Remove duplicates
        });
      }
    });

    setSearchResults(results);
  };

  // Handle search result click
  const handleSearchResultClick = (sectionId: string) => {
    setActiveSetting(sectionId);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Defensive: ensure sidebarItems is always an array
  const safeSidebarItems = Array.isArray(sidebarItems) ? sidebarItems : [];

  // Filter sidebar items based on search
  const filteredSidebarItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return safeSidebarItems;
    }

    const searchTerm = searchQuery.toLowerCase();
    return safeSidebarItems.filter((item) => {
      const content = searchableContent[item.id as keyof typeof searchableContent];
      return content.label.toLowerCase().includes(searchTerm) || content.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm));
    });
  }, [searchQuery, safeSidebarItems]);

  // Move this hook up with the others!
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  // Add filtered payments logic
  const filteredPayments = useMemo(() => {
    // Defensive: ensure payments is always an array
    const safePayments = Array.isArray(payments) ? payments : [];
    if (paymentFilter === "all") {
      return safePayments;
    }
    return safePayments.filter((payment) => payment.status === paymentFilter);
  }, [payments, paymentFilter]);

  // Place conditional returns here, after all hooks:
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Let the useEffect redirect handle this
  }

  // Ambil membership_type dari transaksi terakhir yang sukses
  const latestMembershipType = payments.filter((p) => p.status === "success").sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.package_name;

  const handleChangeLanguage = (lang: "id" | "en") => {
    const segments = (pathname || "").split("/");
    segments[1] = lang; // pastikan segmen pertama adalah locale
    const newPath = segments.join("/") || "/";
    router.push(newPath);
  };


  function getStatusBadge(status: string): React.ReactNode {
    const colorClass = getStatusColor(status);
    let label = "";
    switch (status.toLowerCase()) {
      case "success":
        label = "Berhasil";
        break;
      case "pending":
        label = "Menunggu";
        break;
      case "failed":
        label = "Gagal";
        break;
      default:
        label = status.charAt(0).toUpperCase() + status.slice(1);
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>{label}</span>;
  }

  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen bg-white text-black pt-32 mb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Pengaturan Akun</h1>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-72">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input placeholder="Cari pengaturan..." className="pl-10 bg-white border-gray-200 border rounded-xl text-black" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs text-gray-500 mb-2 px-2">Hasil pencarian:</div>
                      {searchResults.map((result) => (
                        <button key={result.id} onClick={() => handleSearchResultClick(result.id)} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="font-medium text-sm">{result.label}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Cocok: {result.matches.slice(0, 3).join(", ")}
                            {result.matches.length > 3 && ` +${result.matches.length - 3} lainnya`}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <nav className="space-y-1">
                {filteredSidebarItems.length > 0 ? (
                  filteredSidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSetting(item.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                        activeSetting === item.id ? "bg-teal-600 hover:bg-teal-700 rounded-xl text-white" : "text-gray-700 rounded-xl hover:bg-gray-100 hover:text-black"
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                      {/* Highlight if this item matches search */}
                      {searchQuery && searchResults.some((r) => r.id === item.id) && <div className="ml-auto w-2 h-2 bg-teal-500 rounded-full"></div>}
                    </button>
                  ))
                ) : searchQuery ? (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">Tidak ditemukan pengaturan yang cocok</p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="text-teal-600 text-sm mt-2 hover:underline"
                    >
                      Hapus pencarian
                    </button>
                  </div>
                ) : (
                  sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSetting(item.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                        activeSetting === item.id ? "bg-teal-600 hover:bg-teal-700 rounded-xl text-white" : "text-gray-700 rounded-xl hover:bg-gray-100 hover:text-black"
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </button>
                  ))
                )}
              </nav>

              {/* Search Tips */}
              {searchQuery && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="text-xs text-blue-700">
                    <div className="font-medium mb-1">Tips pencarian:</div>
                    <div>• Coba kata kunci seperti "avatar", "password", "pembayaran"</div>
                    <div>• Gunakan kata dalam bahasa Indonesia atau Inggris</div>
                  </div>
                </div>
              )}
            </div>

            {/* Main content */}
            <div className="flex-1">
              {/* Add search highlight indicator */}
              {searchQuery && searchResults.some((r) => r.id === activeSetting) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Search className="w-4 h-4" />
                    <span className="text-sm font-medium">Hasil pencarian untuk "{searchQuery}"</span>
                  </div>
                </div>
              )}

              {activeSetting === "general" && (
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-2xl font-semibold">Avatar</h2>
                      <p className="text-gray-400 text-sm mb-6">Klik tombol di bawah untuk mengganti avatar acak, lalu klik lagi untuk menyimpan ke profil Anda.</p>
                      <div className="flex flex-col items-start gap-4">
                        <Avatar className="h-28 w-28 rounded-full border-4 border-teal-600 shadow-lg">
                          <AvatarImage src={avatarUrl} alt={user.nama_lengkap || "User"} />
                          <AvatarFallback className="bg-teal-600 text-white">{getInitials(user.nama_lengkap)}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={isAvatarChanged ? "default" : "outline"}
                            className="rounded-xl flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-200 hover:text-black"
                            onClick={async () => {
                              if (isAvatarChanged) {
                                // Use the dedicated function to handle avatar saving
                                await handleSaveAvatar();
                              } else {
                                // Change avatar
                                const url = generateAvatarUrl();
                                setAvatarUrl(url);
                                setIsAvatarChanged(true);
                              }
                            }}
                            disabled={isSavingAvatar}
                          >
                            {isSavingAvatar ? (
                              <>
                                <Loader2 className="animate-spin w-4 h-4 mr-1" />
                                Menyimpan...
                              </>
                            ) : isAvatarChanged ? (
                              <>
                                <Save className="w-4 h-4" />
                                Simpan Avatar
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4" />
                                Ganti Avatar
                              </>
                            )}
                          </Button>
                          {/* Icon-only button to change avatar, only show if avatar has been changed */}
                          {isAvatarChanged && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="rounded-full border border-gray-300 hover:bg-gray-200 hover:text-black"
                              onClick={() => {
                                const url = generateAvatarUrl();
                                setAvatarUrl(url);
                                setIsAvatarChanged(true);
                              }}
                              disabled={isSavingAvatar}
                              aria-label="Ganti Avatar"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {avatarSeed && (
                            <>
                              Seed: <span className="font-bold">{avatarSeed}</span>
                            </>
                          )}
                          {isAvatarChanged && <span className="ml-2 text-teal-600 font-semibold">Belum disimpan</span>}
                          {!isAvatarChanged && <span className="ml-2 text-green-600 font-semibold">Sudah disimpan</span>}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border-t border-gray-200 p-4">
                      <p className="text-teal-600 font-semibold text-sm">Avatar bersifat opsional tapi sangat direkomendasikan.</p>
                    </div>
                  </div>

                  {/* Combined Profile Form */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                    <form onSubmit={handleProfileUpdate}>
                      <div className="p-6">
                        <h2 className="text-2xl font-semibold mb-6">Informasi Profil</h2>

                        {/* Name Field */}
                        <div className="mb-6">
                          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Lengkap
                          </label>
                          <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => {
                              setDisplayName(e.target.value);
                              setFormErrors({ ...formErrors, nama_lengkap: "" });
                            }}
                            className="bg-white border-gray-200 rounded text-black"
                            placeholder="Nama lengkap"
                          />
                          {formErrors.nama_lengkap && <p className="mt-1 text-sm text-red-500">{formErrors.nama_lengkap}</p>}
                          <p className="mt-1 text-xs text-gray-400">Maksimal 32 karakter.</p>
                        </div>

                        {/* Phone Field with Country Code */}
                        <div className="mb-6">
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Nomor Telepon
                          </label>
                          <div className="flex">
                            {/* Country Code Dropdown */}
                            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={countryOpen} className="w-[120px] justify-between border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-r-none border-r-0 bg-white">
                                  {selectedCountry ? (
                                    <div className="flex items-center">
                                      <span className="mr-2 text-lg">{getFlagEmoji(selectedCountry.code)}</span>
                                      <span>{selectedCountry.dial_code}</span>
                                    </div>
                                  ) : (
                                    "Pilih"
                                  )}
                                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] border border-gray-200 bg-gray-50 rounded-xl p-0">
                                <Command className="bg-gray-100 text-black rounded-xl">
                                  <CommandInput
                                    placeholder="Cari negara..."
                                    className="h-9 bg-gray-100"
                                    value={countrySearchQuery}
                                    onValueChange={(value) => {
                                      setCountrySearchQuery(value);
                                      // console.log(`Searching for: "${value}"`);
                                    }}
                                  />
                                  <CommandEmpty>Negara tidak ditemukan</CommandEmpty>
                                  <CommandGroup className="max-h-[300px] bg-gray-100 text-black overflow-y-auto">
                                    {filteredCountries.length > 0 ? (
                                      filteredCountries.map((country) => (
                                        <CommandItem
                                          key={country.code}
                                          value={`${country.code}-${country.name}`}
                                          onSelect={() => {
                                            // console.log(`Selected country: ${country.name}`);
                                            setSelectedCountry(country);
                                            setCountryOpen(false);
                                          }}
                                          className="transition-all duration-200 ease-in-out hover:bg-teal-500"
                                        >
                                          <div className="flex items-center">
                                            <span className="mr-2 text-lg">{getFlagEmoji(country.code)}</span>
                                            <span className="mr-2">{country.name}</span>
                                            <span className="text-gray-500 text-sm">{country.dial_code}</span>
                                          </div>
                                        </CommandItem>
                                      ))
                                    ) : (
                                      <div className="py-6 text-center text-gray-500">Tidak ada hasil yang sesuai</div>
                                    )}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>

                            {/* Phone Number Input */}
                            <Input
                              id="phoneNumber"
                              value={phoneNumber}
                              onChange={(e) => {
                                setPhoneNumber(e.target.value);
                                setFormErrors({ ...formErrors, nomor_telepon: "" });
                              }}
                              className="bg-white border-gray-200 rounded-l-none flex-1 text-black"
                              placeholder={selectedCountry?.code === "ID" ? "81234567890" : "Phone number"}
                            />
                          </div>
                          {formErrors.nomor_telepon && <p className="mt-1 text-sm text-red-500">{formErrors.nomor_telepon}</p>}
                          <p className="mt-1 text-xs text-gray-400">{selectedCountry?.code === "ID" ? "Masukkan nomor tanpa kode negara atau awalan 0 (cth: 81234567890)." : "Masukkan nomor tanpa kode negara (cth: 7123456789)."}</p>
                        </div>
                        <Button type="submit" className="bg-teal-600 rounded-xl hover:bg-teal-700 text-white" disabled={!formChanged || isUpdating}>
                          {isUpdating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                          Simpan Perubahan
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeSetting === "security" && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <h2 className="text-2xl font-semibold">Autentikasi</h2>
                  <p className="text-gray-400 text-sm">Pengaturan keamanan dan autentikasi akun Anda.</p>

                  <div className="mt-6 p-4 rounded-xl bg-gray-100 border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-200 rounded-full">
                        <Shield className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Keamanan Akun</h3>
                        <p className="text-gray-400 text-sm">Kami merekomendasikan untuk secara rutin memperbarui kata sandi dan mengaktifkan autentikasi dua faktor untuk keamanan yang lebih baik.</p>
                        <Button className="mt-4 bg-teal-600 rounded-xl hover:bg-teal-700 text-white">Perbarui Pengaturan Keamanan</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add the billing section */}
              {activeSetting === "billing" && (
                <div className="space-y-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <h2 className="text-2xl font-semibold mb-2">Transaksi</h2>
                    <p className="text-gray-400 text-sm mb-6">Riwayat transaksi pembayaran paket AI Anda dari tabel payment_intent.</p>

                    {/* Add filtering options above the payment table */}
                    <div className="flex flex-wrap items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Riwayat Transaksi</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Filter:</span>
                        <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value)}>
                          <SelectTrigger className="w-[140px] bg-white border-gray-200 text-sm rounded-xl">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            <SelectItem value="success">Berhasil</SelectItem>
                            <SelectItem value="pending">Menunggu</SelectItem>
                            <SelectItem value="failed">Gagal</SelectItem>
                            <SelectItem value="challenge">Perlu Verifikasi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {loadingPayments ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                      </div>
                    ) : filteredPayments.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 overflow-hidden">
                          <thead className="bg-gray-100">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order ID
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Paket
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Periode
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Jumlah
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Terakhir Diupdate
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPayments.map((payment) => (
                              <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <span className="font-mono">{payment.order_id}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(payment.created_at), "dd MMM yyyy, HH:mm", { locale: id })}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{payment.package_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{payment.period === "monthly" ? "Bulanan" : "Tahunan"}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatCurrency(payment.amount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(payment.status)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.updated_at ? format(new Date(payment.updated_at), "dd MMM yyyy, HH:mm", { locale: id }) : "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                        <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak Ada Transaksi</h3>
                        <p className="mt-1 text-sm text-gray-500">Anda belum memiliki transaksi pembayaran apa pun di tabel payment_intent.</p>
                        <div className="mt-6">
                          <Link href="/pricing">
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl">Lihat Paket</Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSetting === "settings" && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Kiri: Bahasa & Mode Tampilan */}
                    <div className="p-6 space-y-8 border-b md:border-b-0 md:border-r border-gray-200">
                      {/* Bahasa */}
                      <div>
                        <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
                          <Globe2 className="w-6 h-6" /> Pilih Bahasa
                        </h3>
                        <div className="flex gap-3">
                          <Button
                            variant={language === "id" ? "default" : "outline"}
                            className={`flex items-center bg-white rounded-xl border border-gray-200 hover:bg-gray-200 hover:text-gray-900 gap-2 ${language === "id" ? "bg-teal-600 text-white hover:bg-teal-700 hover:text-white" : ""}`}
                            onClick={() => setLanguage("id")}
                          >
                            <Languages className="w-4 h-4" /> Indonesia
                          </Button>
                          <Button
                            variant={language === "en" ? "default" : "outline"}
                            className={`flex items-center bg-white rounded-xl border border-gray-200 hover:bg-gray-200 hover:text-gray-900 gap-2 ${language === "en" ? "bg-teal-600 text-white hover:bg-teal-700 hover:text-white" : ""}`}
                            onClick={() => setLanguage("en")}
                          >
                            <Languages className="w-4 h-4" /> English
                          </Button>
                        </div>
                      </div>
                      {/* Mode Tampilan */}
                      <div>
                        <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
                          <Sun className="w-6 h-6" /> Mode Tampilan
                        </h3>
                        <div className="flex gap-3">
                          <Button
                            variant={theme === "light" ? "default" : "outline"}
                            className={`flex items-center bg-white rounded-xl border border-gray-200 hover:bg-gray-200 hover:text-gray-900 gap-2 ${theme === "light" ? "bg-teal-600 text-white hover:bg-teal-700 hover:text-white" : ""}`}
                            onClick={() => setTheme("light")}
                          >
                            <Sun className="w-4 h-4" /> Light
                          </Button>
                          <Button
                            variant={theme === "dark" ? "default" : "outline"}
                            className={`flex items-center bg-white rounded-xl border border-gray-200 hover:bg-gray-200 hover:text-gray-900 gap-2 ${theme === "dark" ? "bg-teal-600 text-white hover:bg-teal-700 hover:text-white" : ""}`}
                            onClick={() => setTheme("dark")}
                          >
                            <Moon className="w-4 h-4" /> Dark
                          </Button>
                        </div>
                      </div>
                    </div>
                    {/* Kanan: Feedback & Tentang */}
                    <div className="p-6 space-y-8">
                      {/* Feedback & Dukungan */}
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <MessageCircle className="w-5 h-5" /> Feedback & Dukungan
                        </h3>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            setSendingFeedback(true);
                            setTimeout(() => {
                              toast.success("Feedback terkirim, terima kasih!");
                              setFeedback("");
                              setSendingFeedback(false);
                            }, 1200);
                          }}
                          className="flex flex-col gap-2"
                        >
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="border border-gray-300 rounded-xl p-3 text-sm resize-none"
                            rows={3}
                            placeholder="Ketik saran atau laporan masalah Anda di sini..."
                            required
                          />
                          <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl" disabled={sendingFeedback || !feedback.trim()}>
                            {sendingFeedback ? "Mengirim..." : "Kirim Feedback"}
                          </Button>
                        </form>
                      </div>
                      {/* Tentang Aplikasi */}
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Info className="w-5 h-5" /> Tentang Aplikasi
                        </h3>
                        <div className="text-sm text-gray-700 space-y-1">
                          <div>
                            Versi : <span className="font-semibold">1.0.0</span>
                          </div>
                          <div>
                            Tim Pengembang: <span className="font-semibold">MechaMinds</span>
                          </div>
                          <div>
                            Lisensi: <span className="font-semibold">Open Source (MIT)</span>
                          </div>
                          {/* T */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}