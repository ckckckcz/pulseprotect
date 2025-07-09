"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/src/services/authService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Zap,
  BookOpen,
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
} from "lucide-react"

const models = [
  { id: "gpt-4o", name: "GPT-4o", description: "Most capable model" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Faster and cheaper" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Good for simple tasks" },
]

const chatHistory = [
  "Supabase URL Environment Error",
  "Pseudocode Penjelasan",
  "Instalasi Supabase NextJS",
  "Apa itu Lovable.dev",
  "Pembagian Tugas Diagram",
  "Cara gabung 3 PDF",
  "Cara install Laravel",
  "Soal UI UX dan Pemrograman",
  "Website Gila Banget",
  "Latar belakang SIMTA JTI",
  "Contoh Text Editor IDE",
  "Smart City AI Indonesia",
  "Rumus Excel Statistik",
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
  const [selectedModel, setSelectedModel] = useState("gpt-4o")
  const [user, setUser] = useState<any>(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const router = useRouter()
  
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
  
  // Reference to current language text
  const fullTextRef = useRef(translations[currentLanguageIndex].text);
  
  // Typing animation effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
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
        // Update the reference to the new language text
        fullTextRef.current = translations[
          currentLanguageIndex === translations.length - 1 ? 0 : currentLanguageIndex + 1
        ].text;
      }
    }
    
    return () => clearTimeout(timeout);
  }, [displayText, isTyping, isErasing, currentLanguageIndex]);
  
  // Custom input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // Custom submit handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
      
      // Simulate AI response after delay
      setTimeout(() => {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: `This is a static response to: "${input}"`
        }
        setMessages(prev => [...prev, aiMessage])
        setIsLoading(false)
      }, 1500)
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
      <div className="w-72 bg-white border-r border-gray-200 text-gray-900 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-900">
              <BookOpen className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            <Button
              onClick={startNewChat}
              variant="ghost"
              className="w-full justify-start text-gray-900 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-3" />
              New chat
            </Button>

            <Button variant="ghost" className="w-full justify-start text-gray-900 hover:text-gray-900 hover:bg-gray-100 rounded-xl">
              <Search className="w-4 h-4 mr-3" />
              Search chats
            </Button>

            <Button variant="ghost" className="w-full justify-start text-gray-900 hover:text-gray-900 hover:bg-gray-100 rounded-xl">
              <Library className="w-4 h-4 mr-3" />
              Library
            </Button>

            <Button variant="ghost" className="w-full justify-start text-gray-900 hover:text-gray-900 hover:bg-gray-100 rounded-xl">
              <Play className="w-4 h-4 mr-3" />
              Sora
            </Button>

            <Button variant="ghost" className="w-full justify-start text-gray-900 hover:text-gray-900 hover:bg-gray-100 rounded-xl">
              <Grid3X3 className="w-4 h-4 mr-3" />
              GPTs
            </Button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
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
                    className=" text-gray-900 hover:bg-gray-100 hover:text-gray-900 p-1"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.nama_lengkap ? user.nama_lengkap[0].toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium truncate">{user?.email || 'User'}</div>
              <div className="text-xs text-gray-400">Free Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-32 bg-white text-black border-2 border-gray-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto bg-white border-2 border-gray-200 text-black rounded-xl ">
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div>
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4" />
              <span>Subscribe to a Pro plan for increased message limits and faster response times</span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6">
          {showSuggestions && messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex-1 flex flex-col justify-center items-center space-y-8">
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
                  <div className="flex items-center space-x-1 px-4 py-2 border border-gray-300 transition-all duration-200 ease-in-out cursor-pointer hover:bg-teal-600 hover:text-white hover:border-teal-600 font-semibold rounded-xl">
                    <Crown className="w-4 h-4" />
                    <span>Join Silva Pro</span>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
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
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto py-6 space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-3xl px-4 py-3 rounded-2xl ${
                        message.role === "user"
                          ? "bg-teal-600 text-white"
                          : "bg-white border border-gray-200 text-gray-900 shadow-sm"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 text-gray-900 max-w-3xl px-4 py-3 rounded-2xl shadow-sm">
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

              {/* Input Form */}
              <div className="py-4">
                <form onSubmit={onSubmit} className="relative">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask Fluid anything..."
                    className="w-full pl-4 pr-20 py-4 text-lg border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />

                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <Button type="button" variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
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
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
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
