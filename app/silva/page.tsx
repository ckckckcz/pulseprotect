"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authService } from "@/src/services/authService"
import { aiService, type AIModel, type Message } from "@/src/services/aiService"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Zap,
  PanelLeft,
  Plus,
  Search,
  ArrowUp,
  Sparkles,
  Crown,
  MoreHorizontal,
  ChevronDown,
  Home,
  User,
  LogOut,
  DoorOpen,
  HomeIcon as House,
  X,
  Mic,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Volume2,
  Share2,
  FileText,
  Download,
  Mail,
  CopyIcon,
  Flag,
  Images,
  Check,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const models = [
  { id: "google-gemini", name: "Google Gemini", description: "Google AI Studio", requiredMembership: "free" },
  { id: "deepseek-v3", name: "DeepSeek V3", description: "DeepSeek LLM", requiredMembership: "plus" },
  { id: "mistral-small-24b", name: "Mistral Small", description: "Mistral 24b", requiredMembership: "pro" },
]

interface ChatActionsProps {
  textContent: string
  onRegenerate?: () => void
  onSpeak?: (text: string) => void
  onCopy?: (text: string) => void
}

const chatHistory = ["Supabase URL Environment Error"]

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
]

// Enhanced Waveform Component with better audio responsiveness
const EnhancedWaveform: React.FC<{
  isRecording: boolean
  onAccept: () => void
  onCancel: () => void
  audioStream: MediaStream | null
}> = ({ isRecording, onAccept, onCancel, audioStream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameIdRef = useRef<number | null>(null)
  const [amplitudeData, setAmplitudeData] = useState<number[]>(new Array(80).fill(0))
  const [isVoiceDetected, setIsVoiceDetected] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(400);

  // Responsif: update canvas width saat parent berubah
  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    const observer = new window.ResizeObserver(handleResize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isRecording && audioStream) {
      initializeAudioContext()
    } else {
      cleanup()
    }

    return cleanup
  }, [isRecording, audioStream])

  const initializeAudioContext = async () => {
    if (!audioStream) return

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContextRef.current.createMediaStreamSource(audioStream)
      analyserRef.current = audioContextRef.current.createAnalyser()

      // Optimize for voice detection
      analyserRef.current.fftSize = 512
      analyserRef.current.smoothingTimeConstant = 0.3
      analyserRef.current.minDecibels = -90
      analyserRef.current.maxDecibels = -10

      source.connect(analyserRef.current)
      startVisualization()
    } catch (error) {
      console.error("Error initializing audio context:", error)
    }
  }

  const startVisualization = () => {
    if (!analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!analyserRef.current || !canvasRef.current) return

      analyserRef.current.getByteFrequencyData(dataArray)

      // Process frequency data for voice detection
      const barCount = 80
      const barWidth = Math.floor(bufferLength / barCount)
      const newAmplitudeData: number[] = []
      let totalEnergy = 0

      for (let i = 0; i < barCount; i++) {
        let sum = 0
        const start = i * barWidth
        const end = Math.min(start + barWidth, bufferLength)

        for (let j = start; j < end; j++) {
          sum += dataArray[j]
        }

        const average = sum / (end - start)
        totalEnergy += average

        // Enhanced amplitude calculation for better voice response
        const normalizedAmplitude = Math.min((average / 255) * 1.5, 1)

        // Apply voice threshold - only show bars when there's actual sound
        const threshold = 0.1
        const finalAmplitude = normalizedAmplitude > threshold ? normalizedAmplitude : 0

        newAmplitudeData.push(finalAmplitude)
      }

      // Detect if voice is present
      const averageEnergy = totalEnergy / barCount
      setIsVoiceDetected(averageEnergy > 15)

      setAmplitudeData(newAmplitudeData)
      drawWaveform(newAmplitudeData)

      animationFrameIdRef.current = requestAnimationFrame(draw)
    }

    draw()
  }

  const drawWaveform = (amplitudes: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    let lineCount = amplitudes.length;
    let gap = 4;
    let lineWidth = 4;
    let totalWidth = lineCount * lineWidth + (lineCount - 1) * gap;
    // Responsif: jika terlalu lebar, kecilkan gap dan lineWidth
    if (totalWidth > width) {
      const scale = width / totalWidth;
      gap = Math.max(1, gap * scale);
      lineWidth = Math.max(1, lineWidth * scale);
      totalWidth = lineCount * lineWidth + (lineCount - 1) * gap;
    }
    // Pusatkan benar-benar di tengah canvas
    const startX = Math.round((width - totalWidth) / 2);

    const centerY = height / 2;
    const maxLineHeight = height * 0.9 / 2;

    amplitudes.forEach((amplitude, index) => {
      const x = startX + index * (lineWidth + gap) + lineWidth / 2;
      const lineHeight = amplitude * maxLineHeight;
      ctx.beginPath();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.moveTo(x, centerY - lineHeight);
      ctx.lineTo(x, centerY + lineHeight);
      ctx.stroke();
    });
  }

  const cleanup = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setAmplitudeData(new Array(80).fill(0))
    setIsVoiceDetected(false)
  }

  return (
    <AnimatePresence>
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute inset-0 bg-white rounded-3xl border border-gray-200 shadow-lg z-50 overflow-hidden"
        >
          {/* Header with recording indicator */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="w-2 h-2 bg-red-500 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">
                {isVoiceDetected ? "Listening..." : "Speak now"}
              </span>
            </div>

            {/* Action buttons in header */}
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onCancel}
                  size="sm"
                  variant="ghost"
                  className="w-8 h-8 p-0 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onAccept}
                  size="sm"
                  variant="ghost"
                  className="w-8 h-8 p-0 hover:bg-gray-100 rounded-full"
                >
                  <Check className="w-4 h-4 text-teal-600" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Waveform container - contained within card */}
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full">
              <div ref={containerRef} className="w-full"><canvas ref={canvasRef} width={canvasWidth} height={80} className="w-full h-20 px-10 rounded-lg" style={{ maxWidth: '100%' }} /></div>
            </div>
          </div>

          {/* Footer with instructions */}
          <div className="p-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              {isVoiceDetected ? "Voice detected - keep speaking" : "Start speaking to see waveform"}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function ChatInterface({ textContent, onRegenerate, onSpeak, onCopy }: ChatActionsProps) {
  const [selectedModel, setSelectedModel] = useState<AIModel>("google-gemini")
  const [user, setUser] = useState<any>(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const router = useRouter()
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [isLogoHovered, setIsLogoHovered] = useState(false)
  const [showBottomCard, setShowBottomCard] = useState(false)
  const [activeMembershipType, setActiveMembershipType] = useState<"free" | "plus" | "pro">("free")
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportDetails, setReportDetails] = useState("")

  // Avatar URL state
  const [avatarUrl, setAvatarUrl] = useState<string>("")

  // Image upload states
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Enhanced audio recording states
  const [isRecording, setIsRecording] = useState(false)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (!currentUser) {
          router.push("/login")
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      } finally {
        setIsAuthChecking(false)
      }
    }

    checkAuth()
  }, [router])

  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string }[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [currentLanguageIndex, setCurrentLanguageIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [isErasing, setIsErasing] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const fullTextRef = useRef(translations[0].text)
  const [aiTypingText, setAiTypingText] = useState("")
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reportChecks, setReportChecks] = useState<{ [k: string]: boolean }>({})
  const reportOptions = [
    "Konten tidak pantas",
    "Informasi yang salah",
    "Spam atau berulang",
    "Melanggar kebijakan",
    "Lainnya",
  ]

  const handleLike = () => {
    setLiked(!liked)
    if (disliked) setDisliked(false)
  }

  const handleDislike = () => {
    setDisliked(!disliked)
    if (liked) setLiked(false)
  }

  const handleShare = (type: string) => {
    switch (type) {
      case "PDF":
        console.log("Exporting to PDF...")
        break
      case "Word":
        console.log("Exporting to Word...")
        break
      case "Gmail":
        const subject = encodeURIComponent("Shared Chat Content")
        const body = encodeURIComponent(textContent)
        window.open(`mailto:?subject=${subject}&body=${body}`)
        break
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent)
    onCopy?.(textContent)
  }

  const handleReportSend = () => {
    if (reportReason) {
      console.log("Report sent:", { reason: reportReason, details: reportDetails })
      setReportOpen(false)
      setReportReason("")
      setReportDetails("")
    }
  }

  const [isSpeaking, setIsSpeaking] = useState(false)
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = (text: string) => {
    if (!window.speechSynthesis) {
      alert("Browser tidak mendukung text-to-speech.")
      return
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    const utter = new window.SpeechSynthesisUtterance(text)
    utter.lang = "id-ID"
    utter.onstart = () => setIsSpeaking(true)
    utter.onend = () => setIsSpeaking(false)
    utter.onerror = () => setIsSpeaking(false)
    ttsUtteranceRef.current = utter
    window.speechSynthesis.speak(utter)
  }

  // Close image preview modal on ESC key
  useEffect(() => {
    if (!isModalOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isModalOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Typing animation effect
  useEffect(() => {
    let timeout: NodeJS.Timeout

    fullTextRef.current = translations[currentLanguageIndex].text

    if (isTyping && !isErasing) {
      if (displayText.length < fullTextRef.current.length) {
        timeout = setTimeout(() => {
          setDisplayText(fullTextRef.current.substring(0, displayText.length + 1))
        }, 50)
      } else {
        timeout = setTimeout(() => {
          setIsErasing(true)
        }, 100)
      }
    }

    if (isErasing) {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1))
        }, 50)
      } else {
        setIsErasing(false)
        setCurrentLanguageIndex((prevIndex) => (prevIndex === translations.length - 1 ? 0 : prevIndex + 1))
      }
    }

    return () => clearTimeout(timeout)
  }, [displayText, isTyping, isErasing, currentLanguageIndex])

  // Custom input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  // Handle keyboard events for Ctrl+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      const newValue = input.substring(0, start) + "\n" + input.substring(end)
      setInput(newValue)

      setTimeout(() => {
        target.setSelectionRange(start + 1, start + 1)
        target.focus()
      }, 0)
    } else if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault()
      if (input.trim() || imageFiles.length > 0) {
        const form = e.currentTarget.closest("form")
        if (form) {
          form.requestSubmit()
        }
      }
    }
  }

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newFiles = files.slice(0, 3 - imageFiles.length)
    setImageFiles((prev) => [...prev, ...newFiles].slice(0, 3))
    setImagePreviews((prev) => [...prev, ...newFiles.map((file) => URL.createObjectURL(file))].slice(0, 3))
  }

  // Upload image to Supabase Storage and return public URL
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from("chat-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false })

      if (error || !data) {
        console.error("Supabase upload error:", error, data)
        alert(
          "Gagal upload gambar.\n" +
          (typeof error === "string" ? error : error?.message || "Unknown error") +
          "\nCek quota storage, ukuran file, dan permission bucket chat-images.",
        )
        return null
      }

      const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(fileName)

      if (!urlData?.publicUrl) {
        console.error("Get public URL error: No publicUrl found", urlData)
        alert(
          "Gagal mendapatkan URL gambar.\n" + "Tidak ditemukan publicUrl.\nPastikan bucket chat-images sudah public.",
        )
        return null
      }

      return urlData.publicUrl
    } catch (err: any) {
      console.error("UploadImage Exception:", err)
      alert("Terjadi error saat upload gambar: " + (err?.message || err))
      return null
    }
  }

  // Custom submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const imageUrls: string[] = []
    for (const file of imageFiles) {
      const url = await uploadImage(file)
      if (url) imageUrls.push(url)
    }
    let content = imageUrls.map((url) => url).join("\n")
    if (input) content += (content ? "\n" : "") + input

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setImageFiles([])
    setImagePreviews([])
    setIsLoading(true)
    setIsAiTyping(false)
    setAiTypingText("")

    try {
      const messageHistory: Message[] = messages.concat(userMessage).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await aiService.generateCompletion(selectedModel, messageHistory)

      setIsAiTyping(true)
      let i = 0
      const text = response.text
      setAiTypingText("")
      const typeChar = () => {
        if (i <= text.length) {
          setAiTypingText(text.slice(0, i))
          i++
          setTimeout(typeChar, 18)
        } else {
          setIsAiTyping(false)
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant" as const,
              content: text,
            },
          ])
          setAiTypingText("")
        }
      }
      typeChar()
    } catch (error) {
      console.error("AI error:", error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: "Sorry, I encountered an error while processing your request. Please try again.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
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
      localStorage.removeItem("user")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded)
  }

  const toggleBottomCard = () => {
    setShowBottomCard(!showBottomCard)
  }

  // Fetch membership_type dari payment Supabase
  useEffect(() => {
    const fetchMembership = async () => {
      if (!user?.email) {
        setActiveMembershipType("free")
        return
      }
      const { data } = await supabase
        .from("payment")
        .select("membership_type, created_at, status")
        .eq("email", user.email)
        .eq("status", "success")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      if (data && data.membership_type) {
        setActiveMembershipType(data.membership_type as "free" | "plus" | "pro")
      } else {
        setActiveMembershipType("free")
      }
    }
    fetchMembership()
  }, [user?.email])

  const isModelUnlocked = (modelId: string) => {
    if (activeMembershipType === "pro") return true
    if (activeMembershipType === "plus") return modelId === "google-gemini" || modelId === "deepseek-v3"
    return modelId === "google-gemini"
  }

  // Update avatar URL when user data changes
  useEffect(() => {
    if (user?.foto_profile) {
      setAvatarUrl(user.foto_profile)
    } else if (user?.nama_lengkap) {
      setAvatarUrl(`https://api.dicebear.com/6.x/initials/svg?seed=${user.nama_lengkap}`)
    } else {
      setAvatarUrl("")
    }
  }, [user?.foto_profile, user?.nama_lengkap])

  // Speech recognition states
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  // Update input with transcript when listening stops
  useEffect(() => {
    if (!listening && transcript) {
      setInput((prev) => (prev ? prev + " " + transcript : transcript))
      resetTranscript()
    }
  }, [listening, transcript, resetTranscript])

  // Enhanced audio recording functions
  const startEnhancedRecording = async () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Browser does not support speech recognition.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      setAudioStream(stream)
      setIsRecording(true)
      resetTranscript()
      SpeechRecognition.startListening({ continuous: true, language: "id-ID" })
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Could not access microphone. Please check permissions.")
    }
  }

  const stopEnhancedRecording = () => {
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop())
      setAudioStream(null)
    }
    setIsRecording(false)
    SpeechRecognition.stopListening()
  }

  const handleAcceptVoice = () => {
    if (transcript) {
      setInput((prev) => (prev ? prev + (prev.endsWith("\n") ? "" : "\n") + transcript : transcript))
    }
    stopEnhancedRecording()
  }

  const handleCancelVoice = () => {
    resetTranscript()
    stopEnhancedRecording()
  }

  const handleMicButton = async () => {
    if (isRecording) {
      stopEnhancedRecording()
    } else {
      await startEnhancedRecording()
    }
  }

  // If still checking auth, show a loading state
  if (isAuthChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
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
        className={`bg-white border-r border-gray-200 text-gray-900 lg:flex hidden flex-col transition-all duration-300 ease-in-out ${isSidebarExpanded ? "w-72" : "w-[69px]"
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
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            <Button
              onClick={startNewChat}
              variant="ghost"
              className={`w-full hover:text-gray-900 hover:bg-gray-100 rounded-xl ${isSidebarExpanded ? "justify-start" : "justify-center"
                }`}
            >
              <Plus className="w-4 h-4 min-w-[16px]" />
              {isSidebarExpanded && <span className="ml-3">New chat</span>}
            </Button>

            <Button
              variant="ghost"
              className={`w-full hover:text-gray-900 hover:bg-gray-100 rounded-xl ${isSidebarExpanded ? "justify-start" : "justify-center"
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
                ${activeMembershipType === "pro"
                  ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-white shadow-[0_0_15px_rgba(245,158,11,0.6)] border-2 border-amber-300"
                  : activeMembershipType === "plus"
                    ? "ring-2 ring-teal-500 ring-offset-2 ring-offset-white shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                    : ""
                }
              `}
              style={{ backgroundColor: "#14b8a6", overflow: "hidden" }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl || "/placeholder.svg"}
                  alt={user?.nama_lengkap || "User"}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-sm font-medium text-white">
                  {user?.nama_lengkap ? user.nama_lengkap[0].toUpperCase() : "U"}
                </span>
              )}
            </div>
            {isSidebarExpanded && (
              <>
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-medium truncate">{user?.email || "User"}</div>
                  <div className="text-xs text-gray-400">
                    {activeMembershipType === "pro"
                      ? "Pro Plan"
                      : activeMembershipType === "plus"
                        ? "Plus Plan"
                        : "Free Plan"}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180" : ""}`}
                />
              </>
            )}
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div
              className={`absolute bottom-full ${isSidebarExpanded ? "left-2" : "left-16"} w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 mb-2 z-10`}
            >
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
          <div className="flex items-center space-x-4">
            <Select
              value={selectedModel}
              onValueChange={(value) => {
                if (isModelUnlocked(value)) setSelectedModel(value as AIModel)
              }}
            >
              <SelectTrigger className="w-48 h-12 bg-white text-black border-2 border-gray-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto bg-white border-2 border-gray-200 text-black rounded-xl">
                {models.map((model) => {
                  const unlocked = isModelUnlocked(model.id)
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
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-3 lg:block hidden">
            <div className="flex items-center space-x-2 text-sm text-teal-800">
              <Sparkles className="w-4 h-4" />
              <span>Subscribe to a Pro plan for increased message limits</span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
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
                <form onSubmit={onSubmit}>
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative inline-block mr-2">
                      <Image
                        src={preview || "/placeholder.svg"}
                        alt={`preview-${idx}`}
                        width={100}
                        height={100}
                        className="rounded-xl object-cover max-h-32 max-w-32"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="absolute -top-2 -right-2 text-white bg-red-500 hover:bg-red-600 border-2 border-white rounded-full w-6 h-6 p-0 shadow-lg"
                        onClick={() => {
                          setImageFiles((files) => files.filter((_, i) => i !== idx))
                          setImagePreviews((previews) => previews.filter((_, i) => i !== idx))
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="w-full">
                    <div className="relative bg-white rounded-3xl border border-gray-200 shadow-lg">
                      {/* Enhanced Waveform Overlay */}
                      <EnhancedWaveform
                        isRecording={isRecording}
                        onAccept={handleAcceptVoice}
                        onCancel={handleCancelVoice}
                        audioStream={audioStream}
                      />

                      {/* Input area */}
                      <div className="relative px-6 py-4">
                        <Textarea
                          value={input}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          placeholder="Minta Silva Menjawab..."
                          className="w-full bg-transparent border-none text-black placeholder-gray-500 text-xl resize-none min-h-[38px] overflow-y-auto"
                          style={{ outline: "none" }}
                          rows={1}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement
                            target.style.height = "auto"
                            target.style.height = Math.min(target.scrollHeight, 128) + "px"
                          }}
                        />
                      </div>

                      {/* Action buttons row */}
                      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={handleImageChange}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-black hover:bg-gray-200 rounded-xl px-3 py-1.5 text-sm"
                              asChild
                            >
                              <span>
                                <Images className="w-4 h-4 mr-2" />
                                Gambar
                              </span>
                            </Button>
                          </label>
                        </div>

                        <div>
                          {input.trim() || imageFiles.length > 0 ? (
                            <Button
                              type={isLoading ? "button" : "submit"}
                              size="sm"
                              className={`rounded-full w-10 h-10 p-0 transition-all ${isLoading
                                  ? "bg-gray-300 hover:bg-gray-600 text-gray-700"
                                  : "bg-teal-600 hover:bg-teal-700 text-white"
                                }`}
                              disabled={isLoading}
                              onClick={isLoading ? () => setIsLoading(false) : undefined}
                            >
                              {isLoading ? <X className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              className={`rounded-full w-10 h-10 p-0 transition-all ${isRecording
                                  ? "bg-red-500 text-white shadow-lg animate-pulse"
                                  : "bg-gray-200 hover:bg-gray-300 hover:text-gray-600 text-gray-400"
                                }`}
                              onClick={handleMicButton}
                              aria-label={isRecording ? "Stop recording" : "Start recording"}
                            >
                              <Mic className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <Button
                    asChild
                    className="flex items-center space-x-1 px-4 py-2 border border-gray-300 transition-all duration-200 ease-in-out cursor-pointer hover:bg-teal-600 hover:text-white hover:border-teal-600 font-semibold rounded-xl"
                    disabled={isLoading}
                    onClick={() => {
                      setIsLoading(true)
                      setTimeout(() => setIsLoading(false), 4000)
                    }}
                  >
                    <Link href="/pricing">
                      <Crown className="w-4 h-4" />
                      <span>Join Silva Pro</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages Area */
            <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto">
              <div
                className="flex-1 overflow-y-auto px-6 pt-6 pb-24 scrollbar-none min-h-0"
                style={{ maxHeight: "calc(100vh - 120px)" }}
              >
                <div className="space-y-3 w-full">
                  {messages.map((message, idx) => {
                    const isLastAi =
                      message.role === "assistant" && idx === messages.length - 1 && (isAiTyping || aiTypingText)

                    const imageUrlMatch = message.content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|svg)/i)
                    const textContent = imageUrlMatch
                      ? message.content.replace(imageUrlMatch[0], "").trim()
                      : message.content

                    return (
                      <div
                        key={message.id}
                        className={`flex flex-col gap-1 ${message.role === "user" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`ai-bubble max-w-[75%] sm:max-w-[70%] px-4 py-2.5 mb-0 last:mb-0 min-h-0 h-auto items-start align-middle 
                            ${message.role === "user"
                              ? "bg-teal-600 text-white rounded-tl-2xl rounded-br-2xl rounded-bl-2xl"
                              : "bg-white border border-gray-200 text-gray-900 shadow-sm rounded-tr-2xl rounded-br-2xl rounded-bl-2xl"
                            }`}
                        >
                          {imageUrlMatch && (
                            <img
                              src={imageUrlMatch[0] || "/placeholder.svg"}
                              alt="uploaded"
                              className="mb-2 rounded-xl max-w-full h-auto"
                              style={{ maxHeight: 220 }}
                            />
                          )}
                          <div className="whitespace-pre-wrap break-words leading-relaxed">
                            {isLastAi && aiTypingText ? aiTypingText : textContent}
                          </div>
                        </div>

                        {message.role === "assistant" && (
                          <TooltipProvider>
                            <div className="flex mt-1 items-center text-gray-500">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={handleLike}
                                      className="hover:bg-gray-50 hover:text-teal-600 transition-colors duration-200"
                                    >
                                      <motion.div
                                        animate={{
                                          scale: liked ? [1, 1.2, 1] : 1,
                                          rotate: liked ? [0, -10, 10, 0] : 0,
                                        }}
                                        transition={{ duration: 0.3 }}
                                      >
                                        <ThumbsUp
                                          className={`w-4 h-4 transition-all duration-200 ${liked ? "fill-teal-500 text-teal-500" : ""
                                            }`}
                                        />
                                      </motion.div>
                                    </Button>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-white text-black border-gray-200 rounded">
                                  <p>Suka</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={handleDislike}
                                      className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                                    >
                                      <motion.div
                                        animate={{
                                          scale: disliked ? [1, 1.2, 1] : 1,
                                          rotate: disliked ? [0, 10, -10, 0] : 0,
                                        }}
                                        transition={{ duration: 0.3 }}
                                      >
                                        <ThumbsDown
                                          className={`w-4 h-4 transition-all duration-200 ${disliked ? "fill-red-500 text-red-500" : ""}`}
                                        />
                                      </motion.div>
                                    </Button>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-white text-black border-gray-200 rounded">
                                  <p>Tidak suka</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={onRegenerate}
                                      className="hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                                    >
                                      <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                                        <RefreshCw className="w-4 h-4" />
                                      </motion.div>
                                    </Button>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-white text-black border-gray-200 rounded">
                                  <p>Ulangi</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => speak(textContent)}
                                      className="hover:bg-gray-50 hover:text-purple-600 transition-colors duration-200"
                                    >
                                      <Volume2
                                        className={`w-4 h-4 ${isSpeaking ? "text-teal-600 animate-pulse" : ""}`}
                                      />
                                    </Button>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-white text-black border-gray-200 rounded">
                                  <p>Dengarkan</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="hover:bg-gray-50 hover:text-orange-600 transition-colors duration-200"
                                        >
                                          <Share2 className="w-4 h-4" />
                                        </Button>
                                      </motion.div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      className="w-48 p-2 rounded bg-white text-black border border-gray-200"
                                      align="start"
                                    >
                                      <DropdownMenuItem
                                        onClick={() => handleShare("PDF")}
                                        className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded-md p-2"
                                      >
                                        <FileText className="w-4 h-4 text-red-500" />
                                        <span>Ekspor ke PDF</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleShare("Word")}
                                        className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded-md p-2"
                                      >
                                        <Download className="w-4 h-4 text-blue-500" />
                                        <span>Ekspor ke Word</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleShare("Gmail")}
                                        className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded-md p-2"
                                      >
                                        <Mail className="w-4 h-4 text-green-500" />
                                        <span>Kirim via Gmail</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TooltipTrigger>
                                <TooltipContent className="bg-white text-black border-gray-200 rounded">
                                  <p>Bagikan</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={handleCopy}
                                      className="hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200"
                                    >
                                      <CopyIcon className="w-4 h-4" />
                                    </Button>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-white text-black border-gray-200 rounded">
                                  <p>Salin</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                                    <DialogTrigger asChild>
                                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="hover:bg-gray-50 hover:text-red-600 transition-colors duration-200"
                                        >
                                          <Flag className="w-4 h-4" />
                                        </Button>
                                      </motion.div>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md bg-white">
                                      <DialogHeader className="space-y-3">
                                        <DialogTitle className="text-xl font-semibold text-gray-900">
                                          Laporkan Chat
                                        </DialogTitle>
                                        <p className="text-sm text-gray-600">
                                          Bantu kami meningkatkan layanan dengan melaporkan konten yang tidak sesuai.
                                        </p>
                                      </DialogHeader>

                                      <div className="space-y-4 py-4">
                                        <div className="space-y-3">
                                          <Label className="text-sm font-medium text-gray-700">
                                            Pilih alasan laporan:
                                          </Label>
                                          <div className="space-y-2">
                                            {reportOptions.map((option) => (
                                              <label
                                                key={option}
                                                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                                              >
                                                <Checkbox
                                                  checked={reportReason === option}
                                                  onCheckedChange={(checked) => {
                                                    if (checked) setReportReason(option)
                                                  }}
                                                  className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600 border border-gray-300 rounded"
                                                />
                                                <span className="text-sm text-gray-700">{option}</span>
                                              </label>
                                            ))}
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor="details" className="text-sm font-medium text-gray-700">
                                            Detail tambahan (opsional):
                                          </Label>
                                          <Textarea
                                            id="details"
                                            placeholder="Berikan detail lebih lanjut tentang masalah ini..."
                                            value={reportDetails}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                              setReportDetails(e.target.value)
                                            }
                                            className="min-h-[80px] resize-none rounded bg-white border border-gray-200"
                                          />
                                        </div>
                                      </div>

                                      <DialogFooter className="flex gap-2 pt-1">
                                        <Button
                                          variant="outline"
                                          onClick={() => setReportOpen(false)}
                                          className="flex-1 rounded bg-white text-black border border-gray-200 hover:bg-gray-200 hover:text-black"
                                        >
                                          Batal
                                        </Button>
                                        <Button
                                          onClick={handleReportSend}
                                          disabled={!reportReason}
                                          className="flex-1 rounded bg-red-500 hover:bg-red-600 text-white"
                                        >
                                          Kirim Laporan
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </TooltipTrigger>
                                <TooltipContent className="bg-white text-black border-gray-200 rounded">
                                  <p>Laporkan</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        )}
                      </div>
                    )
                  })}

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

              {/* Input Form - Fixed at bottom */}
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative inline-block mr-2 mb-4">
                  <Image
                    src={preview || "/placeholder.svg"}
                    alt={`preview-${idx}`}
                    width={100}
                    height={100}
                    className="rounded-xl object-cover max-h-32 max-w-32"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="absolute -top-2 -right-2 text-white bg-red-500 hover:bg-red-600 border-2 border-white rounded-full w-6 h-6 p-0 shadow-lg"
                    onClick={() => {
                      setImageFiles((files) => files.filter((_, i) => i !== idx))
                      setImagePreviews((previews) => previews.filter((_, i) => i !== idx))
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <div className="w-full">
                <div className="relative mb-2 bg-white rounded-3xl border border-gray-200 shadow-lg">
                  {/* Enhanced Waveform Overlay */}
                  <EnhancedWaveform
                    isRecording={isRecording}
                    onAccept={handleAcceptVoice}
                    onCancel={handleCancelVoice}
                    audioStream={audioStream}
                  />

                  {/* Input area */}
                  <div className="relative px-6 py-4">
                    <Textarea
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Minta Silva Menjawab..."
                      className="w-full bg-transparent border-none text-black placeholder-gray-500 text-xl resize-none min-h-[38px] overflow-y-auto"
                      style={{ outline: "none" }}
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = "auto"
                        target.style.height = Math.min(target.scrollHeight, 128) + "px"
                      }}
                    />
                  </div>

                  {/* Action buttons row */}
                  <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-black hover:bg-gray-200 rounded-xl px-3 py-1.5 text-sm"
                          asChild
                        >
                          <span>
                            <Images className="w-4 h-4 mr-2" />
                            Gambar
                          </span>
                        </Button>
                      </label>
                    </div>

                    <div>
                      {input.trim() || imageFiles.length > 0 ? (
                        <Button
                          type={isLoading ? "button" : "submit"}
                          size="sm"
                          className={`rounded-full w-10 h-10 p-0 transition-all ${isLoading
                              ? "bg-gray-300 hover:bg-gray-600 text-gray-700"
                              : "bg-teal-600 hover:bg-teal-700 text-white"
                            }`}
                          disabled={isLoading}
                          onClick={isLoading ? () => setIsLoading(false) : undefined}
                        >
                          {isLoading ? <X className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          className={`rounded-full w-10 h-10 p-0 transition-all ${isRecording
                              ? "bg-red-500 text-white shadow-lg animate-pulse"
                              : "bg-gray-200 hover:bg-gray-300 hover:text-gray-600 text-gray-400"
                            }`}
                          onClick={handleMicButton}
                          aria-label={isRecording ? "Stop recording" : "Start recording"}
                        >
                          <Mic className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Toggle Button */}
        <div className="fixed bottom-12 left-0 right-0 flex justify-center lg:hidden z-20">
          <Button
            onClick={toggleBottomCard}
            className={`rounded-tr-xl rounded-tl-xl w-12 h-12 bg-teal-600 hover:bg-teal-700 text-white shadow-lg transition-transform ${showBottomCard ? "rotate-180" : ""
              }`}
          >
            <ArrowUp className="w-full h-full" />
          </Button>
        </div>

        {/* Overlay when bottom card is open */}
        {showBottomCard && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden" onClick={toggleBottomCard}></div>
        )}

        {/* Bottom Action Card - Mobile Only */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: showBottomCard ? 0 : "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-white text-gray-900 rounded-t-3xl p-6 z-40 lg:hidden"
          style={{ maxHeight: "80vh", overflowY: "auto" }}
        >
          <div className="flex justify-center mb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl || "/placeholder.svg"}
                    alt={user?.nama_lengkap || "User"}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-sm font-medium text-white">
                    {user?.nama_lengkap ? user.nama_lengkap[0].toUpperCase() : "U"}
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm font-medium">{user?.email || "User"}</div>
                <div className="text-xs text-gray-400">Free Plan</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="flex items-center justify-start gap-3 h-14 bg-gray-50 border border-gray-200 rounded-xl hover:bg-teal-50 hover:border-teal-200 hover:text-gray-900"
                onClick={() => {
                  startNewChat()
                  setShowBottomCard(false)
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

        {/* Footer */}
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
