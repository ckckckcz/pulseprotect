"use client"

  import { useState, useEffect, useMemo } from "react"
import { Search, Mail, Shield, CheckCircle, User, Key, CreditCard, FileText, Code, Loader2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { authService } from "@/lib/auth"
import { toast } from "sonner"
import Navbar from "@/components/widget/navbar"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"

// Define a type for the user with status
type UserWithStatus = {
  id?: string | number
  nama_lengkap?: string
  email?: string
  nomor_telepon?: string
  role?: string
  created_at?: string
  foto_profile?: string
  status?: string
  verifikasi_email?: boolean
  email_confirmed_at?: string | null
}

// Define country type
type Country = {
  name: string
  dial_code: string
  code: string
}

export default function UserProfile() {
  const [activeSetting, setActiveSetting] = useState("general")
  const { user, loading, refreshUser } = useAuth() as { 
    user: UserWithStatus | null, 
    loading: boolean,
    refreshUser: () => Promise<void>
  }
  const router = useRouter()
  
  // Form fields
  const [displayName, setDisplayName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [countryOpen, setCountryOpen] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [countrySearchQuery, setCountrySearchQuery] = useState("")
  
  // Form states
  const [isUpdating, setIsUpdating] = useState(false)
  const [formErrors, setFormErrors] = useState({
    nama_lengkap: "",
    nomor_telepon: ""
  })
  const [formChanged, setFormChanged] = useState(false)
  
  // Fetch countries data
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/countries');
        if (!response.ok) throw new Error('Failed to fetch countries');
        const data = await response.json();
        
        // Log the total number of countries loaded
        console.log(`Loaded ${data.length} countries`);
        
        // Check if Indonesia exists in the data
        const indonesia = data.find((country: Country) => 
          country.name === "Indonesia" || country.code === "ID"
        );
        
        if (indonesia) {
          console.log("Indonesia found in country data:", indonesia);
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
        console.error('Error fetching countries:', error);
      }
    };
    
    fetchCountries();
  }, []);
  
  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push("/login")
    }
    
    // Initialize form values from user data
    if (user) {
      setDisplayName(user.nama_lengkap || "")
      
      // Parse phone number if exists
      if (user.nomor_telepon) {
        console.log("Original phone:", user.nomor_telepon);
        
        // If countries not yet loaded, use the full number temporarily
        if (countries.length === 0) {
          setPhoneNumber(user.nomor_telepon);
        } else {
          const phoneWithoutCode = parsePhoneNumber(user.nomor_telepon);
          console.log("Parsed phone:", phoneWithoutCode);
          
          // Use the national number part
          setPhoneNumber(phoneWithoutCode.nationalNumber);
          
          // If we can identify the country code, set it
          if (phoneWithoutCode.countryCode) {
            const matchedCountry = countries.find(
              c => c.dial_code.replace('+', '') === phoneWithoutCode.countryCode
            );
            if (matchedCountry) {
              console.log("Matched country:", matchedCountry);
              setSelectedCountry(matchedCountry);
            }
          } else if (selectedCountry === null && countries.length > 0) {
            // If no country code detected but we have a phone number,
            // try to set a default country (Indonesia if available)
            const indonesia = countries.find(c => c.code === 'ID');
            if (indonesia) {
              setSelectedCountry(indonesia);
            }
          }
        }
      }
    }
  }, [user, loading, router, countries])

  // Helper to parse phone number - improved version
  const parsePhoneNumber = (phoneWithCode: string) => {
    // Default values
    let countryCode = '';
    let nationalNumber = phoneWithCode;
    
    if (!phoneWithCode) return { countryCode, nationalNumber };
    
    try {
      if (phoneWithCode.startsWith('+')) {
        // Format: +62812345678
        // Find the country that matches this dial code
        for (const country of countries) {
          if (phoneWithCode.startsWith(country.dial_code)) {
            countryCode = country.dial_code.replace('+', '');
            nationalNumber = phoneWithCode.substring(country.dial_code.length);
            return { countryCode, nationalNumber };
          }
        }
      } else {
        // Format without +: 62812345678
        // Try to identify common country codes (1-4 digits)
        for (let i = 1; i <= 4; i++) {
          const potentialCode = phoneWithCode.substring(0, i);
          const potentialMatch = countries.find(c => c.dial_code === `+${potentialCode}`);
          if (potentialMatch) {
            countryCode = potentialCode;
            nationalNumber = phoneWithCode.substring(i);
            return { countryCode, nationalNumber };
          }
        }
        
        // If no country code detected, assume it's already a national number
        // This handles cases where the user entered a number without country code
        return { countryCode: '', nationalNumber: phoneWithCode };
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
      const formattedPhone = selectedCountry 
        ? `${selectedCountry.dial_code}${phoneNumber.replace(/^0+/, '')}`
        : phoneNumber;
        
      const userPhone = user.nomor_telepon || '';
      
      // Compare normalized phone numbers (remove spaces, dashes, etc.)
      const normalizedFormPhone = formattedPhone.replace(/[\s-]/g, '');
      const normalizedUserPhone = userPhone.replace(/[\s-]/g, '');
      
      const hasChanged = 
        displayName !== user.nama_lengkap || 
        normalizedFormPhone !== normalizedUserPhone;
      
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
      .substring(0, 2)
  }

  // Get flag emoji from country code
  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  // Improved filter countries function
  const filteredCountries = useMemo(() => {
    // If no search query, return all countries
    if (!countrySearchQuery.trim()) {
      return countries;
    }
    
    const normalizedQuery = countrySearchQuery.toLowerCase().trim();
    
    return countries.filter(country => {
      // Check if any of these fields contains the search query
      return (
        country.name.toLowerCase().includes(normalizedQuery) ||
        country.dial_code.toLowerCase().includes(normalizedQuery) ||
        country.code.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [countries, countrySearchQuery]);

  // Handle form submit - updates both name and phone number
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    // Validate form
    let hasErrors = false;
    const errors = {
      nama_lengkap: "",
      nomor_telepon: ""
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
        } else if (phoneNumber.startsWith('0')) {
          // Replace leading zero with country code
          formattedPhone = `${selectedCountry.dial_code}${phoneNumber.substring(1)}`;
        } else {
          // Just add the country code
          formattedPhone = `${selectedCountry.dial_code}${phoneNumber}`;
        }
      }
      
      console.log("Formatted phone to save:", formattedPhone);
    }
    
    try {
      // Update user profile
      await authService.updateUser(Number(user.id), {
        nama_lengkap: displayName.trim(),
        nomor_telepon: formattedPhone.trim() || undefined
      });
      
      // Refresh user data
      await refreshUser();
      
      toast.success("Profil berhasil diperbarui");
      setFormChanged(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Gagal memperbarui profil");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (!user) {
    return null // Let the useEffect redirect handle this
  }

  const sidebarItems = [
    { id: "general", label: "Umum", icon: User },
    { id: "authentication", label: "Autentikasi", icon: Key },
    { id: "security", label: "Keamanan", icon: Shield },
    { id: "billing", label: "Tagihan", icon: CreditCard },
    { id: "invoices", label: "Faktur", icon: FileText },
  ]

  return (
    <>
      <Navbar/>
      <div className="w-full min-h-screen bg-white text-black pt-32 mb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Pengaturan Akun</h1>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-72">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Cari..." 
                  className="pl-10 bg-white border-gray-200 border rounded-xl text-black" 
                />
              </div>
              
              <nav className="space-y-1">
                {sidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSetting(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                      activeSetting === item.id 
                        ? "bg-teal-600 hover:bg-teal-700 rounded-xl text-white"
                        : "text-gray-700 rounded-xl hover:bg-gray-100 hover:text-black"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Main content */}
            <div className="flex-1">
              {activeSetting === "general" && (
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-2xl font-semibold">Avatar</h2>
                      <p className="text-gray-400 text-sm mb-6">Klik pada avatar untuk mengunggah yang baru dari file Anda.</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="relative group cursor-pointer">
                            <Avatar className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-500">
                              <AvatarImage
                                src={user.foto_profile || `https://api.dicebear.com/6.x/initials/svg?seed=${user.nama_lengkap || "User"}`}
                                alt={user.nama_lengkap || "User"}
                              />
                              <AvatarFallback className="bg-gray-800 text-black">
                                {getInitials(user.nama_lengkap)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-white bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs text-black">Upload</span>
                            </div>
                          </div>
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
                            onChange={e => {
                              setDisplayName(e.target.value)
                              setFormErrors({...formErrors, nama_lengkap: ""})
                            }}
                            className="bg-white border-gray-200 rounded text-black"
                            placeholder="Nama lengkap"
                          />
                          {formErrors.nama_lengkap && (
                            <p className="mt-1 text-sm text-red-500">{formErrors.nama_lengkap}</p>
                          )}
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
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={countryOpen}
                                  className="w-[120px] justify-between border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-r-none border-r-0 bg-white"
                                >
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
                                      console.log(`Searching for: "${value}"`);
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
                                            console.log(`Selected country: ${country.name}`);
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
                                      <div className="py-6 text-center text-gray-500">
                                        Tidak ada hasil yang sesuai
                                      </div>
                                    )}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            
                            {/* Phone Number Input */}
                            <Input 
                              id="phoneNumber"
                              value={phoneNumber}
                              onChange={e => {
                                setPhoneNumber(e.target.value)
                                setFormErrors({...formErrors, nomor_telepon: ""})
                              }}
                              className="bg-white border-gray-200 rounded-l-none flex-1 text-black"
                              placeholder={selectedCountry?.code === "ID" ? "81234567890" : "Phone number"}
                            />
                          </div>
                          {formErrors.nomor_telepon && (
                            <p className="mt-1 text-sm text-red-500">{formErrors.nomor_telepon}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-400">
                            {selectedCountry?.code === "ID" 
                              ? "Masukkan nomor tanpa kode negara atau awalan 0 (cth: 81234567890)."
                              : "Masukkan nomor tanpa kode negara (cth: 7123456789)."}
                          </p>
                        </div>
                        <Button
                          type="submit"
                          className="bg-teal-600 rounded-xl hover:bg-teal-700 text-white"
                          disabled={!formChanged || isUpdating}
                        >
                          {isUpdating ? (
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          ) : null}
                          Simpan Perubahan
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeSetting === "authentication" && (
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
                        <p className="text-gray-400 text-sm">
                          Kami merekomendasikan untuk secara rutin memperbarui kata sandi dan mengaktifkan 
                          autentikasi dua faktor untuk keamanan yang lebih baik.
                        </p>
                        <Button className="mt-4 bg-teal-600 rounded-xl hover:bg-teal-700 text-white">
                          Perbarui Pengaturan Keamanan
                        </Button>
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
  )
}

