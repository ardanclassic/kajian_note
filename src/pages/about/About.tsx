import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { TopHeader } from "@/components/layout/TopHeader";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";
import {
  BookOpen,
  BrainCircuit,
  Share2,
  Smartphone,
  Sparkles,
  PenTool,
  Users,
  Heart
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 } as any
  }
};

const bubbleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, x: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { type: "spring", stiffness: 120, damping: 15 } as any
  }
};

export default function About() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <TopHeader title="Tentang Alwaah" backButton backTo="/dashboard" />

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        </div>

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 container px-4 text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-6">
              Platform Digital Dakwah Sunnah
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-b from-white to-gray-400">
              ALWAAH
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light italic mb-8">
              "Abadikan Setiap Ilmu"
            </p>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Di setiap majelis ilmu, ratusan jamaah duduk khusyuk, namun hanya segelintir yang mencatat.
              Akibatnya, ilmu berharga seringkali hilang bersama waktu. <br />
              <strong className="text-white">Alwaah hadir untuk mengubah itu.</strong>
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Story Section - Gamified Chat Bubbles */}
      <section className="py-24 relative overflow-hidden">
        <div className="container px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Latar Belakang</h2>
            <p className="text-gray-400">Sebuah fenomena yang kami temukan di lapangan</p>
          </motion.div>

          <div className="space-y-12 relative">
            {/* Connecting Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gray-800 -translate-x-1/2 hidden md:block" />

            {problems.map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={bubbleVariants}
                className={cn(
                  "relative flex flex-col md:flex-row items-center gap-8",
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                )}
              >
                {/* Icon Marker */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border-4 border-gray-800 z-10 hidden md:block" />

                <div className="w-full md:w-1/2">
                  <Card className="p-6 bg-gray-900/50 border-gray-800 hover:border-emerald-500/30 transition-colors backdrop-blur-xs">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-white">{item.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                </div>
                <div className="w-full md:w-1/2" /> {/* Spacer */}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-gray-900/30">
        <div className="container px-4 max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Solusi ALWAAH</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Menggabungkan kecanggihan artificial intelligence dengan kebutuhan penuntut ilmu
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={itemVariants}
              >
                <Card className="h-full p-6 bg-black border-gray-800 hover:bg-gray-900/80 transition-all group">
                  <div className="mb-6 w-12 h-12 rounded-xl bg-gray-900 group-hover:bg-emerald-500/20 text-white group-hover:text-emerald-400 flex items-center justify-center transition-colors">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing / Vision Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-emerald-950/20 to-black pointer-events-none" />

        <div className="container px-4 max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Heart className="w-10 h-10 text-emerald-500 fill-emerald-500/50 animate-pulse" />
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
              Bukan Sekadar Aplikasi. <br />
              <span className="text-emerald-400">Ini Ikhtiar Kami.</span>
            </h2>

            <div className="space-y-6 text-lg text-gray-300 leading-relaxed font-light">
              <p>
                Sebagai software engineer Muslim, kami ingin berkontribusi nyata.
                Dimulai dari masalah sederhana: membantu jamaah mendapatkan dokumentasi ilmu yang proper
                tanpa mengorbankan fokus saat kajian.
              </p>
              <p>
                Setiap catatan yang dibuat, setiap ilmu yang tersebar, setiap jamaah yang terbantu
                dalam memahami agama melalui platform ini, adalah sedekah jariyah yang insyaAllah
                terus mengalir pahalanya.
              </p>
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm inline-block">
              <p className="text-sm text-gray-400 italic mb-4">
                "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia."
              </p>
              <p className="font-semibold text-emerald-400 text-sm">
                (HR. Ahmad, Thabrani, Daruquthni)
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <ScrollToTopButton />
    </div>
  );
}

// Data
const problems = [
  {
    title: "Ilmu yang Hilang",
    description: "80-90% jamaah hanya mendengarkan tanpa mencatat. Ilmu berharga seringkali terlupakan setelah kajian selesai tanpa adanya referensi untuk muroja'ah.",
    icon: Users
  },
  {
    title: "Dilema Mencatat",
    description: "Mereka yang mencatat sering menghadapi dilema: fokus menulis tapi ketinggalan penjelasan ustadz, atau fokus mendengar tapi tidak punya catatan.",
    icon: PenTool
  },
  {
    title: "Gap Teknologi",
    description: "Umat Islam sering menjadi 'pengguna pasif' teknologi. Minimnya aplikasi berkualitas tinggi yang spesifik untuk kebutuhan penuntut ilmu dan dakwah.",
    icon: Smartphone
  },
  {
    title: "Potensi Dakwah",
    description: "Konten kajian berkualitas sulit disebarkan secara luas karena proses editing dan formatting yang memakan waktu lama.",
    icon: Share2
  }
];

const features = [
  {
    title: "Fokus Mendengarkan",
    description: "Jamaah bisa khusyuk menyimak kajian sepenuh hati. Biarkan AI kami yang mengurus dokumentasi dan pencatatan secara detail.",
    icon: BrainCircuit
  },
  {
    title: "Catatan Terstruktur",
    description: "Dapatkan hasil catatan yang rapi, lengkap dengan poin-poin penting, dalil, dan kesimpulan yang mudah dipahami.",
    icon: BookOpen
  },
  {
    title: "Mobile-Friendly PDF",
    description: "Hasil catatan diexport ke format PDF yang didesain khusus untuk kenyamanan membaca di layar smartphone.",
    icon: Smartphone
  },
  {
    title: "Mudah Disebarkan",
    description: "Bagikan ilmu ke keluarga dan teman melalui WhatsApp atau Telegram hanya dengan sekali klik.",
    icon: Share2
  },
  {
    title: "Note Summary",
    description: "Ringkasan cerdas yang menangkap inti sari kajian, cocok untuk Anda yang ingin grasp poin cepat.",
    icon: Sparkles
  },
  {
    title: "Deep Note Extraction",
    description: "Dokumentasi mendalam yang mendetail, mencakup referensi dalil dan pembahasan komprehensif.",
    icon: BookOpen
  }
];
