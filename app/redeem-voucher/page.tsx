"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, ShoppingBag, Percent, CheckCircle, Lock, ArrowRight, Copy, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { loadUserProgress, saveUserProgress, UserProgress, BADGE_RULES } from "@/lib/badgeSystem";
import { BADGE_META } from "@/lib/badgeMeta";
import ConfettiAnimation from "@/components/widget/celebration-confetti";

const defaultProgress: UserProgress = {
    gamesPlayed: 0,
    correctAnswers: 0,
    totalPoints: 0,
    badges: [],
};

interface Voucher {
    id: string;
    name: string;
    description: string;
    platform: string;
    pointsRequired: number;
    discount: string;
    category: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

// Generate random alphanumeric voucher code
const generateVoucherCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
};

const vouchers: Voucher[] = [
    {
        id: "v1",
        name: "Voucher Diskon Obat Asli",
        description: "Diskon 20% untuk pembelian obat kesehatan asli di Shopee.",
        platform: "Shopee",
        pointsRequired: 100,
        discount: "20%",
        category: "Kesehatan",
        icon: ShoppingBag,
        color: "bg-orange-500",
    },
    {
        id: "v2",
        name: "Kode Promo Suplemen Asli",
        description: "Potongan Rp50.000 untuk suplemen kesehatan di Tokopedia.",
        platform: "Tokopedia",
        pointsRequired: 800,
        discount: "Rp50.000",
        category: "Obat Asli",
        icon: Percent,
        color: "bg-green-500",
    },
    {
        id: "v3",
        name: "Voucher TikTok Shop Kesehatan",
        description: "Diskon 15% untuk produk kesehatan dan obat asli di TikTok Shop.",
        platform: "TikTok",
        pointsRequired: 600,
        discount: "15%",
        category: "Kesehatan",
        icon: ShoppingBag,
        color: "bg-pink-500",
    },
    {
        id: "v4",
        name: "Promo Obat Herbal Asli",
        description: "Diskon 25% untuk obat herbal kesehatan di Shopee.",
        platform: "Shopee",
        pointsRequired: 700,
        discount: "25%",
        category: "Obat Asli",
        icon: Percent,
        color: "bg-teal-500",
    },
    {
        id: "v5",
        name: "Voucher Vitamin Tokopedia",
        description: "Potongan Rp30.000 untuk vitamin dan suplemen asli di Tokopedia.",
        platform: "Tokopedia",
        pointsRequired: 400,
        discount: "Rp30.000",
        category: "Kesehatan",
        icon: ShoppingBag,
        color: "bg-blue-500",
    },
];

export default function RedeemVoucherPage() {
    const userProgress: UserProgress = typeof window !== "undefined" ? loadUserProgress() : defaultProgress;
    const [redeemedVouchers, setRedeemedVouchers] = useState<string[]>([]);
    const [voucherCodes, setVoucherCodes] = useState<{ [key: string]: string }>({});
    const [showConfetti, setShowConfetti] = useState(false);
    const [currentVoucherCode, setCurrentVoucherCode] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Calculate totalPoints dynamically based on earned badges
    const badges = BADGE_RULES.map((rule) => {
        const meta = BADGE_META.find((m) => m.id === rule.id) || {};
        return {
            ...rule,
            ...meta,
            earned: userProgress.badges.includes(rule.id),
            progress: rule.check(userProgress) ? 100 : 0,
        };
    });
    const totalPoints = badges.filter((b) => b.earned).reduce((sum, b) => sum + (b.points || 0), 0);

    const handleRedeem = (voucherId: string, pointsRequired: number) => {
        if (totalPoints >= pointsRequired && !redeemedVouchers.includes(voucherId)) {
            // Generate voucher code
            const newCode = generateVoucherCode();
            // Update redeemed vouchers and voucher codes
            setRedeemedVouchers([...redeemedVouchers, voucherId]);
            setVoucherCodes({ ...voucherCodes, [voucherId]: newCode });
            // Deduct points from userProgress
            const updatedProgress = {
                ...userProgress,
                totalPoints: userProgress.totalPoints - pointsRequired,
            };
            saveUserProgress(updatedProgress);
            // Trigger confetti and modal
            setShowConfetti(true);
            setCurrentVoucherCode(newCode);
            setIsModalOpen(true);
            console.log(`Voucher ${voucherId} berhasil ditukar! Kode: ${newCode}, Poin tersisa: ${updatedProgress.totalPoints}`);
        } else {
            alert("Poin tidak cukup atau voucher sudah ditukar!");
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            alert("Kode voucher berhasil disalin!");
        });
    };

    const renderVoucherCard = (voucher: Voucher) => {
        const IconComponent = voucher.icon;
        const isRedeemed = redeemedVouchers.includes(voucher.id);
        const hasEnoughPoints = totalPoints >= voucher.pointsRequired;
        const voucherCode = voucherCodes[voucher.id];

        return (
            <Card key={voucher.id} className={`relative overflow-hidden transition-all duration-300 rounded-xl hover:shadow-lg hover:-translate-y-1 bg-white border border-gray-200 ${isRedeemed ? "opacity-60" : ""}`}>
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-xl ${voucher.color} ${isRedeemed ? "opacity-60" : ""} shadow-sm`}>{IconComponent && <IconComponent className="w-6 h-6 text-white" />}</div>
                        <div className="flex items-center gap-2">
                            {isRedeemed && <div className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full font-semibold">SUDAH DITUKAR</div>}
                            {!isRedeemed && !hasEnoughPoints && <Lock className="w-4 h-4 text-gray-400" />}
                        </div>
                    </div>
                    <CardTitle className={`text-lg font-semibold ${isRedeemed ? "text-gray-600" : "text-gray-900"}`}>{voucher.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-500 leading-relaxed">{voucher.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Badge variant={isRedeemed ? "secondary" : "default"} className={`font-semibold ${isRedeemed ? "bg-gray-500 text-white" : "bg-teal-600 hover:bg-teal-600 text-white"}`}>
                            {voucher.pointsRequired} Poin
                        </Badge>
                        <span className={`text-xs font-medium ${isRedeemed ? "text-gray-500" : hasEnoughPoints ? "text-teal-600" : "text-red-500"}`}>
                            {isRedeemed ? "Sudah Ditukar" : hasEnoughPoints ? "Siap Ditukar" : "Poin Kurang"}
                        </span>
                    </div>
                    <div className="space-y-2">
                        <Progress value={(totalPoints / voucher.pointsRequired) * 100} className="h-2 bg-gray-100" />
                        <p className="text-xs text-gray-500">{Math.min(100, Math.floor((totalPoints / voucher.pointsRequired) * 100))}% menuju voucher ini</p>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Dialog>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`p-3 rounded-xl ${voucher.color} shadow-sm`}>{IconComponent && <IconComponent className="w-6 h-6 text-white" />}</div>
                                    <div>
                                        <DialogTitle className="text-xl font-semibold">{voucher.name}</DialogTitle>
                                        <Badge variant="secondary" className="mt-1">
                                            {voucher.discount} Diskon
                                        </Badge>
                                    </div>
                                </div>
                                <DialogDescription className="text-base text-gray-600 leading-relaxed">{voucher.description}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 mt-6">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Detail Voucher:</h4>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-3 text-sm">
                                            <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700">Platform: {voucher.platform}</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700">Kategori: {voucher.category}</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm">
                                            <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700">Poin Diperlukan: {voucher.pointsRequired}</span>
                                        </li>
                                    </ul>
                                </div>
                                {!isRedeemed && !hasEnoughPoints && (
                                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-teal-900">Progress Saat Ini</span>
                                            <span className="text-sm font-semibold text-teal-600">{Math.floor((totalPoints / voucher.pointsRequired) * 100)}%</span>
                                        </div>
                                        <Progress value={(totalPoints / voucher.pointsRequired) * 100} className="h-2" />
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                    {isRedeemed ? (
                        <Button
                            size="sm"
                            className="flex-1 bg-gray-100 text-gray-500 rounded-xl"
                            onClick={() => handleCopyCode(voucherCode)}
                        >
                            {voucherCode}
                            <Copy className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className={`flex-1 ${hasEnoughPoints ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-gray-50 text-gray-500 cursor-not-allowed"} rounded-xl`}
                            disabled={!hasEnoughPoints}
                            onClick={() => handleRedeem(voucher.id, voucher.pointsRequired)}
                        >
                            Tukarkan Kode
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
            {showConfetti && <ConfettiAnimation />}
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <div className="w-full">
                        <a href="/profile">
                            <Button className="bg-gray-200 hover:bg-gray-300 gap-3 justify-center align-center flex text-center rounded-xl mb-5">
                                <ArrowLeft className="w-4 h-4" />
                                Kembali
                            </Button>
                        </a>
                        <h1 className="text-1xl sm:text-2xl font-bold text-gray-900 mb-1">Halaman Tukarkan Kode Voucher</h1>
                        <p className="text-md text-gray-600 mb-8">Tukarkan poin Anda menjadi voucher diskon untuk produk kesehatan dan obat asli di berbagai platform.</p>
                        <div className="bg-yellow-100 border border-yellow-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                            <p className="text-sm text-yellow-800">WARNING: INI HANYA FITUR DEMO VOUCHER YANG DITUKAR BUKAN VOUCHER ASLI</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="text-2xl sm:text-3xl font-bold text-teal-600 mb-1">{totalPoints}</div>
                            <div className="text-sm text-gray-500">Total Poin Anda</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1">{redeemedVouchers.length}</div>
                            <div className="text-sm text-gray-500">Voucher Ditukar</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="text-2xl sm:text-3xl font-bold text-cyan-600 mb-1">{vouchers.length}</div>
                            <div className="text-sm text-gray-500">Voucher Tersedia</div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {vouchers.map((voucher) => renderVoucherCard(voucher))}
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-lg bg-white text-black">
                        <DialogHeader>
                            <DialogTitle>Selamat! Voucher Anda</DialogTitle>
                            <DialogDescription>Kode voucher Anda telah dihasilkan. Salin kode di bawah ini untuk menggunakannya.</DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 p-4 bg-gray-100 rounded-xl flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">{currentVoucherCode}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyCode(currentVoucherCode!)}
                                className="flex rounded-xl bg-gray-200 border border-gray-200 hover:bg-gray-300 hover:text-black items-center gap-2"
                            >
                                <Copy className="w-4 h-4" />
                                Salin
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}