import { type TaarufPromptConfig } from "@/types/promptStudio.types";

/**
 * Preset templates for Ta'aruf Biodata Generator
 * Provides example configurations for male and female users
 */

export const TAARUF_PRESETS: Record<string, Partial<TaarufPromptConfig>> = {
  "male-professional": {
    // Basic Information
    fullName: "Ahmad Fauzan",
    age: "28 tahun",
    gender: "male",
    currentResidence: "Yogyakarta, DIY",
    ethnicity: "Jawa",
    height: "172 cm",
    weight: "68 kg",

    // Religious Background
    dailyPractices:
      "Alhamdulillah konsisten sholat 5 waktu, berusaha di awal waktu dan berjamaah di masjid ketika memungkinkan. Membaca Al-Quran minimal 1 juz per minggu, sedang dalam proses menghajinya. Mengikuti kajian rutin di masjid setiap Jumat malam dan aktif dalam kepanitiaan kajian pemuda.",
    islamicStudies:
      "Pernah mondok di Pesantren Daarul Huffadh selama 3 tahun (2015-2018). Menghafal 10 juz Al-Quran. Mengikuti Daurah Fiqh Munakahat tahun 2023. Belajar dengan Ustadz Ahmad Zain tentang adab berkeluarga.",
    spiritualGoals:
      "Ingin menjadi kepala keluarga yang bisa membimbing istri dan anak dalam agama. Target menambah hafalan hingga 20 juz dalam 5 tahun ke depan. Cita-cita mengajak keluarga umrah bersama setiap 2 tahun sekali, insya Allah.",

    // Educational Background
    highestEducation: "S1 Teknik Informatika, Universitas Gadjah Mada",
    certifications: "AWS Certified Solutions Architect, Scrum Master Certification",
    academicAchievements: "Cumlaude, IPK 3.72. Juara 2 Hackathon Nasional 2019",

    // Professional Profile
    currentOccupation: "Senior Software Engineer di PT Tech Inovasi Indonesia",
    careerLevel: "mid",
    professionalGoals:
      "Target menjadi Tech Lead dalam 2 tahun ke depan. Ingin berkontribusi dalam proyek-proyek teknologi yang bermanfaat untuk umat. Berencana membangun startup teknologi Islami di masa depan.",
    incomeRange: "Alhamdulillah cukup untuk memenuhi kebutuhan keluarga, detail bisa didiskusikan lebih lanjut",

    // Family Background
    familyStructure:
      "Anak ke-2 dari 4 bersaudara (2 laki-laki, 2 perempuan). Kedua orang tua masih lengkap dan sehat, Alhamdulillah.",
    parentsOccupation: "Ayah: Guru SMA (pensiun), Ibu: Ibu rumah tangga",
    familyValues:
      "Keluarga kami menjunjung tinggi nilai-nilai kesederhanaan, kejujuran, dan saling menghormati. Orang tua sangat menekankan pentingnya pendidikan agama dan akhlak mulia.",
    familyReligiousPractice:
      "Alhamdulillah keluarga konsisten dalam praktik keagamaan. Rutin sholat berjamaah, kajian keluarga setiap Minggu pagi, dan aktif di kegiatan masjid.",

    // Personality & Interests
    characterDescription:
      "Saya adalah pribadi yang tenang, sabar, dan suka berpikir analitis. Senang belajar hal baru dan berbagi ilmu. Berusaha menjaga lisan dan menghindari ghibah. Terbuka untuk kritik dan saran yang membangun.",
    hobbies:
      "Membaca buku (terutama sejarah Islam dan biografi ulama), olahraga futsal seminggu sekali, fotografi landscape, berkebun tanaman hias, dan menulis artikel teknologi di blog pribadi.",
    strengths:
      "Bertanggung jawab, disiplin waktu, problem solver yang baik, sabar dalam menghadapi masalah, dan mudah beradaptasi dengan lingkungan baru.",
    growthAreas:
      "Masih perlu belajar lebih banyak tentang ilmu fiqih keluarga dan cara mendidik anak. Terkadang terlalu perfeksionis yang bisa membuat proses menjadi lambat.",

    // Vision for Marriage
    marriageGoals:
      "Saya memandang pernikahan sebagai ibadah untuk menyempurnakan separuh deen saya. Alhamdulillah saat ini merasa sudah siap secara mental, finansial, dan spiritual untuk membangun rumah tangga yang sakinah, mawaddah, wa rahmah. Ingin memiliki partner hidup yang bisa saling mengingatkan dalam kebaikan, mendukung pertumbuhan spiritual bersama, dan berjuang bersama menuju ridha Allah.",
    idealFamilyVision:
      "Rumah tangga yang penuh cinta, saling menghormati, dan komunikasi terbuka. Membayangkan rumah yang menjadi 'madrasah pertama' untuk anak-anak, di mana nilai-nilai Islam ditanamkan dengan penuh kasih sayang. Ingin menjadi suami yang bisa menjadi imam yang baik, partner yang mendukung istri untuk terus berkembang, dan ayah yang hadir dalam tumbuh kembang anak.",
    preferredChildrenCount:
      "Insha Allah 3-4 anak, namun tetap terbuka pada rezeki yang Allah berikan. Yang terpenting memastikan setiap anak mendapat hak pendidikan agama & dunia yang baik, kasih sayang cukup, dan bimbingan orang tua yang optimal.",
    residencePlan:
      "Saat ini tinggal di Yogyakarta dan bekerja di sini. Terbuka untuk relokasi jika ada kesempatan karir yang lebih baik, dengan diskusi bersama istri. Dalam 5 tahun, target memiliki rumah sendiri di area yang dekat dengan masjid dan lingkungan Islami.",
    rolesResponsibilitiesView: "partnership",

    // Criteria for Potential Spouse
    primaryCriteria:
      "Mengikuti tuntunan Rasulullah ﷺ, agama dan akhlak adalah prioritas utama:\n\n1. Konsisten sholat 5 waktu dengan khusyu'\n2. Menutup aurat dengan sempurna sesuai syariat\n3. Memiliki pemahaman Islam yang benar (Ahlusunnah wal Jama'ah)\n4. Taat kepada Allah, Rasul-Nya, dan suami (dalam kebaikan)\n5. Menjaga kehormatan diri dan keluarga\n6. Akhlak mulia: sopan santun, tawadhu', jujur, amanah, penyabar\n7. Menghormati dan berbakti kepada kedua orang tua",
    secondaryCriteria:
      "Mampu atau mau belajar mengelola rumah tangga (memasak, mengurus rumah). Memiliki pendidikan yang cukup untuk mendidik anak-anak. Latar belakang keluarga yang baik dan taat beragama. Sehat jasmani dan rohani untuk menjalankan kewajiban sebagai istri dan ibu.",
    worldlyPreferences:
      "Yang penting: terawat, bersih, dan sopan dalam penampilan. Tidak harus cantik menurut standar dunia, yang penting menarik di mata suami. Tinggi badan dan detail fisik lainnya fleksibel. Latar belakang suku/etnis terbuka selama tidak ada halangan syar'i.",
    ageRangePreference: "22-26 tahun (lebih muda 2-6 tahun)",

    // Additional Information
    healthStatus: "Alhamdulillah sehat, tidak ada riwayat penyakit serius. Rutin medical check-up tahunan.",
    previousMarriage: "never",
    availabilityForTaaruf: "Siap untuk proses ta'aruf dalam 3-6 bulan ke depan, insya Allah",
    contactMethod:
      "Melalui platform ta'aruf atau dengan seizin wali. Bisa dihubungi melalui fasilitator terlebih dahulu.",
  },

  "female-professional": {
    // Basic Information
    fullName: "Siti Nurhaliza",
    age: "25 tahun",
    gender: "female",
    currentResidence: "Jakarta Selatan, DKI Jakarta",
    ethnicity: "Sunda",
    height: "158 cm",
    weight: "52 kg",

    // Religious Background
    dailyPractices:
      "Alhamdulillah konsisten sholat 5 waktu, berusaha di awal waktu. Membaca Al-Quran setiap hari minimal 2 halaman. Mengikuti kajian akhwat rutin setiap Ahad pagi di masjid. Aktif dalam kegiatan sosial dan dakwah di komunitas muslimah.",
    islamicStudies:
      "Alumni Pesantren Putri Al-Hikmah (2014-2017). Mengikuti kajian intensif Fiqh Wanita dan Adab Rumah Tangga. Belajar dengan Ustadzah Fatimah tentang pendidikan anak Islami. Aktif mengikuti daurah dan seminar keislaman.",
    spiritualGoals:
      "Ingin menjadi istri sholihah yang menjadi penenang hati suami dan ibu yang bisa mendidik anak-anak dengan nilai-nilai Islam. Target istiqomah menghafal juz 30 dan juz 1. Cita-cita bisa mengajarkan Al-Quran kepada anak-anak sendiri.",

    // Educational Background
    highestEducation: "S1 Psikologi, Universitas Indonesia",
    certifications: "Certified Professional Counselor, Montessori Teacher Training",
    academicAchievements: "Cumlaude, IPK 3.68. Best Thesis Award 2021",

    // Professional Profile
    currentOccupation: "Psikolog Anak di Klinik Tumbuh Kembang Anak",
    careerLevel: "entry",
    professionalGoals:
      "Ingin terus mengembangkan kompetensi dalam psikologi anak dan keluarga Islami. Bercita-cita membuka praktik konseling keluarga berbasis nilai Islam. Terbuka untuk fokus pada keluarga setelah menikah jika suami mengizinkan.",
    incomeRange: "Alhamdulillah cukup untuk kebutuhan pribadi, terbuka untuk didiskusikan",

    // Family Background
    familyStructure:
      "Anak pertama dari 3 bersaudara (2 perempuan, 1 laki-laki). Kedua orang tua masih lengkap dan sehat, Alhamdulillah.",
    parentsOccupation: "Ayah: Pengusaha konveksi, Ibu: Guru TK Islam",
    familyValues:
      "Keluarga kami sangat menjunjung tinggi nilai-nilai Islam, kejujuran, dan kasih sayang. Orang tua mengajarkan pentingnya ilmu agama, akhlak mulia, dan berbakti kepada sesama.",
    familyReligiousPractice:
      "Alhamdulillah keluarga sangat Islami. Rutin kajian keluarga setiap Jumat malam, sholat berjamaah, dan aktif di kegiatan masjid. Ibu saya aktif mengajar mengaji di TPQ.",

    // Personality & Interests
    characterDescription:
      "Saya adalah pribadi yang ramah, penyayang, dan senang membantu orang lain. Cenderung tenang dan tidak suka konflik. Suka mendengarkan dan memberikan dukungan emosional. Berusaha selalu tersenyum dan menjaga lisan dari hal-hal yang tidak bermanfaat.",
    hobbies:
      "Memasak (terutama kue dan masakan tradisional), membaca buku parenting Islami, berkebun sayuran organik, calligraphy Arab, dan mengajar mengaji anak-anak di TPQ.",
    strengths:
      "Penyabar, empati tinggi, pandai memasak dan mengurus rumah, mudah bergaul, dan senang belajar hal baru terutama yang berkaitan dengan rumah tangga dan pendidikan anak.",
    growthAreas:
      "Terkadang terlalu sensitif dan mudah terpengaruh perasaan orang lain. Masih perlu belajar lebih tegas dalam mengambil keputusan. Ingin lebih meningkatkan hafalan Al-Quran.",

    // Vision for Marriage
    marriageGoals:
      "Saya memandang pernikahan sebagai ibadah untuk menyempurnakan separuh deen. Ingin memiliki rumah tangga yang penuh keberkahan, menjadi istri yang sholihah, penenang hati suami, dan ibu yang bisa mendidik anak-anak dengan nilai-nilai Islam. Siap mendukung suami dalam mencapai tujuan dunia dan akhirat.",
    idealFamilyVision:
      "Rumah tangga yang sakinah, mawaddah, wa rahmah. Rumah yang penuh cinta kasih, saling menghormati, dan menjadi tempat yang nyaman untuk semua anggota keluarga. Ingin menciptakan lingkungan yang kondusif untuk tumbuh kembang anak-anak secara fisik, mental, dan spiritual.",
    preferredChildrenCount:
      "Insha Allah 3-4 anak, namun tetap tawakal pada ketentuan Allah. Yang terpenting bisa mendidik mereka menjadi anak-anak yang sholih dan sholihah.",
    residencePlan:
      "Saat ini tinggal di Jakarta. Terbuka untuk mengikuti suami ke mana pun Allah takdirkan, selama dalam kondisi yang baik untuk keluarga. Siap beradaptasi dengan lingkungan baru.",
    rolesResponsibilitiesView: "traditional",

    // Criteria for Potential Spouse
    primaryCriteria:
      "Mengikuti tuntunan Rasulullah ﷺ, agama dan akhlak adalah prioritas utama:\n\n1. Konsisten sholat 5 waktu, lebih baik berjamaah di masjid\n2. Memiliki pemahaman Islam yang benar (Ahlusunnah wal Jama'ah)\n3. Berakhlak mulia: jujur, amanah, penyayang, dan bertanggung jawab\n4. Bisa menjadi imam dan pemimpin keluarga yang baik\n5. Menghormati dan berbakti kepada kedua orang tua\n6. Menjaga pandangan dan pergaulan sesuai syariat\n7. Komitmen untuk mendidik anak-anak dengan nilai-nilai Islam",
    secondaryCriteria:
      "Memiliki pekerjaan dan penghasilan yang halal dan cukup untuk menafkahi keluarga. Latar belakang keluarga yang baik dan taat beragama. Siap menjadi kepala keluarga yang bertanggung jawab. Terbuka untuk komunikasi dan musyawarah dalam urusan keluarga.",
    worldlyPreferences:
      "Pendidikan minimal S1 (agar bisa menjadi partner diskusi dalam mendidik anak). Pekerjaan yang halal dan stabil. Penampilan yang rapi dan bersih. Tinggi badan dan detail fisik lainnya fleksibel, yang penting menjaga diri sesuai syariat.",
    ageRangePreference: "27-32 tahun (lebih tua 2-7 tahun)",

    // Additional Information
    healthStatus: "Alhamdulillah sehat, tidak ada riwayat penyakit serius. Rutin medical check-up.",
    previousMarriage: "never",
    availabilityForTaaruf: "Siap untuk proses ta'aruf segera, dengan seizin dan pendampingan wali",
    contactMethod:
      "Melalui wali (ayah) atau platform ta'aruf resmi. Mohon hubungi fasilitator terlebih dahulu untuk koordinasi dengan keluarga.",
  },
  "male-student": {
    fullName: "Abdullah",
    age: "22 tahun",
    gender: "male",
    currentResidence: "Jakarta Selatan",
    ethnicity: "Betawi",
    height: "170 cm",
    weight: "60 kg",
    dailyPractices: "Sholat 5 waktu di masjid, tilawah 1 juz/hari, puasa sunnah Senin-Kamis.",
    islamicStudies: "Mahasiswa LIPIA Jakarta, hafidz 30 juz.",
    spiritualGoals: "Menjadi ulama yang amil, membina keluarga dakwah.",
    highestEducation: "S1 Syariah LIPIA (Semester 7)",
    certifications: "Sanad Hafalan Quran",
    academicAchievements: "Juara 1 MHQ Nasional 2020",
    currentOccupation: "Mahasiswa / Guru Ngaji Privat",
    careerLevel: "student",
    professionalGoals: "Melanjutkan S2 di Madinah, menjadi dosen.",
    incomeRange: "Cukup untuk pribadi, siap berjuang bersama dari nol.",
    familyStructure: "Anak ke-3 dari 5 bersaudara.",
    parentsOccupation: "Ayah: Pedagang, Ibu: IRT",
    familyValues: "Sederhana, taat agama, ukhuwah.",
    familyReligiousPractice: "Sangat taat, lingkungan pesantren.",
    characterDescription: "Pendiam, tawadhu, serius dalam menuntut ilmu.",
    hobbies: "Membaca kitab, berenang.",
    strengths: "Hafalan kuat, sabar, qanaah.",
    growthAreas: "Komunikasi publik.",
    marriageGoals: "Menjaga iffah, menyempurnakan agama, memiliki keturunan penghafal Quran.",
    idealFamilyVision: "Keluarga penghafal Quran, hidup sederhana penuh berkah.",
    preferredChildrenCount: "Banyak (5+), insya Allah.",
    residencePlan: "Mengontrak dekat kampus/masjid.",
    rolesResponsibilitiesView: "traditional",
    primaryCriteria: "Hafidzah atau mau menghafal, sholehah, penurut, mau hidup sederhana.",
    secondaryCriteria: "Bisa mengajar anak, tidak banyak menuntut dunia.",
    worldlyPreferences: "Sederhana, menutup aurat sempurna (bercadar lebih disukai).",
    ageRangePreference: "18-22 tahun",
    healthStatus: "Sehat walafiat.",
    previousMarriage: "never",
    availabilityForTaaruf: "Siap menikah tahun ini.",
    contactMethod: "Melalui Ustadz pembina.",
  },
  "female-teacher": {
    fullName: "Aisyah",
    age: "24 tahun",
    gender: "female",
    currentResidence: "Bandung, Jawa Barat",
    ethnicity: "Sunda",
    height: "160 cm",
    weight: "55 kg",
    dailyPractices: "Sholat 5 waktu, dhuha, tahajud rutin, tilawah rutin.",
    islamicStudies: "Alumni pesantren modern, aktif kajian sunnah.",
    spiritualGoals: "Menjadi ibu madrasah pertama bagi anak-anak.",
    highestEducation: "S1 PGSD UPI Bandung",
    certifications: "Pelatihan Guru Qiroati",
    academicAchievements: "Lulusan Terbaik Fakultas",
    currentOccupation: "Guru SDIT",
    careerLevel: "entry",
    professionalGoals: "Mendirikan rumah tahfidz balita.",
    incomeRange: "UMR Bandung",
    familyStructure: "Anak pertama dari 2 bersaudara.",
    parentsOccupation: "Ayah: PNS, Ibu: Guru",
    familyValues: "Pendidikan adalah nomor satu, sopan santun.",
    familyReligiousPractice: "Taat, moderat, rutin pengajian.",
    characterDescription: "Penyabar, keibuan, ceria, suka anak-anak.",
    hobbies: "Mendongeng, membuat kerajinan tangan, memasak.",
    strengths: "Komunikasi anak baik, kreatif, telaten.",
    growthAreas: "Manajemen waktu.",
    marriageGoals: "Menjadi partner suami dalam kebaikan, mencetak generasi rabbani.",
    idealFamilyVision: "Rumah yang hangat, penuh tawa anak-anak dan lantunan Quran.",
    preferredChildrenCount: "3-4 anak.",
    residencePlan: "Ikut suami.",
    rolesResponsibilitiesView: "partnership",
    primaryCriteria: "Sholeh, bertanggung jawab, penyayang anak, tidak merokok.",
    secondaryCriteria: "Pendidikan setara atau lebih tinggi, pekerjaan tetap.",
    worldlyPreferences: "Rapih, bersih, enak dipandang.",
    ageRangePreference: "24-28 tahun",
    healthStatus: "Sehat.",
    previousMarriage: "never",
    availabilityForTaaruf: "Siap.",
    contactMethod: "Via Ibu/Wali.",
  },
  "male-entrepreneur": {
    fullName: "Rizky",
    age: "30 tahun",
    gender: "male",
    currentResidence: "Surabaya, Jawa Timur",
    ethnicity: "Jawa",
    height: "175 cm",
    weight: "75 kg",
    dailyPractices: "Menjaga sholat berjamaah, sedekah rutin, puasa senin kamis.",
    islamicStudies: "Kajian pengusaha muslim, belajar muamalah.",
    spiritualGoals: "Dakwah bil hal dengan harta.",
    highestEducation: "S1 Manajemen Bisnis",
    certifications: "Digital Marketing Certified",
    academicAchievements: "-",
    currentOccupation: "Owner Clothing Line Muslim",
    careerLevel: "entrepreneur",
    professionalGoals: "Ekspansi bisnis ke pasar global, buka cabang di tiap kota.",
    incomeRange: "Stabil, di atas rata-rata.",
    familyStructure: "Anak bungsu.",
    parentsOccupation: "Wiraswasta",
    familyValues: "Kerja keras, mandiri, dermawan.",
    familyReligiousPractice: "Cukup taat.",
    characterDescription: "Visioner, tegas, pekerja keras, loyal.",
    hobbies: "Traveling, gym/fitness, membaca buku bisnis.",
    strengths: "Leadership, finansial mapan, networking luas.",
    growthAreas: "Kadang terlalu sibuk kerja.",
    marriageGoals: "Mencari pendamping yang bisa mendukung visi misi, penyejuk hati saat lelah bekerja.",
    idealFamilyVision: "Keluarga yang kuat ekonominya agar bisa banyak membantu umat.",
    preferredChildrenCount: "2-3 anak.",
    residencePlan: "Sudah ada rumah pribadi di Surabaya.",
    rolesResponsibilitiesView: "traditional",
    primaryCriteria: "Cantik, sholehah, pintar membawa diri, supportif.",
    secondaryCriteria: "Pendidikan min D3/S1, bisa membaur dengan kolega.",
    worldlyPreferences: "Good looking, menjaga penampilan.",
    ageRangePreference: "23-27 tahun",
    healthStatus: "Fit.",
    previousMarriage: "never",
    availabilityForTaaruf: "Siap menikah secepatnya.",
    contactMethod: "Biodata CV Taaruf.",
  },
};

/**
 * Get preset by key
 */
export const getTaarufPreset = (key: string): Partial<TaarufPromptConfig> | undefined => {
  return TAARUF_PRESETS[key];
};

/**
 * Get all preset keys
 */
export const getTaarufPresetKeys = (): string[] => {
  return Object.keys(TAARUF_PRESETS);
};

/**
 * Get preset metadata for display
 */
export const TAARUF_PRESET_METADATA: Record<string, { label: string; description: string; gender: "male" | "female" }> =
  {
    "male-professional": {
      label: "Profesional Muda",
      description: "Software Engineer, 28 tahun, Yogyakarta - Siap menikah dan membangun keluarga",
      gender: "male",
    },
    "female-professional": {
      label: "Profesional Muda",
      description: "Psikolog Anak, 25 tahun, Jakarta - Siap menjadi istri sholihah dan ibu yang baik",
      gender: "female",
    },
    "male-student": {
      label: "Mahasiswa / Penuntut Ilmu",
      description: "Mahasiswa LIPIA, 22 tahun, Jakarta - Hafidz 30 Juz, fokus mencari ilmu dan siap menikah muda",
      gender: "male",
    },
    "female-teacher": {
      label: "Guru / Pendidik",
      description: "Guru SDIT, 24 tahun, Bandung - Penyabar, keibuan, dan aktif di organisasi sosial",
      gender: "female",
    },
    "male-entrepreneur": {
      label: "Wirausahawan",
      description: "Business Owner, 30 tahun, Surabaya - Mapan, visioner, dan mencari partner membangun umat",
      gender: "male",
    },
  };
