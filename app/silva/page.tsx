"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authService } from "@/src/services/authService"
import { aiService, AIModel, Message } from "@/src/services/aiService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Zap,
  PanelLeft,
  Plus,
  Search,
  Library,
  Play,
  Grid3X3,
  Circle,
  Paperclip,
  ArrowUp,
  Sparkles,
  Crown,
  MoreHorizontal,
  ChevronDown,
  Home,
  User,
  LogOut,
  DoorOpen,
  House
} from "lucide-react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"

const models = [
  { id: "google-gemini", name: "Google Gemini", description: "Google AI Studio", requiredMembership: "free" },
  { id: "deepseek-v3", name: "DeepSeek V3", description: "DeepSeek LLM", requiredMembership: "plus" },
  { id: "mistral-small-24b", name: "Mistral Small", description: "Mistral 24b", requiredMembership: "pro" },
]

const chatHistory = [
  "Supabase URL Environment Error",
]

const suggestions = [
  "Generate a blog UI",
  "Rewrite my LinkedIn bio",
  "Create a slideshow",
  "Synthesise an excel document",
  "Find me the average cost",
]

// Add language translations
const translations = [
  { lang: "English", text: "What would you like to create?" },
  { lang: "Indonesia", text: "Apa yang ingin Anda buat?" },
  { lang: "日本語", text: "何を作りたいですか?" },
  { lang: "Français", text: "Qu'aimeriez-vous créer?" },
  { lang: "한국어", text: "무엇을 만들고 싶으신가요?" },
];

export default function ChatInterface() {
  const [selectedModel, setSelectedModel] = useState<AIModel>("google-gemini") // Updated default model
  const [user, setUser] = useState<any>(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const router = useRouter()
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [showBottomCard, setShowBottomCard] = useState(false);
  const [activeMembershipType, setActiveMembershipType] = useState<"free" | "plus" | "pro">("free");

  // Avatar URL state
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (!currentUser) {
          router.push('/login') // Redirect to login page if not authenticated
          return
        }
        
        setUser(currentUser)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push('/login')
      } finally {
        setIsAuthChecking(false)
      }
    }
    
    checkAuth()
  }, [router])
  
  const [messages, setMessages] = useState<{id: string; role: "user" | "assistant"; content: string}[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [currentLanguageIndex, setCurrentLanguageIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isErasing, setIsErasing] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const fullTextRef = useRef(translations[0].text);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Typing animation effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    // Update the reference to the current language text
    fullTextRef.current = translations[currentLanguageIndex].text;
    
    // If we're typing
    if (isTyping && !isErasing) {
      if (displayText.length < fullTextRef.current.length) {
        // Type next character
        timeout = setTimeout(() => {
          setDisplayText(fullTextRef.current.substring(0, displayText.length + 1));
        }, 50); // Typing speed
      } else {
        // Finished typing, pause before erasing
        timeout = setTimeout(() => {
          setIsErasing(true);
        }, 100); // Pause time when fully typed
      }
    }
    
    // If we're erasing
    if (isErasing) {
      if (displayText.length > 0) {
        // Erase one character
        timeout = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, 50); // Erasing speed (faster than typing)
      } else {
        // Finished erasing, move to next language
        setIsErasing(false);
        setCurrentLanguageIndex((prevIndex) => 
          prevIndex === translations.length - 1 ? 0 : prevIndex + 1
        );
      }
    }
    
    return () => clearTimeout(timeout);
  }, [displayText, isTyping, isErasing, currentLanguageIndex]);  
  // Custom input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // Custom submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content: input
      }
      
      setMessages(prev => [...prev, userMessage])
      setInput("")
      setIsLoading(true)
      
      try {
        // Convert messages to AI service format
        const messageHistory: Message[] = messages
          .concat(userMessage)
          .map(msg => ({
            role: msg.role,
            content: msg.content
          }));
        
        // Call AI service
        const response = await aiService.generateCompletion(selectedModel, messageHistory);
        
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: response.text
        }
        
        setMessages(prev => [...prev, aiMessage])
      } catch (error) {
        console.error("AI error:", error);
        // Add error message
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: "Sorry, I encountered an error while processing your request. Please try again."
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      setShowSuggestions(false)
      handleSubmit(e)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setShowSuggestions(false)

    setTimeout(() => {
      const form = document.querySelector("form")
      if (form) {
        form.requestSubmit()
      }
    }, 100)
  }

  const startNewChat = () => {
    setMessages([])
    setInput("")
    setShowSuggestions(true)
  }

  const handleLogout = async () => {
    try {
      // Clear user from localStorage
      localStorage.removeItem('user');
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };
  
  // Function to toggle the bottom card visibility
  const toggleBottomCard = () => {
    setShowBottomCard(!showBottomCard);
  };

  // Fetch membership_type dari payment Supabase
  useEffect(() => {
    const fetchMembership = async () => {
      if (!user?.email) {
        setActiveMembershipType("free");
        return;
      }
      const { data } = await supabase
        .from("payment")
        .select("membership_type, created_at, status")
        .eq("email", user.email)
        .eq("status", "success")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data && data.membership_type) {
        setActiveMembershipType(data.membership_type as "free" | "plus" | "pro");
      } else {
        setActiveMembershipType("free");
      }
    };
    fetchMembership();
  }, [user?.email]);

  // Helper: cek apakah model unlocked untuk membership user
  const isModelUnlocked = (modelId: string) => {
    if (activeMembershipType === "pro") return true;
    if (activeMembershipType === "plus") return modelId === "google-gemini" || modelId === "deepseek-v3";
    return modelId === "google-gemini";
  };

  // Update avatar URL when user data changes
  useEffect(() => {
    if (user?.foto_profile) {
      setAvatarUrl(user.foto_profile);
    } else if (user?.nama_lengkap) {
      setAvatarUrl(`https://api.dicebear.com/6.x/initials/svg?seed=${user.nama_lengkap}`);
    } else {
      setAvatarUrl("");
    }
  }, [user?.foto_profile, user?.nama_lengkap]);

  // If still checking auth, show a loading state
  if (isAuthChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce"></div>
            <div 
              className="w-3 h-3 bg-teal-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div 
              className="w-3 h-3 bg-teal-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`bg-white border-r border-gray-200 text-gray-900 lg:flex hidden flex-col transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "w-72" : "w-[69px]"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div 
              className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center cursor-pointer transition-colors duration-200"
              onClick={toggleSidebar}
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
            >
              {isLogoHovered ? (
                <PanelLeft className="w-4 h-4 text-white" />
              ) : (
                <Zap className="w-4 h-4 text-white" fill="currentColor" />
              )}
            </div>
            {/* Remove the separate toggle button */}
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            <Button
              onClick={startNewChat}
              variant="ghost"
              className={`w-full hover:text-gray-900 hover:bg-gray-100 rounded-xl ${
                isSidebarExpanded ? "justify-start" : "justify-center"
              }`}
            >
              <Plus className="w-4 h-4 min-w-[16px]" />
              {isSidebarExpanded && <span className="ml-3">New chat</span>}
            </Button>

            <Button 
              variant="ghost" 
              className={`w-full hover:text-gray-900 hover:bg-gray-100 rounded-xl ${
                isSidebarExpanded ? "justify-start" : "justify-center"
              }`}
            >
              <Search className="w-4 h-4 min-w-[16px]" />
              {isSidebarExpanded && <span className="ml-3">Search chats</span>}
            </Button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          {isSidebarExpanded ? (
            <div className="p-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">Chats</h3>
              <div className="space-y-1">
                {chatHistory.map((chat, index) => (
                  <div
                    key={index}
                    className="w-full justify-center items-center cursor-pointer px-4 py-1 hover:bg-gray-100 rounded-xl flex group"
                  >
                    <span className="text-sm text-gray-900 truncate flex-1">{chat}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 p-1"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center pt-4">
              {/* Simplified view when collapsed - just show chat icons */}
              {chatHistory.slice(0, 5).map((_, index) => (
                <div
                  key={index}
                  className="w-8 hidden h-8 mb-2 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
                >
                  <span className="text-xs">{index + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 relative" ref={profileMenuRef}>
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center
                ${
                  activeMembershipType === "pro"
                    ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-white shadow-[0_0_15px_rgba(245,158,11,0.6)] border-2 border-amber-300"
                    : activeMembershipType === "plus"
                    ? "ring-2 ring-teal-500 ring-offset-2 ring-offset-white shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                    : ""
                }
              `}
              style={{ backgroundColor: "#14b8a6", overflow: "hidden" }}
            >
              {/* Avatar image */}
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.nama_lengkap || "User"}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-sm font-medium text-white">
                  {user?.nama_lengkap ? user.nama_lengkap[0].toUpperCase() : 'U'}
                </span>
              )}
            </div>
            {isSidebarExpanded && (
              <>
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-medium truncate">{user?.email || 'User'}</div>
                  <div className="text-xs text-gray-400">
                    {activeMembershipType === "pro"
                      ? "Pro Plan"
                      : activeMembershipType === "plus"
                      ? "Plus Plan"
                      : "Free Plan"}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </div>
          
          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className={`absolute bottom-full ${isSidebarExpanded ? 'left-2' : 'left-16'} w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 mb-2 z-10`}>
              <Link href="/" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
              <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          {/* Left side with model selector */}
          <div className="flex items-center space-x-4">
            <Select
              value={selectedModel}
              onValueChange={(value) => {
                if (isModelUnlocked(value)) setSelectedModel(value as AIModel);
              }}
            >
              <SelectTrigger className="w-48 h-12 bg-white text-black border-2 border-gray-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto bg-white border-2 border-gray-200 text-black rounded-xl">
                {models.map((model) => {
                  const unlocked = isModelUnlocked(model.id);
                  return (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      disabled={!unlocked}
                      className={!unlocked ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900 flex items-center">
                          {model.name}
                          {!unlocked && (
                            <span className="ml-2 text-xs text-amber-600 font-semibold">
                              {model.requiredMembership === "plus"
                                ? "Unlock Plus"
                                : model.requiredMembership === "pro"
                                ? "Unlock Pro"
                                : ""}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{model.description}</div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Right side with user actions */}
          <div className="flex items-center space-x-3 lg:block hidden">
            <div className="flex items-center space-x-2 text-sm text-teal-800">
              <Sparkles className="w-4 h-4" />
              <span>Subscribe to a Pro plan for increased message limits</span>
            </div>
          </div>
        </div>

        {/* Chat Area - Take remaining height with proper scrolling */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {showSuggestions && messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex-1 flex flex-col justify-center items-center space-y-8 overflow-y-auto px-6">
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-gray-500 mb-2">
                  {translations[currentLanguageIndex].lang}
                </span>
                <h1 className="text-4xl font-semibold text-gray-900 text-center h-12">
                  {displayText}
                  <span className="inline-block w-1 h-6 bg-gray-900 ml-1 animate-blink"></span>
                </h1>
              </div>

              <div className="w-full max-w-2xl space-y-3">
                <form onSubmit={onSubmit} className="relative">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask Silva anything..."
                    className="w-full pl-4 pr-20 py-6 text-md bg-gray-100 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />

                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <Button type="button" variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-200 rounded-full hover:text-gray-700">
                      <Paperclip className="w-4 h-4" />
                    </Button>

                    <Button
                      type="submit"
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700 text-white rounded-full w-8 h-8 p-0"
                      disabled={!input.trim() || isLoading}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                  </div>
                </form>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <Button
                  asChild
                  className="flex items-center space-x-1 px-4 py-2 border border-gray-300 transition-all duration-200 ease-in-out cursor-pointer hover:bg-teal-600 hover:text-white hover:border-teal-600 font-semibold rounded-xl"
                  disabled={isLoading}
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => setIsLoading(false), 4000);
                  }}
                  >
                  <Link href="/pricing">
                    {/* Hide Crown and text when loading */}
                    {!isLoading && (
                    <>
                      <Crown className="w-4 h-4" />
                      <span>Join Silva Pro</span>
                    </>
                    )}
                    {isLoading && (
                    <span className="ml-2 flex items-center space-x-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Tunggu Sebentar...</span>
                    </span>
                    )}
                  </Link>
                  </Button>
                </div>
              </div>

              {/* Suggestions */}
              {/* <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-gray-600 bg-white hover:bg-gray-50 rounded-xl border-gray-300 hover:border-teal-600 hover:text-teal-600"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div> */}
            </div>
          ) : (
            /* Chat Messages Area */
            <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto">
              {/* Scrollable message container with hidden scrollbar */}
              <div className="flex-1 overflow-y-auto px-6 pt-6 pb-28 scrollbar-none" style={{ maxHeight: "calc(100vh - 120px)" }}>
                <div className="space-y-6 w-full">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] sm:max-w-[70%] px-4 py-3 rounded-2xl ${
                          message.role === "user"
                            ? "bg-teal-600 text-white"
                            : "bg-white border border-gray-200 text-gray-900 shadow-sm"
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words">{message.content}</div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 text-gray-900 max-w-[75%] px-4 py-3 rounded-2xl shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Form - Fixed at bottom with absolute positioning */}
              <div className="absolute bottom-0 left-0 right-0 bg-gray-50 z-10">
                {/* Red Gradient with Blur */}
                <div className="max-w-4xl mx-auto w-full px-6 py-1 pb-4">
                  <form onSubmit={onSubmit} className="relative">
                    <Input
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask Silva anything..."
                      className="w-full pl-4 pr-20 py-6 text-md bg-gray-100 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      <Button type="button" variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-200 rounded-full hover:text-gray-700">
                        <Paperclip className="w-4 h-4" />
                      </Button>

                      <Button
                        type="submit"
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-full w-8 h-8 p-0"
                        disabled={!input.trim() || isLoading}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Toggle Button - Fixed position above footer */}
        <div className="fixed bottom-12 left-0 right-0 flex justify-center lg:hidden z-20">
          <Button
            onClick={toggleBottomCard}
            className={`rounded-tr-xl rounded-tl-xl w-12 h-12 bg-teal-600 hover:bg-teal-700 text-white shadow-lg transition-transform ${
              showBottomCard ? 'rotate-180' : ''
            }`}
          >
            <ArrowUp className="w-full h-full" />
          </Button>
        </div>

        {/* Overlay when bottom card is open */}
        {showBottomCard && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
            onClick={toggleBottomCard}
          ></div>
        )}

        {/* Bottom Action Card - Mobile Only */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: showBottomCard ? 0 : '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-white text-gray-900 rounded-t-3xl p-6 z-40 lg:hidden"
          style={{ maxHeight: '80vh', overflowY: 'auto' }}
        >
          <div className="flex justify-center mb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>
          
          {/* Card Content */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center overflow-hidden">
                {/* Avatar image mobile */}
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.nama_lengkap || "User"}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-sm font-medium text-white">
                    {user?.nama_lengkap ? user.nama_lengkap[0].toUpperCase() : 'U'}
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm font-medium">{user?.email || 'User'}</div>
                <div className="text-xs text-gray-400">Free Plan</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="flex items-center justify-start gap-3 h-14 bg-gray-50 border border-gray-200 rounded-xl hover:bg-teal-50 hover:border-teal-200 hover:text-gray-900"
                onClick={() => {
                  startNewChat();
                  setShowBottomCard(false);
                }}
              >
                <Plus className="w-5 h-5 text-teal-600" />
                <span>New Chat</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center justify-start gap-3 h-14 bg-gray-50 border border-gray-200 rounded-xl hover:bg-teal-50 hover:border-teal-200 hover:text-gray-900"
              >
                <House className="w-4 h-4" />
                <span>Home</span>
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-12 bg-red-600 border-red-200 text-white hover:bg-red-700 hover:border-red-300 rounded-xl"
                onClick={handleLogout}
              >
                <DoorOpen className="w-4 h-4" />
                <span>Keluar</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Footer - Add padding to prevent overlap with toggle button on mobile */}
        <div className="bg-white border-t border-gray-200 px-6 lg:py-6 py-4 lg:mb-0 shrink-0 z-30">
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-700">
              Terms & Conditions
            </a>
            <a href="#" className="hover:text-gray-700">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
