import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, ThumbsUp, MessageSquare, TrendingUp, Heart, Award } from "lucide-react";

export function ReviewsRatings() {
  const overallRating = {
    average: 4.8,
    total: 156,
    distribution: [
      { stars: 5, count: 98, percentage: 63 },
      { stars: 4, count: 42, percentage: 27 },
      { stars: 3, count: 12, percentage: 8 },
      { stars: 2, count: 3, percentage: 2 },
      { stars: 1, count: 1, percentage: 0 },
    ],
  };

  const recentReviews = [
    {
      id: 1,
      patient: "Siti Nurhaliza",
      rating: 5,
      date: "2024-01-15",
      comment: "Dokter sangat profesional dan ramah. Penjelasan yang diberikan sangat jelas dan mudah dipahami. Konsultasi via video call juga lancar tanpa kendala teknis.",
      consultation: "Konsultasi Umum",
      helpful: 12,
    },
    {
      id: 2,
      patient: "Budi Santoso",
      rating: 5,
      date: "2024-01-12",
      comment: "Pelayanan excellent! Dokter sangat sabar dalam mendengarkan keluhan dan memberikan solusi yang tepat. Resep yang diberikan juga sangat membantu.",
      consultation: "Follow-up Diabetes",
      helpful: 8,
    },
    {
      id: 3,
      patient: "Maria Gonzalez",
      rating: 4,
      date: "2024-01-10",
      comment: "Konsultasi berjalan dengan baik. Dokter memberikan advice yang berguna untuk kehamilan saya. Hanya saja waktu tunggu agak lama.",
      consultation: "Konsultasi Kehamilan",
      helpful: 15,
    },
    {
      id: 4,
      patient: "Ahmad Rizki",
      rating: 5,
      date: "2024-01-08",
      comment: "Sangat puas dengan layanan konsultasi. Dokter responsif dan memberikan treatment yang efektif untuk masalah punggung saya.",
      consultation: "Konsultasi Ortopedi",
      helpful: 6,
    },
  ];

  const achievements = [
    {
      title: "Top Rated Doctor",
      description: "Rating 4.8+ selama 6 bulan berturut-turut",
      icon: Award,
      color: "text-yellow-600",
    },
    {
      title: "Patient Favorite",
      description: "95% pasien merekomendasikan",
      icon: Heart,
      color: "text-red-600",
    },
    {
      title: "Quick Responder",
      description: "Rata-rata respon < 5 menit",
      icon: MessageSquare,
      color: "text-blue-600",
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ulasan & Rating</h2>
          <p className="text-muted-foreground">Feedback dan penilaian dari pasien</p>
        </div>
        <Button className="bg-teal-600 p-3 rounded-xl hover:bg-teal-600 hover:text-white cursor-auto text-white">Rating Excellent</Button>
      </div>

      {/* Overall Rating Summary */}
      <div className="grid gap-6 md:grid-cols-3 ">
        <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
          <CardHeader className="text-center ">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="text-4xl font-bold">{overallRating.average}</div>
              <div className="flex">{renderStars(Math.round(overallRating.average))}</div>
            </div>
            <CardTitle>Rating Keseluruhan</CardTitle>
            <p className="text-sm text-muted-foreground">Berdasarkan {overallRating.total} ulasan</p>
          </CardHeader>
        </Card>

        <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
          <CardHeader>
            <CardTitle>Distribusi Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overallRating.distribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <span className="text-sm w-6">{item.stars}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 rounded-full h-2 bg-gray-100">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
          <CardHeader>
            <CardTitle>Pencapaian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <achievement.icon className={`h-5 w-5 mt-0.5 ${achievement.color}`} />
                  <div>
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        {recentReviews.map((review) => (
          <Card key={review.id} className="bg-white rounded-xl border border-gray-200 text-black shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`/placeholder.svg?height=40&width=40&query=${review.patient}`} />
                    <AvatarFallback>
                      {review.patient
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{review.patient}</p>
                    <p className="text-sm text-muted-foreground">{review.consultation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">{renderStars(review.rating)}</div>
                  <p className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString("id-ID")}</p>
                </div>
              </div>

              <p className="text-sm mb-4 leading-relaxed">{review.comment}</p>

              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Membantu ({review.helpful})
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Balas
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </Tabs>
    </div>
  );
}
