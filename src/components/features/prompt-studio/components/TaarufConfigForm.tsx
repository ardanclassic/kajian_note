import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, Heart, Briefcase, Users, Sparkles, Target, Info, Clock, UserCircle } from "lucide-react";
import {
  type TaarufPromptConfig,
  GENDER_OPTIONS,
  CAREER_LEVEL_OPTIONS,
  PREVIOUS_MARRIAGE_OPTIONS,
  ROLES_RESPONSIBILITY_OPTIONS,
} from "@/types/promptStudio.types";
import { TAARUF_PRESET_METADATA } from "@/data/taarufPresets";
import { SectionHeader, PromptInput, PromptTextarea, PromptSelect } from "./common/PromptFormFields";

interface TaarufConfigFormProps {
  config: TaarufPromptConfig;
  setConfig: React.Dispatch<React.SetStateAction<TaarufPromptConfig>>;
  onOpenPresets: () => void;
}

export function TaarufConfigForm({ config, setConfig, onOpenPresets }: TaarufConfigFormProps) {
  return (
    <div className="space-y-4">
      {/* Quick Templates Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onOpenPresets}
        className="w-full bg-linear-to-r from-pink-500/10 to-rose-500/10 border-pink-500/30 hover:border-pink-500/50 text-pink-200 hover:bg-pink-500/20 transition-all"
      >
        <Clock className="w-3.5 h-3.5 mr-2" />
        Pilih Template Biodata
      </Button>

      {/* SECTION 1: BASIC INFORMATION */}
      <SectionHeader icon={User} title="Identitas Pribadi" colorClass="text-pink-200" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PromptInput
          label="Nama Lengkap"
          required
          value={config.fullName}
          onChange={(val) => setConfig((prev) => ({ ...prev, fullName: val }))}
          placeholder="Nama lengkap Anda"
        />
        <PromptInput
          label="Usia"
          required
          value={config.age}
          onChange={(val) => setConfig((prev) => ({ ...prev, age: val }))}
          placeholder="Contoh: 28 tahun"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PromptSelect
          label="Jenis Kelamin"
          required
          value={config.gender}
          onChange={(val) => setConfig((prev) => ({ ...prev, gender: val as "male" | "female" }))}
          options={GENDER_OPTIONS}
          color="pink"
        />
        <PromptInput
          label="Tempat Tinggal Saat Ini"
          required
          value={config.currentResidence}
          onChange={(val) => setConfig((prev) => ({ ...prev, currentResidence: val }))}
          placeholder="Kota, Provinsi"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <PromptInput
          label="Suku/Etnis"
          value={config.ethnicity || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, ethnicity: val }))}
          placeholder="Opsional"
        />
        <PromptInput
          label="Tinggi Badan"
          value={config.height || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, height: val }))}
          placeholder="Contoh: 170 cm"
        />
        <PromptInput
          label="Berat Badan"
          value={config.weight || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, weight: val }))}
          placeholder="Contoh: 65 kg"
        />
      </div>

      {/* SECTION 2: RELIGIOUS BACKGROUND */}
      <SectionHeader icon={Heart} title="Latar Belakang Keagamaan" colorClass="text-pink-200" />

      <PromptTextarea
        label="Praktik Keagamaan Sehari-hari"
        required
        value={config.dailyPractices}
        onChange={(val) => setConfig((prev) => ({ ...prev, dailyPractices: val }))}
        placeholder="Contoh: Sholat 5 waktu, membaca Al-Quran 1 juz/minggu, mengikuti kajian rutin..."
        rows={3}
      />

      <PromptTextarea
        label="Latar Belakang Pendidikan Islam"
        value={config.islamicStudies || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, islamicStudies: val }))}
        placeholder="Contoh: Alumni pesantren, mengikuti daurah, belajar dengan ustadz..."
        rows={2}
      />

      <PromptTextarea
        label="Tujuan Spiritual"
        value={config.spiritualGoals || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, spiritualGoals: val }))}
        placeholder="Contoh: Target hafalan, cita-cita umrah bersama keluarga..."
        rows={2}
      />

      {/* SECTION 3: EDUCATION & PROFESSIONAL */}
      <SectionHeader icon={Briefcase} title="Pendidikan & Profesional" colorClass="text-pink-200" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PromptInput
          label="Pendidikan Terakhir"
          value={config.highestEducation || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, highestEducation: val }))}
          placeholder="Contoh: S1 Teknik Informatika, Universitas..."
        />
        <PromptInput
          label="Sertifikasi/Kursus"
          value={config.certifications || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, certifications: val }))}
          placeholder="Sertifikasi tambahan (opsional)"
        />
      </div>

      <PromptInput
        label="Prestasi Akademik"
        value={config.academicAchievements || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, academicAchievements: val }))}
        placeholder="Jika ada prestasi yang notable"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PromptInput
          label="Pekerjaan Saat Ini"
          value={config.currentOccupation || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, currentOccupation: val }))}
          placeholder="Contoh: Software Engineer di PT..."
        />
        <PromptSelect
          label="Level Karir"
          value={config.careerLevel || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, careerLevel: val }))}
          options={CAREER_LEVEL_OPTIONS}
          color="blue"
        />
      </div>

      <PromptTextarea
        label="Tujuan Profesional"
        value={config.professionalGoals || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, professionalGoals: val }))}
        placeholder="Aspirasi karir Anda..."
        rows={2}
      />

      <PromptInput
        label="Rentang Penghasilan"
        value={config.incomeRange || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, incomeRange: val }))}
        placeholder="Opsional, bisa dibahas kemudian"
      />

      {/* SECTION 4: FAMILY BACKGROUND */}
      <SectionHeader icon={Users} title="Latar Belakang Keluarga" colorClass="text-pink-200" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PromptInput
          label="Struktur Keluarga"
          value={config.familyStructure || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, familyStructure: val }))}
          placeholder="Contoh: Anak ke-2 dari 4 bersaudara"
        />
        <PromptInput
          label="Pekerjaan Orang Tua"
          value={config.parentsOccupation || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, parentsOccupation: val }))}
          placeholder="Pekerjaan ayah dan ibu"
        />
      </div>

      <PromptTextarea
        label="Nilai-nilai Keluarga"
        value={config.familyValues || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, familyValues: val }))}
        placeholder="Prinsip-prinsip yang dijunjung keluarga..."
        rows={2}
      />

      <PromptInput
        label="Praktik Keagamaan Keluarga"
        value={config.familyReligiousPractice || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, familyReligiousPractice: val }))}
        placeholder="Tingkat praktik keagamaan keluarga"
      />

      {/* SECTION 5: PERSONALITY & INTERESTS */}
      <SectionHeader icon={Sparkles} title="Kepribadian & Minat" colorClass="text-pink-200" />

      <PromptTextarea
        label="Deskripsi Karakter"
        value={config.characterDescription || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, characterDescription: val }))}
        placeholder="Gambaran akhlak dan temperamen Anda..."
        rows={3}
      />

      <PromptTextarea
        label="Hobi & Minat"
        value={config.hobbies || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, hobbies: val }))}
        placeholder="3-5 minat halal yang Anda tekuni..."
        rows={2}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PromptTextarea
          label="Kelebihan"
          value={config.strengths || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, strengths: val }))}
          placeholder="Sifat positif yang Allah karuniakan..."
          rows={2}
        />
        <PromptTextarea
          label="Area Pengembangan"
          value={config.growthAreas || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, growthAreas: val }))}
          placeholder="1-2 hal yang ingin diperbaiki..."
          rows={2}
        />
      </div>

      {/* SECTION 6: VISION FOR MARRIAGE */}
      <SectionHeader icon={Target} title="Visi Pernikahan" colorClass="text-pink-200" />

      <PromptTextarea
        label="Tujuan Pernikahan"
        required
        value={config.marriageGoals}
        onChange={(val) => setConfig((prev) => ({ ...prev, marriageGoals: val }))}
        placeholder="Mengapa ingin menikah, perspektif Islami..."
        rows={3}
      />

      <PromptTextarea
        label="Visi Keluarga Ideal"
        value={config.idealFamilyVision || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, idealFamilyVision: val }))}
        placeholder="Gambaran rumah tangga yang diimpikan..."
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PromptInput
          label="Preferensi Jumlah Anak"
          value={config.preferredChildrenCount || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, preferredChildrenCount: val }))}
          placeholder="Contoh: 3-4 anak, InsyaaAllah"
        />
        <PromptInput
          label="Rencana Tempat Tinggal"
          value={config.residencePlan || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, residencePlan: val }))}
          placeholder="Rencana domisili setelah menikah"
        />
      </div>

      <PromptSelect
        label="Pandangan tentang Peran dalam Rumah Tangga"
        value={config.rolesResponsibilitiesView || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, rolesResponsibilitiesView: val }))}
        options={ROLES_RESPONSIBILITY_OPTIONS}
        color="purple"
      />

      {/* SECTION 7: CRITERIA FOR SPOUSE */}
      <SectionHeader icon={Heart} title="Kriteria Pasangan yang Diharapkan" colorClass="text-pink-200" />

      <PromptTextarea
        label="Kriteria Utama"
        required
        value={config.primaryCriteria}
        onChange={(val) => setConfig((prev) => ({ ...prev, primaryCriteria: val }))}
        placeholder="Contoh: Konsisten sholat 5 waktu, menutup aurat sempurna, akhlak mulia..."
        rows={3}
      />

      <PromptTextarea
        label="Pertimbangan Sekunder"
        value={config.secondaryCriteria || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, secondaryCriteria: val }))}
        placeholder="Latar belakang keluarga, kemampuan mengelola rumah tangga..."
        rows={2}
      />

      <PromptInput
        label="Preferensi Rentang Usia"
        value={config.ageRangePreference || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, ageRangePreference: val }))}
        placeholder="Contoh: 25-30 tahun"
      />

      <PromptTextarea
        label="Preferensi Lainnya"
        value={config.worldlyPreferences || ""}
        onChange={(val) => setConfig((prev) => ({ ...prev, worldlyPreferences: val }))}
        placeholder="Pendidikan, profesi, penampilan fisik (dalam batas syariat)..."
        rows={2}
      />

      {/* SECTION 8: ADDITIONAL INFORMATION */}
      <SectionHeader icon={Info} title="Informasi Tambahan" colorClass="text-pink-200" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PromptInput
          label="Status Kesehatan"
          value={config.healthStatus || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, healthStatus: val }))}
          placeholder="Kondisi kesehatan umum"
        />
        <PromptSelect
          label="Status Pernikahan Sebelumnya"
          value={config.previousMarriage || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, previousMarriage: val }))}
          options={PREVIOUS_MARRIAGE_OPTIONS}
          color="slate"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PromptInput
          label="Ketersediaan untuk Ta'aruf"
          value={config.availabilityForTaaruf || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, availabilityForTaaruf: val }))}
          placeholder="Contoh: Siap dalam 3-6 bulan"
        />
        <PromptInput
          label="Metode Kontak"
          value={config.contactMethod || ""}
          onChange={(val) => setConfig((prev) => ({ ...prev, contactMethod: val }))}
          placeholder="Melalui fasilitator/platform"
        />
      </div>
    </div>
  );
}
