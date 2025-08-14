"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Search, Brain, Play, CheckCircle, X, RotateCcw, Timer, Trophy, ArrowLeft, Home } from "lucide-react"
import Navbar from "@/components/widget/navbar"
import Footer from "@/components/widget/footer"
import ConfettiAnimation from "@/components/widget/celebration-confetti"

type Screen = "home" | "game1" | "game2" | "completed"

const medicineImages = [
  "/images/obat/Darah/Asam Folat.png",
  "/images/obat/Darah/Clopidogrel.png",
  "/images/obat/Darah/Ferrous-Sulfate.png",
  "/images/obat/Darah/Sangobion.png",
  "/images/obat/Darah/Warfarin 2mg.png",
]

export default function AntiFakeMedicineGames() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [score, setScore] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [gameProgress, setGameProgress] = useState(0)
  const [timer, setTimer] = useState(120)
  const [memoryCards, setMemoryCards] = useState<
    Array<{ id: number; flipped: boolean; matched: boolean; image: string }>
  >([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [showConfetti, setShowConfetti] = useState(false)

  const QUIZ_DURATION_SECONDS = 120
  const MEMORY_DURATION_SECONDS = 120

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const mm = String(minutes).padStart(2, "0")
    const ss = String(seconds).padStart(2, "0")
    return `${mm}:${ss}`
  }

  const initializeMemoryGame = () => {
    const cards = []
    for (let i = 0; i < 8; i++) {
      cards.push(
        { id: i * 2, flipped: false, matched: false, image: medicineImages[i % 4] },
        { id: i * 2 + 1, flipped: false, matched: false, image: medicineImages[i % 4] },
      )
    }
    setMemoryCards(cards.sort(() => Math.random() - 0.5))
    setFlippedCards([])
    setScore(0)
    setTimer(MEMORY_DURATION_SECONDS)
  }

  const handleCardFlip = (cardId: number) => {
    if (timer <= 0) return
    if (flippedCards.length === 2) return
    if (memoryCards[cardId].flipped || memoryCards[cardId].matched) return

    const newCards = [...memoryCards]
    newCards[cardId].flipped = true
    setMemoryCards(newCards)

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    if (newFlippedCards.length === 2) {
      const [first, second] = newFlippedCards
      if (newCards[first].image === newCards[second].image) {
        // Match found
        setTimeout(() => {
          newCards[first].matched = true
          newCards[second].matched = true
          setMemoryCards([...newCards])
          setFlippedCards([])
          setScore((prev) => prev + 10)
        }, 1000)
      } else {
        // No match
        setTimeout(() => {
          newCards[first].flipped = false
          newCards[second].flipped = false
          setMemoryCards([...newCards])
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null || timer <= 0) return
    setSelectedAnswer(answer)
    setScore((prev) => prev + (answer === "asli" ? 10 : 5))
    setTimeout(() => {
      handleNextQuestion()
    }, 800)
  }

  const finishGame = () => {
    setCurrentScreen("completed")
    setShowConfetti(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < 4) {
      setCurrentQuestion((prev) => prev + 1)
      setGameProgress((prev) => prev + 20)
      setSelectedAnswer(null)
    } else {
      // Game completed
      finishGame()
    }
  }

  // Detect completion for Memory game (all matched)
  useEffect(() => {
    if (currentScreen === "game2" && memoryCards.length > 0) {
      const allMatched = memoryCards.every((c) => c.matched)
      if (allMatched) {
        finishGame()
      }
    }
  }, [memoryCards, currentScreen])

  // Start countdown when entering a game screen
  useEffect(() => {
    if (currentScreen === "game1" || currentScreen === "game2") {
      setTimer(currentScreen === "game1" ? QUIZ_DURATION_SECONDS : MEMORY_DURATION_SECONDS)
      const intervalId = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId)
            finishGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(intervalId)
    }
  }, [currentScreen])

  if (currentScreen === "home") {
    return (
      <div className="min-h-screen bg-white mt-24">
        <Navbar />
        {showConfetti && <ConfettiAnimation />}
        <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-teal-800 mb-4">Anti Fake Medicine Games</h1>
            <p className="text-lg text-teal-600 max-w-2xl mx-auto">
              Tingkatkan kemampuan Anda dalam mendeteksi obat palsu melalui permainan edukatif yang menyenangkan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-lg overflow-hidden rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-8 rounded-t-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Search className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">Obat Asli atau Palsu?</CardTitle>
                    <CardDescription className="text-teal-100 text-base">
                      Uji kemampuan Anda mengenali obat asli dan palsu
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 rounded-b-2xl">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Tantang diri Anda untuk mengidentifikasi keaslian obat berdasarkan kemasan, label, dan karakteristik
                  visual lainnya.
                </p>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />5 Pertanyaan
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      ~3 menit
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setCurrentScreen("game1")}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-lg font-semibold rounded-2xl"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Mulai Bermain
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-lg overflow-hidden rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-8 rounded-t-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Brain className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">Memory Obat</CardTitle>
                    <CardDescription className="text-cyan-100 text-base">
                      Cocokkan kartu obat dengan benar
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 rounded-b-2xl">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Latih daya ingat Anda dengan mencocokkan pasangan kartu obat yang sama dalam waktu terbatas.
                </p>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      16 Kartu
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      60 detik
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setCurrentScreen("game2")
                    initializeMemoryGame()
                  }}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 text-lg font-semibold rounded-2xl"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Mulai Bermain
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border-0">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mengapa Penting Mendeteksi Obat Palsu?</h2>
              <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Obat palsu dapat membahayakan kesehatan dan bahkan mengancam nyawa. Dengan bermain game ini, Anda akan
                belajar mengenali ciri-ciri obat asli dan palsu untuk melindungi diri dan keluarga.
              </p>
            </div>
          </div>
        </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (currentScreen === "game1") {
    return (
      <div className="min-h-screen bg-white mt-24">
        <Navbar />
        {showConfetti && <ConfettiAnimation />}
        <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button variant="outline" onClick={() => setCurrentScreen("home")} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-600">Skor: {score}</div>
                <div className="text-sm text-gray-500">Waktu: {formatTime(timer)}</div>
              </div>
          </div>

          <div className="mb-8">
            <Progress value={gameProgress} className="h-3 bg-gray-200" />
            <p className="text-sm text-gray-500 mt-2 text-center">{gameProgress}% selesai</p>
          </div>

          <Card className="bg-white shadow-xl border-0 overflow-hidden rounded-2xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="relative group">
                  <div className="relative w-full max-w-xs mx-auto aspect-square [perspective:1000px]">
                    <div
                      className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${selectedAnswer ? '[transform:rotateY(180deg)]' : ''}`}
                    >
                      <div className="absolute inset-0 [backface-visibility:hidden]">
                        <img
                          src={medicineImages[currentQuestion] || "/placeholder.svg"}
                          alt="Medicine to identify"
                          className="w-full h-full rounded-2xl shadow-xl object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border">
                        <div className="text-center p-6">
                          <Trophy className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                          <div className="text-gray-700 font-medium">Jawaban Tersimpan</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Apakah obat ini asli atau palsu?</h2>
                  <p className="text-gray-600 mb-6">Pilih jawaban Anda. Pertanyaan akan lanjut otomatis.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleAnswerSelect("asli")}
                      disabled={selectedAnswer !== null}
                      className={`py-6 text-lg font-semibold rounded-2xl transition-all ${
                        selectedAnswer === "asli"
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-green-100 hover:bg-green-200 text-green-800"
                      }`}
                    >
                      <CheckCircle className="w-6 h-6 mr-2" />
                      Asli ✅
                    </Button>
                    <Button
                      onClick={() => handleAnswerSelect("palsu")}
                      disabled={selectedAnswer !== null}
                      className={`py-6 text-lg font-semibold rounded-2xl transition-all ${
                        selectedAnswer === "palsu"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-red-100 hover:bg-red-200 text-red-800"
                      }`}
                    >
                      <X className="w-6 h-6 mr-2" />
                      Palsu ❌
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (currentScreen === "game2") {
    return (
      <div className="min-h-screen bg-white mt-24">
        <Navbar />
        {showConfetti && <ConfettiAnimation />}
        <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button variant="outline" onClick={() => setCurrentScreen("home")} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600">⏱️ {formatTime(timer)}</div>
                <div className="text-sm text-gray-500">Waktu</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">🏆 {score}</div>
                <div className="text-sm text-gray-500">Skor</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
            {memoryCards.map((card, index) => (
              <div
                key={index}
                onClick={() => handleCardFlip(index)}
                className={`aspect-square rounded-2xl cursor-pointer transition-all duration-300 [perspective:800px] ${
                  card.flipped || card.matched
                    ? ''
                    : ''
                }`}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
                    card.flipped || card.matched ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-500 shadow-md hover:shadow-lg [backface-visibility:hidden] flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-white shadow-lg [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden">
                    <img
                      src={card.image || "/placeholder.svg"}
                      alt="Medicine card"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={initializeMemoryGame}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 text-lg font-semibold rounded-2xl"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Mulai Ulang
            </Button>
          </div>
        </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (currentScreen === "completed") {
    return (
      <div className="min-h-screen bg-white mt-24">
        <Navbar />
        {showConfetti && <ConfettiAnimation />}
        <div className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white border border-gray-200 overflow-hidden rounded-2xl">
              <CardContent className="p-10 text-center">
                <div className="mb-6">
                  <Trophy className="w-12 h-12 text-teal-600 mx-auto" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat!</h2>
                <p className="text-gray-600 mb-8">Kamu telah menyelesaikan permainan. Skor kamu: <span className="font-semibold text-teal-700">{score}</span></p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setCurrentScreen("home")
                      setShowConfetti(false)
                      setCurrentQuestion(0)
                      setGameProgress(0)
                      setSelectedAnswer(null)
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    Kembali ke Beranda
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentScreen("game1")
                      setShowConfetti(false)
                      setScore(0)
                      setCurrentQuestion(0)
                      setGameProgress(0)
                      setSelectedAnswer(null)
                    }}
                    className="px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    Main Lagi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return null
}
