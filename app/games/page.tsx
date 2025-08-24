"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Search, Brain, Play, CheckCircle, X, RotateCcw, Timer, Trophy, ArrowLeft, Home, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Navbar from "@/components/widget/navbar";
import Footer from "@/components/widget/footer";
import { addGameResult, loadUserProgress, BADGE_RULES } from "@/lib/badgeSystem";
import ConfettiAnimation from "@/components/widget/celebration-confetti";
import { authService } from "@/lib/auth"
import FooterBanner from "@/components/widget/footer-banner"

type Screen = "home" | "game1" | "game2" | "completed" | "lost";

type Difficulty = "easy" | "medium" | "hard";

const medicineImages = [
  "/images/obat/Darah/Asam Folat.png",
  "/images/obat/Darah/Clopidogrel.png",
  "/images/obat/Darah/Ferrous-Sulfate.png",
  "/images/obat/Darah/Sangobion.png",
  "/images/obat/Darah/Warfarin 2mg.png",
  "/images/obat/Darah/Asam Traneksamat 500mg.png",
  "/images/obat/Darah/Epoetin Alfa Injection.png",
  "/images/obat/Darah/Vitamin B12 (Cyanocobalamin).png",
  "/images/obat/Darah/Vitamin K (Phytomenadione).png",
];

export default function AntiFakeMedicineGames() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameProgress, setGameProgress] = useState(0);
  const [timer, setTimer] = useState(120);
  const [memoryCards, setMemoryCards] = useState<Array<{ id: number; flipped: boolean; matched: boolean; image: string; pairKey: string }>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("easy");
  const [memoryDurationSeconds, setMemoryDurationSeconds] = useState(60);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!authService.checkSession()); // Initial check

  const QUIZ_DURATION_SECONDS = 120;

  const difficultyConfig: Record<Difficulty, { pairs: number; pointsPerMatch: number; timer: number }> = {
    easy: { pairs: 8, pointsPerMatch: 10, timer: 60 },
    medium: { pairs: 12, pointsPerMatch: 20, timer: 90 },
    hard: { pairs: 18, pointsPerMatch: 30, timer: 120 },
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const initializeMemoryGame = (difficulty: Difficulty = selectedDifficulty) => {
    const config = difficultyConfig[difficulty];
    const cards: Array<{ id: number; flipped: boolean; matched: boolean; image: string; pairKey: string }> = [];
    for (let i = 0; i < config.pairs; i++) {
      const pairKey = `pair-${i}-${Date.now()}`;
      const imagePath = medicineImages[i % medicineImages.length];
      cards.push({ id: i * 2, flipped: false, matched: false, image: imagePath, pairKey }, { id: i * 2 + 1, flipped: false, matched: false, image: imagePath, pairKey });
    }
    setMemoryCards(cards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setScore(0);
    setTimer(config.timer);
    setMemoryDurationSeconds(config.timer);
  };

  const handleCardFlip = (cardId: number) => {
    if (timer <= 0) return;
    if (flippedCards.length === 2) return;
    if (memoryCards[cardId].flipped || memoryCards[cardId].matched) return;

    const newCards = [...memoryCards];
    newCards[cardId].flipped = true;
    setMemoryCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [first, second] = newFlippedCards;
      if (newCards[first].pairKey === newCards[second].pairKey) {
        setTimeout(() => {
          newCards[first].matched = true;
          newCards[second].matched = true;
          setMemoryCards([...newCards]);
          setFlippedCards([]);
          setScore((prev) => prev + difficultyConfig[selectedDifficulty].pointsPerMatch);
        }, 1000);
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setMemoryCards([...newCards]);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null || timer <= 0) return;
    setSelectedAnswer(answer);
    setScore((prev) => prev + (answer === "asli" ? 10 : 5));
    setTimeout(() => {
      handleNextQuestion();
    }, 800);
  };

  const handleStartGame = (game: "game1" | "game2") => {
    const session = authService.checkSession();
    if (!session) {
      window.location.href = "/login";
      return;
    }

    if (game === "game1") {
      setCurrentScreen("game1");
    } else {
      initializeMemoryGame(selectedDifficulty);
      setCurrentScreen("game2");
    }
  };

  const finishGame = () => {
    setCurrentScreen("completed");
    setShowConfetti(true);

    let correct = 0;
    if (currentScreen === "game1") {
      correct = Math.floor(score / 10);
    } else if (currentScreen === "game2") {
      correct = score / difficultyConfig[selectedDifficulty].pointsPerMatch;
    }
    const result = addGameResult({ correct, points: score });

    if (result.newBadges?.length > 0) {
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < 4) {
      setCurrentQuestion((prev) => prev + 1);
      setGameProgress((prev) => prev + 20);
      setSelectedAnswer(null);
    } else {
      finishGame();
    }
  };

  useEffect(() => {
    if (currentScreen === "game2" && memoryCards.length > 0) {
      const allMatched = memoryCards.every((c) => c.matched);
      if (allMatched) {
        finishGame();
      } else if (timer <= 0) {
        setCurrentScreen("lost");
        setShowConfetti(false);
        setPreviousScreen("game2");
      }
    }
  }, [memoryCards, currentScreen, timer]);

  useEffect(() => {
    if (currentScreen === "game1" || currentScreen === "game2") {
      if (currentScreen === "game1") {
        setTimer(QUIZ_DURATION_SECONDS);
      } else {
        setTimer(difficultyConfig[selectedDifficulty].timer);
      }
      const intervalId = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            if (currentScreen === "game1" && currentQuestion < 4) {
              setCurrentScreen("lost");
              setShowConfetti(false);
              setPreviousScreen("game1");
            } else if (currentScreen === "game2") {
              setCurrentScreen("lost");
              setShowConfetti(false);
              setPreviousScreen("game2");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [currentScreen, currentQuestion, selectedDifficulty]);

  useEffect(() => {
    const checkSession = () => {
      const session = authService.checkSession();
      setIsLoggedIn(!!session);
    };

    checkSession();
    const intervalId = setInterval(checkSession, 60000);
    window.addEventListener("storage", checkSession);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", checkSession);
    };
  }, []);

  if (currentScreen === "home") {
    return (
      <div className="min-h-screen bg-white mt-24">
        <Navbar />
        {showConfetti && <ConfettiAnimation />}
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="lg:text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-black mb-1">
                Anti Fake Medicine <span className="text-teal-600 cardo italic">Games</span>
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">Tingkatkan kemampuan anda dalam mendeteksi obat palsu melalui permainan edukatif yang menyenangkan</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-lg overflow-hidden rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-8 rounded-t-2xl">
                  <div className="flex lg:flex-row flex-col lg:items-center items-start gap-4 mb-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Search className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Obat Asli atau Palsu?</CardTitle>
                      <CardDescription className="text-teal-100 text-base">Uji kemampuan anda mengenali obat asli dan palsu</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 rounded-b-2xl">
                  <p className="text-gray-600 mb-6 leading-relaxed">Tantang diri anda untuk mengidentifikasi keaslian obat berdasarkan kemasan,dan visual lainnya.</p>
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
                    onClick={() => handleStartGame("game1")}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg font-semibold rounded-xl"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Mulai Bermain
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-lg overflow-hidden rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-8 rounded-t-2xl">
                  <div className="flex lg:flex-row flex-col lg:items-center items-start gap-4 mb-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Brain className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Memory Obat</CardTitle>
                      <CardDescription className="text-teal-100 text-base">Latih daya ingat anda dengan mencocokkan pasangan kartu obat</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 rounded-b-2xl">
                  <p className="text-gray-600 mb-6 leading-relaxed">Latih daya ingat anda dengan mencocokkan pasangan kartu obat yang sama dalam waktu terbatas.</p>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        {difficultyConfig[selectedDifficulty].pairs * 2} Kartu
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="w-4 h-4" />
                        {difficultyConfig[selectedDifficulty].timer} detik
                      </span>
                    </div>
                  </div>
                  <div className="lg:flex flex-row items-center gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="rounded-xl bg-white w-full text-black border border-gray-200 hover:bg-gray-100 hover:text-black px-4 py-6 text-sm font-medium flex items-center gap-2">
                          <span className={`${selectedDifficulty === "easy" ? "bg-green-500" : selectedDifficulty === "medium" ? "bg-yellow-500" : "bg-red-500"} inline-block w-2.5 h-2.5 rounded-full`} />
                          {selectedDifficulty === "easy" ? "Easy" : selectedDifficulty === "medium" ? "Medium" : "Hard"}
                          <ChevronDown className="w-4 h-4 opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="rounded-xl bg-white text-black border border-gray-200">
                        <DropdownMenuItem onClick={() => setSelectedDifficulty("easy")}>
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-2" />
                          Easy
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedDifficulty("medium")}>
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500 mr-2" />
                          Medium
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedDifficulty("hard")}>
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-2" />
                          Hard
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      onClick={() => handleStartGame("game2")}
                      className="flex-1 lg:mt-0 mt-2 w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg font-semibold rounded-xl"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Mulai Bermain
                    </Button>

                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
              <div className="lg:text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Mengapa Penting Mendeteksi Obat Palsu?</h2>
                <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Obat palsu dapat membahayakan kesehatan dan bahkan mengancam nyawa. Dengan bermain game ini, anda akan belajar mengenali ciri-ciri obat asli dan palsu untuk melindungi diri dan keluarga.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* <FooterBanner /> */}
        <Footer />
      </div>
    );
  }

  if (currentScreen === "game1") {
    return (
      <div className="min-h-screen bg-white mt-24">
        <Navbar />
        {showConfetti && <ConfettiAnimation />}
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Button variant="outline" onClick={() => setCurrentScreen("home")} className="flex rounded-xl bg-white text-black hover:bg-gray-100 hover:text-black  border-0 items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Button>
              <div className="text-right">
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
                      <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${selectedAnswer ? "[transform:rotateY(180deg)]" : ""}`}>
                        <div className="absolute inset-0 [backface-visibility:hidden]">
                          <img src={medicineImages[currentQuestion] || "/placeholder.svg"} alt="Medicine to identify" className="w-full h-full rounded-2xl shadow-xl object-cover" />
                        </div>
                        <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-50 rounded-2xl border">
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
                    <p className="text-gray-600 mb-6">Pilih jawaban anda. Pertanyaan akan lanjut otomatis.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        onClick={() => handleAnswerSelect("asli")}
                        disabled={selectedAnswer !== null}
                        className={`py-6 text-lg font-semibold rounded-2xl transition-all ${selectedAnswer === "asli" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-100 hover:bg-green-200 text-green-800"}`}
                      >
                        <CheckCircle className="w-6 h-6 mr-2" />
                        Asli ✅
                      </Button>
                      <Button
                        onClick={() => handleAnswerSelect("palsu")}
                        disabled={selectedAnswer !== null}
                        className={`py-6 text-lg font-semibold rounded-2xl transition-all ${selectedAnswer === "palsu" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-100 hover:bg-red-200 text-red-800"}`}
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
        <FooterBanner />
        <Footer />
      </div>
    );
  }

  if (currentScreen === "game2") {
    return (
      <div className="min-h-screen bg-white mt-24">
        <Navbar />
        {showConfetti && <ConfettiAnimation />}
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Button variant="outline" onClick={() => setCurrentScreen("home")} className="flex rounded-xl bg-white text-black hover:bg-gray-100 hover:text-black  border-0 items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Button>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">⏱️ {formatTime(timer)}</div>
                  <div className="text-sm text-gray-500">Waktu</div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-wrap gap-4 justify-center">
                  {memoryCards.map((card, index) => (
                    <div
                      key={index}
                      onClick={() => handleCardFlip(index)}
                      className={`w-32 sm:w-32 md:w-32 lg:w-32 aspect-square rounded-2xl cursor-pointer transition-all duration-300 [perspective:800px] ${card.flipped || card.matched ? "" : ""}`}
                    >
                      <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${card.flipped || card.matched ? "[transform:rotateY(180deg)]" : ""}`}>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-500 shadow-md hover:shadow-lg [backface-visibility:hidden] flex items-center justify-center">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute inset-0 rounded-2xl bg-white shadow-lg [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden">
                          <img src={card.image || "/placeholder.svg"} alt="Medicine card" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={() => initializeMemoryGame(selectedDifficulty)} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg font-semibold rounded-2xl">
                <RotateCcw className="w-5 h-5 mr-2" />
                Mulai Ulang
              </Button>
            </div>
          </div>
        </div>
        <FooterBanner />
        <Footer />
      </div>
    );
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
                <p className="text-gray-600 mb-8">
                  Kamu telah menyelesaikan permainan.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setCurrentScreen("home");
                      setShowConfetti(false);
                      setCurrentQuestion(0);
                      setGameProgress(0);
                      setSelectedAnswer(null);
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    Kembali ke Beranda
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentScreen("game1");
                      setShowConfetti(false);
                      setScore(0);
                      setCurrentQuestion(0);
                      setGameProgress(0);
                      setSelectedAnswer(null);
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
        <FooterBanner />
        <Footer />
      </div>
    );
  }

  if (currentScreen === "lost") {
    return (
      <div className="min-h-screen bg-white mt-24">
        <Navbar />
        <div className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white border border-gray-200 overflow-hidden rounded-2xl">
              <CardContent className="p-10 text-center">
                <div className="mb-6">
                  <X className="w-12 h-12 text-red-600 mx-auto" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Waktu Habis!</h2>
                <p className="text-gray-600 mb-8">
                  Sayang sekali, kamu kehabisan waktu dan belum menyelesaikan permainan. Coba lagi ya!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setCurrentScreen("home");
                      setScore(0);
                      setCurrentQuestion(0);
                      setGameProgress(0);
                      setSelectedAnswer(null);
                      setMemoryCards([]);
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    Kembali ke Beranda
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (previousScreen === "game1") {
                        setCurrentScreen("game1");
                        setScore(0);
                        setCurrentQuestion(0);
                        setGameProgress(0);
                        setSelectedAnswer(null);
                      } else if (previousScreen === "game2") {
                        setCurrentScreen("game2");
                        initializeMemoryGame(selectedDifficulty);
                        setScore(0);
                      }
                    }}
                    className="px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    Coba Lagi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <FooterBanner />
        <Footer />
      </div>
    );
  }

  return null;
}