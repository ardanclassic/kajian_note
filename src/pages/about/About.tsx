import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { TopHeader } from "@/components/layout/TopHeader";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";
import {
  BrainCircuit,
  Share2,
  Sparkles,
  Zap,
  Swords,
  Palette,
  Quote,
  Users,
  Layers,
  HeartHandshake,
  Rocket
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 20 } as any
  }
};

const featureCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  hover: {
    y: -8,
    transition: { duration: 0.3 }
  }
};

// --- Data ---
const ecosystems = [
  {
    title: "Note Summary",
    subtitle: "Pencatat Cerdas",
    description: "Ubah video kajian panjang menjadi ringkasan padat hanya dalam hitungan detik. Fokus menyimak, biarkan AI yang mencatat intisarinya untukmu.",
    icon: Sparkles,
    color: "from-yellow-400 to-orange-500",
    iconColor: "text-yellow-400",
    bgGlow: "bg-yellow-500/10",
    borderGlow: "group-hover:border-yellow-500/50"
  },
  {
    title: "Content Studio",
    subtitle: "Media Dakwah Visual",
    description: "Editor drag-and-drop intuitif untuk menyulap catatanmu menjadi poster atau slide dakwah yang estetik. Sebarkan ilmu dengan visual yang menggugah.",
    icon: Palette,
    color: "from-purple-400 to-pink-500",
    iconColor: "text-purple-400",
    bgGlow: "bg-purple-500/10",
    borderGlow: "group-hover:border-purple-500/50"
  },
  {
    title: "Prompt Studio",
    subtitle: "Asisten Kreatif",
    description: "Kehabisan ide? Dapatkan prompt AI terstruktur untuk membuat gambar, biodata ta'aruf, hingga cerita anak bedasarkan nilai-nilai Islami.",
    icon: Zap,
    color: "from-blue-400 to-cyan-500",
    iconColor: "text-blue-400",
    bgGlow: "bg-blue-500/10",
    borderGlow: "group-hover:border-blue-500/50"
  },
  {
    title: "Quest",
    subtitle: "Uji Pemahaman",
    description: "Cara seru menguji wawasan keislamanmu. Tantang diri sendiri atau berkompetisi dengan teman dalam mode Multiplayer yang menegangkan.",
    icon: Swords,
    color: "from-red-400 to-rose-500",
    iconColor: "text-red-400",
    bgGlow: "bg-red-500/10",
    borderGlow: "group-hover:border-red-500/50"
  }
];

const values = [
  {
    title: "Otentikasi Ilmu",
    desc: "Menjaga kemurnian referensi dengan merujuk langsung pada sumber kajian yang kredibel.",
    icon: BrainCircuit
  },
  {
    title: "Efisiensi Waktu",
    desc: "Memangkas waktu merangkum agar penuntut ilmu bisa lebih banyak belajar dalam waktu singkat.",
    icon: Layers
  },
  {
    title: "Konektivitas Umat",
    desc: "Membangun jembatan antar penuntut ilmu melalui fitur berbagi dan kompetisi yang sehat.",
    icon: Users
  }
];

export default function About() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, 50]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans">
      <TopHeader title="Tentang Alwaah" backButton backTo="/dashboard" className="bg-transparent/20 backdrop-blur-md border-b-0" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
        {/* Background FX */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse delay-700" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        </div>

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 container px-4 mx-auto text-center max-w-5xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs md:text-sm font-medium tracking-wide text-gray-300 uppercase">
                Platform Ekosistem Digital
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
              Lebih Dari Sekadar <br />
              <span className="text-transparent bg-clip-text bg-linear-to-b from-emerald-400 to-teal-600">
                Catatan Kajian.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl mx-auto mb-12">
              Alwaah adalah <span className="text-white font-medium">jembatan teknologi</span> bagi penuntut ilmu.
              Kami mengintegrasikan AI, tool kreatif, dan gamifikasi untuk membuat pengalaman belajar agama menjadi lebih efektif dan menyenangkan.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center justify-center gap-4 mt-8"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Rocket className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm text-gray-400 text-left">
                Jadilah bagian dari <span className="text-white font-medium">generasi awal</span> <br />
                revolusi ekosistem digital muslim.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest text-gray-500">Scroll Down</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-emerald-500 to-transparent" />
        </motion.div>
      </section>

      {/* The Big 4 - Ecosystem Section */}
      <section className="py-24 md:py-32 relative bg-gray-950/50">
        <div className="container px-4 mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Satu Aplikasi, Empat Kekuatan</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Kami merancang Alwaah bukan hanya sebagai tempat menyimpan tulisan,
              tapi sebagai <span className="text-emerald-400">laboratorium kebaikan</span> Anda.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {ecosystems.map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true, margin: "-50px" }}
                variants={featureCardVariants}
                className="group relative"
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl",
                  item.color
                )} />

                <Card className={cn(
                  "h-full p-8 md:p-10 bg-gray-900/40 border-gray-800 transition-all duration-300 backdrop-blur-sm",
                  item.borderGlow,
                  "border hover:shadow-2xl hover:shadow-black/50"
                )}>
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-8">
                      <div className={cn(
                        "p-4 rounded-2xl transition-all duration-300 group-hover:scale-110",
                        item.bgGlow
                      )}>
                        <item.icon className={cn("w-8 h-8", item.iconColor)} />
                      </div>
                      <span className={cn(
                        "text-xs font-bold px-3 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700",
                        "group-hover:border-gray-500 transition-colors"
                      )}>
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    <p className={cn("text-sm font-semibold mb-4 uppercase tracking-wider", item.iconColor)}>
                      {item.subtitle}
                    </p>
                    <p className="text-gray-400 leading-relaxed text-lg mb-8 flex-grow">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 group-hover:text-white transition-colors">
                      <span>Pelajari Selengkapnya</span>
                      <Share2 className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy / Values Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

        <div className="container px-4 mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                Teknologi untuk <br />
                <span className="text-emerald-500">Mengikat Ilmu.</span>
              </h2>
              <div className="space-y-6 text-lg text-gray-400 font-light leading-relaxed">
                <p>
                  Di era informasi yang begitu cepat, ilmu seringkali datang dan pergi tanpa bekas.
                  Kami percaya bahwa teknologi seharusnya tidak mendistraksi, melainkan <strong className="text-gray-200">mengikat makna</strong>.
                </p>
                <p>
                  Alwaah dibangun di atas prinsip bahwa setiap detik waktu yang dihabiskan untuk menuntut ilmu
                  adalah investasi akhirat yang tak ternilai. Maka, alat bantunya pun harus yang terbaik.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-1 gap-6">
                {values.map((val, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-500/20">
                        <val.icon className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{val.title}</h4>
                      <p className="text-sm text-gray-400">{val.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden border border-gray-800 bg-gray-900/50 shadow-2xl">
                {/* Abstract visualization of connection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-purple-500/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Quote className="w-12 h-12 text-emerald-500/50 mx-auto mb-6" />
                    <p className="text-2xl md:text-3xl font-serif italic text-white/90 leading-relaxed">
                      "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia."
                    </p>
                    <p className="mt-6 text-emerald-400 font-medium tracking-widest text-sm uppercase">
                      HR. Ahmad
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 p-4 bg-black border border-gray-800 rounded-2xl shadow-xl"
              >
                <HeartHandshake className="w-8 h-8 text-pink-500" />
              </motion.div>
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -left-6 p-4 bg-black border border-gray-800 rounded-2xl shadow-xl"
              >
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Simple Closing */}
      <section className="py-24 relative text-center">
        <div className="container px-4 mx-auto max-w-4xl">
          <p className="text-emerald-500 font-medium tracking-widest uppercase text-xs md:text-sm mb-4 bg-emerald-500/10 inline-block px-4 py-1 rounded-full border border-emerald-500/20">
            Fi Sabilillah
          </p>
          <h3 className="text-2xl md:text-3xl font-serif text-gray-300 italic leading-relaxed">
            "Ikatlah ilmu dengan tulisan."
          </h3>
          <div className="mt-8 w-24 h-1 bg-gradient-to-r from-transparent via-emerald-800 to-transparent mx-auto rounded-full" />
        </div>
      </section>

      <ScrollToTopButton />
    </div>
  );
}
