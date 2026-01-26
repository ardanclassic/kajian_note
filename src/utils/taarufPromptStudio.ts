import { type TaarufPromptConfig } from "@/types/promptStudio.types";

/**
 * Generates a comprehensive Biodata Ta'aruf prompt based on user configuration
 * Following the structure and guidelines from taaruf.md
 */
export const generateTaarufPrompt = (cfg: TaarufPromptConfig): string => {
  const parts: string[] = [];

  // HEADER
  parts.push("# Professional Biodata Taaruf Generator Prompt");
  parts.push("");
  parts.push("---");
  parts.push("");

  // ROLE & EXPERTISE ASSIGNMENT
  parts.push("## Role & Expertise Assignment");
  parts.push("");
  parts.push(
    "You are an **expert Islamic matchmaking consultant and professional Biodata writer** with specialized knowledge in:",
  );
  parts.push("");
  parts.push("- Creating dignified, authentic, and effective Biodata Taaruf documents for Muslim marriage seekers");
  parts.push("- Understanding Islamic marriage principles (mu'asyarah bil ma'ruf, compatibility, and transparency)");
  parts.push("- Balancing professionalism with warmth and sincerity in self-presentation");
  parts.push("- Southeast Asian Muslim cultural nuances in ta'aruf processes");
  parts.push("- Writing that attracts genuine, compatible matches while maintaining Islamic adab");
  parts.push("- Structuring information to facilitate meaningful, halal courtship conversations");
  parts.push("");
  parts.push(
    "Your expertise includes helping hundreds of Muslims find compatible spouses through well-crafted, honest, and appealing Biodata Taaruf documents that respect Islamic values while showcasing individual uniqueness.",
  );
  parts.push("");
  parts.push("---");
  parts.push("");

  // PROJECT CONTEXT & PURPOSE
  parts.push("## Project Context & Purpose");
  parts.push("");
  parts.push("**Target Audience:**");
  parts.push("- Prospective spouse and their family (wali)");
  parts.push("- Ta'aruf facilitators/mentors");
  parts.push("- Islamic matchmaking platforms/communities");
  parts.push("");
  parts.push("**Document Purpose:**");
  parts.push("- Facilitate halal introduction (ta'aruf) process");
  parts.push("- Present authentic self-presentation for marriage consideration");
  parts.push("- Enable informed, purposeful communication toward marriage");
  parts.push("- Demonstrate seriousness and readiness for marriage commitment");
  parts.push("");
  parts.push("**Emotional Goal:**");
  parts.push(
    "Create a Biodata Taaruf that is genuine, dignified, and appealing - inspiring confidence and interest while maintaining Islamic modesty and respect. The document should reflect the person's unique personality while demonstrating maturity and marriage readiness.",
  );
  parts.push("");
  parts.push("---");
  parts.push("");

  // SUBJECT INFORMATION
  parts.push("## Subject Information to Include");
  parts.push("");

  // Basic Information
  if (cfg.fullName || cfg.age || cfg.gender || cfg.currentResidence) {
    parts.push("### Basic Information:");
    parts.push("");
    if (cfg.fullName) parts.push(`- **Full Name:** ${cfg.fullName}`);
    if (cfg.age) parts.push(`- **Age:** ${cfg.age}`);
    if (cfg.gender) parts.push(`- **Gender:** ${cfg.gender === "male" ? "Laki-laki" : "Perempuan"}`);
    if (cfg.currentResidence) parts.push(`- **Current Residence:** ${cfg.currentResidence}`);
    if (cfg.ethnicity) parts.push(`- **Ethnicity/Suku:** ${cfg.ethnicity}`);
    if (cfg.height) parts.push(`- **Height:** ${cfg.height}`);
    if (cfg.weight) parts.push(`- **Weight:** ${cfg.weight}`);
    parts.push("");
  }

  // Religious Background
  parts.push("### Religious Background:");
  parts.push("");
  if (cfg.dailyPractices) parts.push(`- **Daily Islamic Practices:** ${cfg.dailyPractices}`);
  if (cfg.islamicStudies) parts.push(`- **Islamic Studies Background:** ${cfg.islamicStudies}`);
  if (cfg.spiritualGoals) parts.push(`- **Spiritual Goals:** ${cfg.spiritualGoals}`);
  parts.push("");

  // Educational Background
  if (cfg.highestEducation || cfg.certifications || cfg.academicAchievements) {
    parts.push("### Educational Background:");
    parts.push("");
    if (cfg.highestEducation) parts.push(`- **Highest Education:** ${cfg.highestEducation}`);
    if (cfg.certifications) parts.push(`- **Additional Certifications/Courses:** ${cfg.certifications}`);
    if (cfg.academicAchievements) parts.push(`- **Academic Achievements:** ${cfg.academicAchievements}`);
    parts.push("");
  }

  // Professional Profile
  if (cfg.currentOccupation || cfg.careerLevel || cfg.professionalGoals) {
    parts.push("### Professional Profile:");
    parts.push("");
    if (cfg.currentOccupation) parts.push(`- **Current Occupation:** ${cfg.currentOccupation}`);
    if (cfg.careerLevel) parts.push(`- **Career Level:** ${cfg.careerLevel}`);
    if (cfg.professionalGoals) parts.push(`- **Professional Goals:** ${cfg.professionalGoals}`);
    if (cfg.incomeRange) parts.push(`- **Income Range:** ${cfg.incomeRange} (can be discussed later)`);
    parts.push("");
  }

  // Family Background
  if (cfg.familyStructure || cfg.parentsOccupation || cfg.familyValues || cfg.familyReligiousPractice) {
    parts.push("### Family Background:");
    parts.push("");
    if (cfg.familyStructure) parts.push(`- **Family Structure:** ${cfg.familyStructure}`);
    if (cfg.parentsOccupation) parts.push(`- **Parents' Occupation:** ${cfg.parentsOccupation}`);
    if (cfg.familyValues) parts.push(`- **Family Values:** ${cfg.familyValues}`);
    if (cfg.familyReligiousPractice) parts.push(`- **Family's Religious Practice:** ${cfg.familyReligiousPractice}`);
    parts.push("");
  }

  // Personality & Interests
  if (cfg.characterDescription || cfg.hobbies || cfg.strengths || cfg.growthAreas) {
    parts.push("### Personality & Interests:");
    parts.push("");
    if (cfg.characterDescription) parts.push(`- **Character Description:** ${cfg.characterDescription}`);
    if (cfg.hobbies) parts.push(`- **Hobbies & Interests:** ${cfg.hobbies}`);
    if (cfg.strengths) parts.push(`- **Strengths:** ${cfg.strengths}`);
    if (cfg.growthAreas) parts.push(`- **Areas for Growth:** ${cfg.growthAreas}`);
    parts.push("");
  }

  // Vision for Marriage
  if (
    cfg.marriageGoals ||
    cfg.idealFamilyVision ||
    cfg.preferredChildrenCount ||
    cfg.residencePlan ||
    cfg.rolesResponsibilitiesView
  ) {
    parts.push("### Vision for Marriage:");
    parts.push("");
    if (cfg.marriageGoals) parts.push(`- **Marriage Goals:** ${cfg.marriageGoals}`);
    if (cfg.idealFamilyVision) parts.push(`- **Ideal Family Vision:** ${cfg.idealFamilyVision}`);
    if (cfg.preferredChildrenCount) parts.push(`- **Preferred Number of Children:** ${cfg.preferredChildrenCount}`);
    if (cfg.residencePlan) parts.push(`- **Residence Plan:** ${cfg.residencePlan}`);
    if (cfg.rolesResponsibilitiesView)
      parts.push(`- **Roles & Responsibilities View:** ${cfg.rolesResponsibilitiesView}`);
    parts.push("");
  }

  // Criteria for Potential Spouse
  if (cfg.primaryCriteria || cfg.secondaryCriteria || cfg.worldlyPreferences || cfg.ageRangePreference) {
    parts.push("### Criteria for Potential Spouse:");
    parts.push("");
    parts.push(
      '**Important Note:** Following the guidance of Prophet Muhammad ﷺ: "A woman is married for four things: her wealth, her lineage, her beauty, and her religion. So choose the religious one, may your hands be rubbed with dust (i.e., may you prosper)." (Bukhari & Muslim). Religion and good character should be the primary criteria, with worldly considerations being secondary.',
    );
    parts.push("");
    if (cfg.primaryCriteria) parts.push(`- **Primary Criteria (Religion & Akhlaq):** ${cfg.primaryCriteria}`);
    if (cfg.secondaryCriteria) parts.push(`- **Secondary Considerations:** ${cfg.secondaryCriteria}`);
    if (cfg.worldlyPreferences) parts.push(`- **Worldly Preferences (Not Primary):** ${cfg.worldlyPreferences}`);
    if (cfg.ageRangePreference) parts.push(`- **Age Range Preference:** ${cfg.ageRangePreference}`);
    parts.push("");
  }

  // Additional Information
  if (cfg.healthStatus || cfg.previousMarriage || cfg.availabilityForTaaruf || cfg.contactMethod) {
    parts.push("### Additional Information:");
    parts.push("");
    if (cfg.healthStatus) parts.push(`- **Health Status:** ${cfg.healthStatus}`);
    if (cfg.previousMarriage) parts.push(`- **Previous Marriage:** ${cfg.previousMarriage}`);
    if (cfg.availabilityForTaaruf) parts.push(`- **Availability for Ta'aruf:** ${cfg.availabilityForTaaruf}`);
    if (cfg.contactMethod) parts.push(`- **Contact Method:** ${cfg.contactMethod}`);
    parts.push("");
  }

  parts.push("---");
  parts.push("");

  // DOCUMENT STRUCTURE & FORMATTING
  parts.push("## Document Structure & Formatting");
  parts.push("");
  parts.push("### Recommended Biodata Taaruf Structure:");
  parts.push("");
  parts.push("```markdown");
  parts.push("# Biodata TA'ARUF");
  parts.push("");
  parts.push("---");
  parts.push("");
  parts.push("## 📋 IDENTITAS PRIBADI");
  parts.push("");
  parts.push("[Clean, organized presentation of basic info]");
  parts.push("");
  parts.push("---");
  parts.push("");
  parts.push("## ☪️ LATAR BELAKANG KEAGAMAAN");
  parts.push("");
  parts.push("[Detailed religious practice and spiritual journey]");
  parts.push("");
  parts.push("---");
  parts.push("");
  parts.push("## 🎓 PENDIDIKAN & PROFESIONAL");
  parts.push("");
  parts.push("[Education and career path]");
  parts.push("");
  parts.push("---");
  parts.push("");
  parts.push("## 👨‍👩‍👧‍👦 LATAR BELAKANG KELUARGA");
  parts.push("");
  parts.push("[Family background and values]");
  parts.push("");
  parts.push("---");
  parts.push("");
  parts.push("## 🌟 KEPRIBADIAN & MINAT");
  parts.push("");
  parts.push("[Personality traits, hobbies, strengths, and growth areas]");
  parts.push("");
  parts.push("---");
  parts.push("");
  parts.push("## 💍 VISI PERNIKAHAN");
  parts.push("");
  parts.push("[Marriage goals, family vision, and Islamic perspective on marriage]");
  parts.push("");
  parts.push("---");
  parts.push("");
  parts.push("## ✨ KRITERIA PASANGAN YANG DIHARAPKAN");
  parts.push("");
  parts.push("[Must-haves, preferences, and flexible areas]");
  parts.push("");
  parts.push("---");
  parts.push("");
  parts.push("## 📞 PENUTUP & KONTAK");
  parts.push("");
  parts.push("[Closing statement and contact method]");
  parts.push("```");
  parts.push("");
  parts.push("---");
  parts.push("");

  // WRITING GUIDELINES
  parts.push("## Writing Guidelines & Best Practices");
  parts.push("");
  parts.push("### ✅ DO's:");
  parts.push("");
  parts.push("**Authenticity & Honesty:**");
  parts.push("- ✓ Be genuinely yourself - authenticity attracts compatible matches");
  parts.push("- ✓ Present strengths honestly without exaggeration");
  parts.push("- ✓ Acknowledge growth areas with maturity and self-awareness");
  parts.push("- ✓ Share real interests and passions, not what sounds impressive");
  parts.push("");
  parts.push("**Islamic Adab:**");
  parts.push("- ✓ Use respectful, modest language appropriate for Muslim audience");
  parts.push("- ✓ Frame everything within Islamic context and values");
  parts.push("- ✓ Express marriage intentions with sincerity and seriousness");
  parts.push("- ✓ Demonstrate understanding of marriage as ibadah and responsibility");
  parts.push("");
  parts.push("**Clarity & Specificity:**");
  parts.push(
    '- ✓ Be specific about religious practices (e.g., "Pray 5x daily in congregation when possible" vs "religious")',
  );
  parts.push("- ✓ Provide concrete examples of personality traits");
  parts.push("- ✓ Clear criteria helps avoid mismatched connections");
  parts.push("- ✓ Specific enough to stand out, general enough to allow conversation");
  parts.push("");
  parts.push("**Professional Presentation:**");
  parts.push("- ✓ Well-organized sections with clear headings");
  parts.push("- ✓ Proper grammar and spelling (shows care and seriousness)");
  parts.push("- ✓ Appropriate length (2-3 pages, detailed but not overwhelming)");
  parts.push("- ✓ Easy to read formatting");
  parts.push("");
  parts.push("**Positive Framing:**");
  parts.push("- ✓ Focus on aspirations and growth mindset");
  parts.push("- ✓ Present challenges as learning experiences");
  parts.push("- ✓ Express openness to learning and partnership");
  parts.push("- ✓ Convey warmth and approachability");
  parts.push("");
  parts.push("### ❌ DON'Ts:");
  parts.push("");
  parts.push("**Avoid These Common Mistakes:**");
  parts.push('- ✗ Generic descriptions ("good person," "religious," "nice")');
  parts.push("- ✗ Negative language or complaining about past experiences");
  parts.push("- ✗ Excessive detail about wealth/status (comes across as materialistic)");
  parts.push("- ✗ Unrealistic or overly rigid worldly criteria that neglect religious priorities");
  parts.push("- ✗ Copying templates word-for-word (lacks authenticity)");
  parts.push("- ✗ Too brief (appears uncommitted) or too lengthy (overwhelming)");
  parts.push("- ✗ Inappropriate humor or casual language");
  parts.push("- ✗ Sharing overly personal details inappropriate for initial stage");
  parts.push("- ✗ Dishonesty or embellishment (foundation of marriage is honesty)");
  parts.push("- ✗ Focusing primarily on physical appearance or wealth (contradicts Prophetic guidance)");
  parts.push("- ✗ Using personality typing systems (MBTI, etc.) without Islamic basis");
  parts.push("- ✗ Language that suggests gender role equality contrary to Islamic qiwamah structure");
  parts.push("");
  parts.push("---");
  parts.push("");

  // TONE & STYLE
  parts.push("## Tone & Style Specifications");
  parts.push("");
  parts.push("**Overall Tone:**");
  parts.push("- Warm yet professional");
  parts.push("- Sincere and genuine");
  parts.push("- Mature and thoughtful");
  parts.push("- Respectful and modest");
  parts.push("- Optimistic and hopeful");
  parts.push("");
  parts.push("**Language Characteristics:**");
  parts.push('- First-person narrative ("Saya adalah..." / "I am...")');
  parts.push("- Balanced between formal and conversational");
  parts.push("- Indonesian formal language (avoid slang)");
  parts.push("- Islamic terminology used appropriately");
  parts.push("- Gender-appropriate expressions");
  parts.push("");
  parts.push("**Emotional Quality:**");
  parts.push("- Conveys readiness and seriousness about marriage");
  parts.push("- Expresses hope without desperation");
  parts.push("- Demonstrates self-awareness and maturity");
  parts.push("- Invites genuine connection and conversation");
  parts.push("");
  parts.push("---");
  parts.push("");

  // ISLAMIC COMPLIANCE
  parts.push("## Islamic Compliance Requirements");
  parts.push("");
  parts.push("### ⚠️ CRITICAL Islamic Adab in Biodata Taaruf:");
  parts.push("");
  parts.push("**Modesty (Tawadhu'):**");
  parts.push("- ✓ Present strengths with humility, acknowledging they are from Allah");
  parts.push("- ✓ Avoid arrogance or boastfulness about achievements");
  parts.push("- ✓ Balance confidence with recognition of imperfections");
  parts.push("");
  parts.push("**Honesty (Shidq):**");
  parts.push("- ✓ Absolute truthfulness in all information provided");
  parts.push("- ✓ Transparent about important matters (previous marriage, health, etc.)");
  parts.push("- ✓ No deception or hiding relevant information");
  parts.push("");
  parts.push("**Respect for Process:**");
  parts.push("- ✓ Acknowledge importance of wali (guardian) involvement");
  parts.push("- ✓ Express commitment to halal ta'aruf process");
  parts.push("- ✓ Respect for Islamic marriage procedures");
  parts.push("");
  parts.push("**Appropriate Boundaries:**");
  parts.push("- ✓ No inappropriate photos or physical descriptions beyond basic facts");
  parts.push("- ✓ Avoid overly romantic or emotional language");
  parts.push("- ✓ Maintain gender-appropriate communication style");
  parts.push("- ✓ No contact information that bypasses proper ta'aruf channels");
  parts.push("");
  parts.push("**Islamic Perspective on Marriage:**");
  parts.push("- ✓ Frame marriage as ibadah and completing half of deen");
  parts.push("- ✓ Express understanding of marriage rights and responsibilities");
  parts.push("- ✓ Show commitment to building sakinah, mawaddah, wa rahmah");
  parts.push("- ✓ Align goals with Islamic vision of family");
  parts.push("");
  parts.push("---");
  parts.push("");

  // QUALITY STANDARDS
  parts.push("## Quality Standards");
  parts.push("");
  parts.push("### Excellence Criteria:");
  parts.push("");
  parts.push("✅ **Completeness** - Covers all essential areas without feeling rushed");
  parts.push("✅ **Authenticity** - Genuinely reflects the person's character and values");
  parts.push("✅ **Professionalism** - Well-written, organized, and error-free");
  parts.push("✅ **Clarity** - Easy to understand, specific enough to be meaningful");
  parts.push("✅ **Islamic Alignment** - Reflects Islamic values and marriage principles");
  parts.push("✅ **Attractiveness** - Engaging and appealing to compatible matches");
  parts.push("✅ **Balanced** - Neither too brief nor overwhelmingly detailed");
  parts.push("✅ **Maturity** - Demonstrates marriage readiness and emotional intelligence");
  parts.push("");
  parts.push("### Success Indicators:");
  parts.push("");
  parts.push("- Attracts inquiries from genuinely compatible potential matches");
  parts.push("- Facilitates meaningful, purposeful conversations");
  parts.push("- Accurately represents the person (no surprises later)");
  parts.push("- Respected by wali and ta'aruf facilitators");
  parts.push("- Leads to connections based on shared values, not superficial factors");
  parts.push("");
  parts.push("---");
  parts.push("");

  // GENDER-SPECIFIC GUIDELINES
  if (cfg.gender === "male") {
    parts.push("## Additional Guidelines for Men's Biodata Taaruf:");
    parts.push("");
    parts.push("- Emphasize leadership qualities and responsibility");
    parts.push("- Clearly state financial readiness/stability");
    parts.push("- Demonstrate protective and caring nature (as qawwam)");
    parts.push("- Show understanding of husband's duties in Islam");
    parts.push("");
    parts.push("---");
    parts.push("");
  } else if (cfg.gender === "female") {
    parts.push("## Additional Guidelines for Women's Biodata Taaruf:");
    parts.push("");
    parts.push("- Emphasize nurturing and supportive qualities");
    parts.push("- Share homemaking skills or willingness to learn");
    parts.push("- Demonstrate understanding of wife's role in Islam");
    parts.push("- Balance between independence and partnership");
    parts.push("");
    parts.push("---");
    parts.push("");
  }

  // CLOSING STATEMENT TEMPLATE
  parts.push("## Closing Statement Template");
  parts.push("");
  parts.push("```markdown");
  parts.push("## 📞 PENUTUP & KONTAK");
  parts.push("");
  parts.push(
    "Alhamdulillah, demikian Biodata Ta'aruf ini saya susun dengan sepenuh hati dan kejujuran. Saya berharap melalui dokumen ini, saya bisa bertemu dengan pasangan yang Allah takdirkan untuk saya, yang bisa menjadi partner dalam membangun rumah tangga yang penuh keberkahan.",
  );
  parts.push("");
  parts.push(
    "Saya sangat menghargai proses ta'aruf yang sesuai syariat, melibatkan wali, dan dilakukan dengan niat yang tulus. Jika ada kecocokan dan tertarik untuk melanjutkan komunikasi, silakan hubungi saya melalui [platform ta'aruf/fasilitator] atau dengan seizin wali.",
  );
  parts.push("");
  parts.push("Semoga Allah memudahkan jodoh terbaik untuk kita semua. Aamiin.");
  parts.push("");
  parts.push("**Wassalamu'alaikum warahmatullahi wabarakatuh**");
  parts.push("");
  if (cfg.fullName) parts.push(`[${cfg.fullName}]`);
  if (cfg.contactMethod) parts.push(`[${cfg.contactMethod}]`);
  parts.push("```");
  parts.push("");
  parts.push("---");
  parts.push("");

  // REFERENCE KEYWORDS
  parts.push("## Reference Keywords");
  parts.push("");
  parts.push(
    "Islamic marriage, ta'aruf, Biodata Taaruf, Muslim matchmaking, halal courtship, spouse criteria, marriage readiness, Islamic values, family vision, religious compatibility, Southeast Asian Muslim, dignified self-presentation, authentic profile, marriage proposal, wali involvement",
  );
  parts.push("");
  parts.push("---");
  parts.push("");
  parts.push("**End of Brief** - May Allah guide you to your best match and bless your marriage journey! 🤲💚");

  return parts.join("\n");
};

/**
 * Validates the Ta'aruf config and returns array of error messages
 */
export const validateTaarufConfig = (cfg: TaarufPromptConfig): string[] => {
  const errors: string[] = [];

  // Required fields
  if (!cfg.fullName.trim()) {
    errors.push("Nama lengkap wajib diisi");
  }

  if (!cfg.age.trim()) {
    errors.push("Usia wajib diisi");
  }

  if (!cfg.gender) {
    errors.push("Jenis kelamin wajib dipilih");
  }

  if (!cfg.currentResidence.trim()) {
    errors.push("Tempat tinggal saat ini wajib diisi");
  }

  if (!cfg.dailyPractices.trim()) {
    errors.push("Praktik keagamaan sehari-hari wajib diisi");
  }

  if (!cfg.marriageGoals.trim()) {
    errors.push("Tujuan pernikahan wajib diisi");
  }

  if (!cfg.primaryCriteria.trim()) {
    errors.push("Kriteria utama pasangan wajib diisi");
  }

  return errors;
};
