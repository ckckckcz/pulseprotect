"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Medal, Shield, Eye, Users, Award, Star, CheckCircle, Lock, ArrowRight, Ticket } from "lucide-react";
import { loadUserProgress, BADGE_RULES, UserProgress } from "@/lib/badgeSystem";
import { BADGE_META } from "@/lib/badgeMeta";
import Link from "next/link";
import RedeemVoucherPage from "@/app/redeem-voucher/page";

const defaultProgress: UserProgress = {
  gamesPlayed: 0,
  correctAnswers: 0,
  totalPoints: 0,
  badges: [],
};

export default function BadgeSystem() {
  const userProgress: UserProgress = typeof window !== "undefined" ? loadUserProgress() : defaultProgress;
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
  const earnedBadges = badges.filter((b) => b.earned).length;
  const earnedBadgeList = badges.filter((b) => b.earned);
  const lockedBadgeList = badges.filter((b) => !b.earned);

  const renderBadgeCard = (badge: any) => {
    const IconComponent = badge.icon;
    return (
      <Card key={badge.id} className={`relative overflow-hidden transition-all duration-300 rounded-xl hover:shadow-lg hover:-translate-y-1 bg-white border border-gray-200`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-3 rounded-xl ${badge.color} ${badge.earned ? "" : "opacity-60"} shadow-sm`}>{IconComponent && <IconComponent className="w-6 h-6 text-white" />}</div>
            <div className="flex items-center gap-2">
              {badge.earned && <div className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full font-semibold">DIRAIH</div>}
              {!badge.earned && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
          </div>
          <CardTitle className={`text-lg font-semibold ${badge.earned ? "text-gray-900" : "text-gray-600"}`}>{badge.name}</CardTitle>
          <CardDescription className="text-sm text-gray-500 leading-relaxed">{badge.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant={badge.earned ? "default" : "secondary"} className={`font-semibold ${badge.earned ? "bg-teal-600 hover:bg-teal-600 text-white" : "bg-black text-white hover:bg-black"}`}>
              {badge.points} Poin
            </Badge>
            <span className={`text-xs font-medium ${badge.earned ? "text-teal-600" : "text-gray-500"}`}>{badge.earned ? "Berhasil Diraih" : `${badge.progress}% Progress`}</span>
          </div>
          {!badge.earned && (
            <div className="space-y-2">
              <Progress value={badge.progress} className="h-2 bg-gray-100" />
              <p className="text-xs text-gray-500">{badge.progress}% menuju badge ini</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 border-gray-300 hover:bg-gray-50 bg-transparent rounded-xl text-black hover:text-black">
                  Lihat Detail
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`p-3 rounded-xl ${badge.color} shadow-sm`}>{IconComponent && <IconComponent className="w-6 h-6 text-white" />}</div>
                    <div>
                      <DialogTitle className="text-xl font-semibold">{badge.name}</DialogTitle>
                      <Badge variant="secondary" className="mt-1">
                        {badge.points} Poin
                      </Badge>
                    </div>
                  </div>
                  <DialogDescription className="text-base text-gray-600 leading-relaxed">{badge.description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Persyaratan Badge:</h4>
                    <ul className="space-y-2">
                      {(badge.requirements || []).map((req: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Cara Mendapatkan:</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{badge.howToEarn}</p>
                  </div>
                  {!badge.earned && (
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-teal-900">Progress Saat Ini</span>
                        <span className="text-sm font-semibold text-teal-600">{badge.progress}%</span>
                      </div>
                      <Progress value={badge.progress} className="h-2" />
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            {!badge.earned && (
              <Button size="sm" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
                Dapatkan Badge
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 border border-gray-200 rounded-xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="max-w-3xl">
            <h1 className="text-1xl sm:text-2xl font-bold text-gray-900 mb-1">Sistem Badge Deteksi Obat Palsu</h1>
            <p className="text-md text-gray-600 mb-8">Kumpulkan badge dan tingkatkan keahlian Anda dalam mendeteksi obat palsu untuk melindungi kesehatan masyarakat</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-2xl sm:text-3xl font-bold text-teal-600 mb-1">{totalPoints}</div>
              <div className="text-sm text-gray-500">Total Poin Terkumpul</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1">{earnedBadges}</div>
              <div className="text-sm text-gray-500">Badge Berhasil Diraih</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-600 mb-1">{badges.length}</div>
              <div className="text-sm text-gray-500">Badge Total</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{earnedBadgeList.map((badge) => renderBadgeCard(badge))}</div>
        {earnedBadgeList.length > 0 && lockedBadgeList.length > 0 && <hr className="my-6 border-gray-200" />}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{lockedBadgeList.map((badge) => renderBadgeCard(badge))}</div>
      </div>
      <a href="/redeem-voucher">
        <Button variant="outline" className="flex-1 gap-3 w-full mt-6 border-gray-300 hover:bg-teal-700 bg-teal-600 rounded-xl text-white hover:text-white">
          <Ticket />
          Tukarkan Poin
        </Button>
      </a>
    </div>
  );
}
