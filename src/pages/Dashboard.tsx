/**
 * Dashboard Page
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useNotesStore } from "@/store/notesStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/common/Loading";
import {
  BookOpen,
  Tag,
  Share2,
  FileText,
  Crown,
  User,
  LogOut,
  Settings,
  Users,
  Plus,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { currentSubscription, usage, fetchUsage } = useSubscriptionStore();
  const { userNotes, statistics, fetchUserNotes, fetchStatistics } = useNotesStore();

  // Fetch data on mount
  useEffect(() => {
    if (user?.id) {
      fetchUserNotes(user.id);
      fetchStatistics(user.id);
      fetchUsage(user.id);
    }
  }, [user?.id, fetchUserNotes, fetchStatistics, fetchUsage]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) {
    return <Loading fullscreen text="Memuat..." />;
  }

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case "advance":
        return "default";
      case "premium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const stats = [
    {
      title: "Total Catatan",
      value: statistics?.totalNotes ?? 0,
      limit: usage?.notesLimit === Infinity ? "∞" : usage?.notesLimit ?? 0,
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Catatan Publik",
      value: statistics?.publicNotes ?? 0,
      icon: Share2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Tag Digunakan",
      value: statistics?.totalTags ?? 0,
      limit: usage?.tagsLimit === Infinity ? "∞" : usage?.tagsLimit ?? 0,
      icon: Tag,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Catatan Pinned",
      value: statistics?.pinnedNotes ?? 0,
      icon: FileText,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                <h1 className="text-lg! font-bold">Kajian Notes</h1>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/notes")}>
                <BookOpen className="h-4 w-4 mr-2" />
                Catatan
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/subscription")}>
                <Crown className="h-4 w-4 mr-2" />
                Subscription
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              {user.role === "admin" && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")}>
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <h2 className="text-xl font-bold">Assalamu'alaikum, {user.fullName}</h2>
            <div className="flex items-center gap-2">
              <Badge variant={getTierBadgeVariant(user.subscriptionTier)} className="text-xs">
                {user.subscriptionTier.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {user.role}
              </Badge>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stat.value}
                    {stat.limit && <span className="text-lg text-muted-foreground"> / {stat.limit}</span>}
                  </div>
                  {stat.limit && (
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stat.color.replace("text-", "bg-")} transition-all`}
                        style={{
                          width: `${Math.min(
                            (stat.value / (typeof stat.limit === "string" ? stat.value : Number(stat.limit))) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Quick Actions + Recent Notes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Aksi Cepat</CardTitle>
                  <CardDescription>Mulai kelola catatan kajian Anda</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/notes/new")}>
                      <Plus className="h-6 w-6" />
                      <span className="text-sm">Catatan Baru</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/notes")}>
                      <BookOpen className="h-6 w-6" />
                      <span className="text-sm">Lihat Catatan</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/subscription")}>
                      <Crown className="h-6 w-6" />
                      <span className="text-sm">Subscription</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate("/settings")}>
                      <Settings className="h-6 w-6" />
                      <span className="text-sm">Pengaturan</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Notes */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Catatan Terbaru</CardTitle>
                      <CardDescription>Catatan yang baru saja Anda buat</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/notes")}>
                      Lihat Semua
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {userNotes.length > 0 ? (
                    <div className="space-y-3">
                      {userNotes.slice(0, 5).map((note) => (
                        <div
                          key={note.id}
                          className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => navigate(`/notes/${note.id}`)}
                        >
                          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{note.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{note.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {note.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                              {note.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{note.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-2">Belum ada catatan</p>
                      <p className="text-sm text-muted-foreground mb-4">Mulai buat catatan kajian pertama Anda</p>
                      <Button onClick={() => navigate("/notes/new")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Buat Catatan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Subscription Info */}
            <div className="space-y-6">
              {/* Free Tier - Upgrade Prompt */}
              {user.subscriptionTier === "free" && (
                <Card className="border-primary bg-linear-to-br from-primary/5 to-primary/10">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <CardTitle>Upgrade Sekarang</CardTitle>
                    </div>
                    <CardDescription>Dapatkan fitur premium</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>100+ catatan atau unlimited</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Share2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>Catatan publik</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>Export PDF & Word</span>
                      </li>
                    </ul>
                    <Button className="w-full" onClick={() => navigate("/subscription")}>
                      <Crown className="h-4 w-4 mr-2" />
                      Lihat Paket
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Premium/Advance - Active Subscription */}
              {user.subscriptionTier !== "free" && currentSubscription && (
                <Card className="border-primary">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-primary" />
                      <CardTitle>Subscription Aktif</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Paket</span>
                        <Badge variant={getTierBadgeVariant(currentSubscription.tier)}>
                          {currentSubscription.tier.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant={currentSubscription.status === "active" ? "default" : "destructive"}>
                          {currentSubscription.status === "active" ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </div>
                      {currentSubscription.endDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Berakhir</span>
                          <span className="text-sm font-medium">
                            {new Date(currentSubscription.endDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/subscription")}>
                      Kelola Subscription
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">💡 Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Gunakan tags untuk organisasi lebih baik</li>
                    <li>• Pin catatan penting agar mudah diakses</li>
                    <li>• Bagikan catatan publik untuk berbagi ilmu</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
