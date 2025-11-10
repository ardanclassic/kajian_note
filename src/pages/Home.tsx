/**
 * Home Page - Enhanced UI/UX
 * Landing page for unauthenticated users
 */

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Tag,
  Share2,
  FileText,
  Crown,
  Lock,
  Globe,
  Pin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const features = [
    {
      icon: BookOpen,
      title: "Catat Kajian",
      description: "Simpan catatan kajian dengan mudah dan terorganisir. Unlimited notes untuk tier premium.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Tag,
      title: "Organisasi dengan Tag",
      description: "Kategorikan catatan dengan tag untuk pencarian cepat dan mudah menemukan topik tertentu.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Share2,
      title: "Berbagi Ilmu",
      description: "Bagikan catatan berguna dengan member lain melalui fitur catatan publik (Premium).",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: FileText,
      title: "Export PDF/Word",
      description: "Simpan catatan ke file PDF atau Word untuk backup offline dan cetak (Premium/Advance).",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Lock,
      title: "Privasi Terjamin",
      description: "Catatan pribadi tetap private. Hanya Anda yang bisa melihat dan mengedit.",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: Pin,
      title: "Pin Penting",
      description: "Pin catatan penting agar mudah diakses. Admin bisa pin catatan untuk highlight.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  const subscriptionTiers = [
    {
      name: "Free",
      price: "Rp 0",
      period: "Selamanya",
      description: "Untuk pengguna baru",
      features: ["10 catatan", "3 tag berbeda", "Catatan private saja", "Pencarian catatan", "Organisasi dengan tag"],
      badge: null,
      badgeColor: "",
      popular: false,
      icon: BookOpen,
    },
    {
      name: "Premium",
      price: "Rp 50K",
      period: "/bulan",
      description: "Paling populer",
      features: ["100 catatan", "10 tag berbeda", "Catatan publik", "Export PDF", "Pin catatan", "Prioritas support"],
      badge: "Populer",
      badgeColor: "bg-gradient-to-r from-purple-500 to-pink-500",
      popular: true,
      icon: Crown,
    },
    {
      name: "Advance",
      price: "Rp 100K",
      period: "/bulan",
      description: "Tanpa batas",
      features: ["Unlimited catatan", "Unlimited tag", "Semua fitur Premium", "Export PDF & Word", "Priority support"],
      badge: "Terbaik",
      badgeColor: "bg-gradient-to-r from-yellow-500 to-orange-500",
      popular: false,
      icon: Sparkles,
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Daftar",
      description: "Buat akun dengan username dan PIN. Tidak perlu email!",
      icon: Users,
    },
    {
      number: "2",
      title: "Catat",
      description: "Buat catatan kajian dengan judul, konten, dan tag.",
      icon: BookOpen,
    },
    {
      number: "3",
      title: "Organisir",
      description: "Gunakan tag untuk kategorisasi. Cari dengan mudah saat dibutuhkan.",
      icon: Tag,
    },
    {
      number: "4",
      title: "Bagikan",
      description: "Upgrade ke Premium untuk berbagi catatan bermanfaat dengan member lain.",
      icon: Share2,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Aplikasi Catatan Kajian Terbaik</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Kajian Note
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Aplikasi catatan kajian yang mudah digunakan untuk member masjid.
              <span className="text-primary font-semibold"> Tidak perlu email</span>, cukup username dan PIN!
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center flex-wrap pt-4">
              <Button
                size="lg"
                className="text-lg px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 text-white"
                onClick={() => navigate("/register")}
              >
                Daftar Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 h-12 border-2 hover:bg-accent"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-bold text-primary">100+</p>
                <p className="text-sm text-muted-foreground">Member Aktif</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-bold text-primary">1000+</p>
                <p className="text-sm text-muted-foreground">Catatan Tersimpan</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-bold text-primary">50+</p>
                <p className="text-sm text-muted-foreground">Kajian Tercatat</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="text-sm px-4 py-1">
            <Zap className="h-3 w-3 mr-1" />
            Fitur Unggulan
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">Fitur yang Memudahkan</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dibuat khusus untuk memudahkan member mencatat dan berbagi ilmu
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border-border/50"
            >
              <CardHeader>
                <div
                  className={`h-14 w-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="text-sm px-4 py-1">
              <Crown className="h-3 w-3 mr-1" />
              Pilihan Paket
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold">Mulai Gratis, Upgrade Kapan Saja</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pilih paket yang sesuai dengan kebutuhan Anda
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptionTiers.map((tier, index) => (
              <Card
                key={index}
                className={`relative hover:shadow-2xl transition-all duration-300 ${
                  tier.popular ? "border-primary shadow-xl shadow-primary/10 scale-105 md:scale-110" : "hover:scale-105"
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className={`${tier.badgeColor} text-white border-0 px-4 py-1 shadow-lg`}>{tier.badge}</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div
                    className={`h-16 w-16 rounded-2xl ${
                      tier.popular ? "bg-primary" : "bg-muted"
                    } flex items-center justify-center mx-auto mb-4`}
                  >
                    <tier.icon className={`h-8 w-8 ${tier.popular ? "text-primary-foreground" : "text-foreground"}`} />
                  </div>
                  <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground">{tier.period}</span>
                    </div>
                    <CardDescription className="text-base">{tier.description}</CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => navigate("/register")}
                  >
                    {tier.name === "Free" ? "Mulai Gratis" : "Upgrade Sekarang"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="text-sm px-4 py-1">
            <BookOpen className="h-3 w-3 mr-1" />
            Cara Kerja
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">Mudah dan Sederhana</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fokus pada catatan kajian Anda, kami urus sisanya
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="relative mx-auto mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto shadow-lg shadow-primary/20">
                      {step.number}
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{step.description}</CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 h-48 w-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />

          <CardHeader className="text-center relative z-10 pt-16 pb-8">
            <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-4xl md:text-5xl text-primary-foreground mb-4">
              Siap Mulai Mencatat Kajian?
            </CardTitle>
            <CardDescription className="text-primary-foreground/90 text-lg md:text-xl max-w-2xl mx-auto">
              Bergabunglah dengan ratusan member yang sudah merasakan kemudahan mencatat kajian
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-16 relative z-10">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-10 h-14 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/register")}
            >
              Daftar Gratis Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">Kajian Note</span>
            </div>
            <div className="text-sm text-muted-foreground">© 2025 Kajian Note. All rights reserved.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
