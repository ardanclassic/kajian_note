# Kajian Note - Project Structure

---

## 📖 Project Overview

**Kajian Note** - Aplikasi catatan kajian dengan sistem auth yang user-friendly untuk orang tua yang tidak familiar dengan email, dilengkapi sistem subscription untuk monetisasi, dan **fitur import otomatis dari YouTube**.

### MVP Features

1. **Authentication System** - Username + PIN (6 digit)
2. **User Role Management** - Admin, Panitia, Ustadz, Member
3. **Subscription System** - Free, Premium, Advance tiers dengan Lynk.id payment gateway (webhook-based)
4. **Notes Management** - Create, read, update, delete notes (dengan subscription limits)
5. **YouTube Import** - Import transcript dari video YouTube (dengan/tanpa AI summary)
6. **Settings** - User preferences & app configuration

---

## �  Tech Stack

### Frontend:

- React 19.1.1 + Vite 7.1.7 + TypeScript 5.9.3
- Tailwind CSS 4.1.16 + shadcn/ui
- Zustand 5.0.8 (State)
- React Hook Form 7.66.0 + Zod 4.1.12
- Axios 1.13.1 (HTTP Client)

### Backend:

- Supabase 2.78.0 (Auth + PostgreSQL + Edge Functions)
- Lynk.id (Payment webhook-based, no API)
- **YouTube Transcript API** 🆕 (FastAPI + Docker)

### External APIs:

- **YouTube Transcript API** - Fetch video transcripts
- **OpenRouter API** - AI summarization (Optional)

---

## 📁 Project Structure

```
kajian_note/
├── 📁 documentation/
│   ├── 📄 project_summary_1.md
│   └── 📄 project_summary_2.md
│
├── 📁 public/
│
├── 📁 src/
│   │
│   ├── 📁 assets/
│   │   ├── 📁 icons/
│   │   │   └── 📄 react.svg
│   │   └── 📁 images/
│   │
│   ├── 📁 components/
│   │   │
│   │   ├── 📁 common/
│   │   │   ├── 📄 ConfirmDialog.tsx
│   │   │   ├── 📄 Loading.tsx
│   │   │   └── 📄 PageHeader.tsx
│   │   │
│   │   ├── 📁 features/
│   │   │   │
│   │   │   ├── 📁 auth/
│   │   │   │   ├── 📄 LoginForm.tsx
│   │   │   │   └── 📄 RegisterForm.tsx
│   │   │   │
│   │   │   ├── 📁 dashboard/
│   │   │   │   └── 📄 DashboardCard.tsx
│   │   │   │
│   │   │   ├── 📁 notes/
│   │   │   │   ├── 📄 ExportActionsDropdown.tsx
│   │   │   │   ├── 📄 NoteCard.tsx
│   │   │   │   ├── 📄 NoteForm.tsx
│   │   │   │   ├── 📄 NoteList.tsx
│   │   │   │   ├── 📄 NoteSearch.tsx
│   │   │   │   ├── 📄 NoteViewer.tsx
│   │   │   │   ├── 📄 SendToTelegramButton.tsx
│   │   │   │   ├── 📄 SendToWhatsAppButton.tsx
│   │   │   │   ├── 📄 SubscriptionLimitBanner.tsx
│   │   │   │   ├── 📄 TiptapEditor.tsx
│   │   │   │   ├── 📄 YouTubeImportButton.tsx
│   │   │   │   └── 📄 YouTubeImportModal.tsx
│   │   │   │
│   │   │   ├── 📁 profile/
│   │   │   │   ├── 📄 ChangePINForm.tsx
│   │   │   │   └── 📄 EditProfileForm.tsx
│   │   │   │
│   │   │   ├── 📁 settings/
│   │   │   │   ├── 📄 AppSettings.tsx
│   │   │   │   └── 📄 UserSettings.tsx
│   │   │   │
│   │   │   └── 📁 subscription/
│   │   │       ├── 📄 PaymentButton.tsx
│   │   │       ├── 📄 PricingTable.tsx
│   │   │       ├── 📄 SubscriptionCard.tsx
│   │   │       └── 📄 UpgradeModal.tsx
│   │   │
│   │   ├── 📁 home/
│   │   │   │
│   │   |   ├── 📄 CTASection.tsx
│   │   |   ├── 📄 FeaturesSection.tsx
│   │   |   ├── 📄 Footer.tsx
│   │   |   ├── 📄 HeroSection.tsx
│   │   |   ├── 📄 HowItWorksSection.tsx
│   │   |   ├── 📄 index.tsx
│   │   |   ├── 📄 PricingSection.tsx
│   │   |   └── 📄 StatsSection.tsx
│   │   │
│   │   └── 📁 ui/
│   │       ├── 📄 alert.tsx
│   │       ├── 📄 badge.tsx
│   │       ├── 📄 button.tsx
│   │       ├── 📄 card.tsx
│   │       ├── 📄 dialog.tsx
│   │       ├── 📄 form.tsx
│   │       ├── 📄 input.tsx
│   │       ├── 📄 label.tsx
│   │       └── 📄 table.tsx
│   │
│   ├── 📁 config/
│   │   ├── 📄 env.ts
│   │   ├── 📄 payment.ts
│   │   ├── 📄 permissions.ts
│   │   ├── 📄 theme.ts
│   │   └── 📄 youtube.ts
│   │
│   ├── 📁 lib/
│   │   ├── 📄 axios.ts
│   │   ├── 📄 constants.ts
│   │   ├── 📄 imagekit.ts
│   │   ├── 📄 imagekitDelete.ts
│   │   ├── 📄 supabase.ts
│   │   └── 📄 utils.ts
│   │
│   ├── 📁 pages/
│   │   │
│   │   ├── 📁 admin/
│   │   │   └── 📄 UserManagement.tsx
│   │   │
│   │   ├── 📁 notes/
│   │   │   ├── 📄 CreateNote.tsx
│   │   │   ├── 📄 EditNote.tsx
│   │   │   ├── 📄 index.tsx
│   │   │   └── 📄 ViewNote.tsx
│   │   │
│   │   ├── 📄 Dashboard.tsx
│   │   ├── 📄 Home.tsx
│   │   ├── 📄 Login.tsx
│   │   ├── 📄 NoteDetail.tsx
│   │   ├── 📄 NotFound.tsx
│   │   ├── 📄 Profile.tsx
│   │   ├── 📄 Register.tsx
│   │   ├── 📄 Settings.tsx
│   │   └── 📄 Subscription.tsx
│   │
│   ├── 📁 routes/
│   │   ├── 📄 index.tsx
│   │   ├── 📄 ProtectedRoute.tsx
│   │   ├── 📄 RoleBasedRoute.tsx
│   │
│   ├── 📁 schemas/
│   │   ├── 📄 auth.schema.ts
│   │   ├── 📄 notes.schema.ts
│   │   ├── 📄 subscription.schema.ts
│   │   └── 📄 user.schema.ts
│   │
│   ├── 📁 services/
│   │   └── 📁 storage/
│   │       └── 📄 imagekitStorage.ts
│   │   ├── 📁 supabase/
│   │   │   ├── 📄 auth.service.ts
│   │   │   ├── 📄 database.service.ts
│   │   │   ├── 📄 notes.service.ts
│   │   │   ├── 📄 subscription.service.ts
│   │   │   └── 📄 user.service.ts
│   │   └── 📁 youtube/
│   │       └── 📄 transcript.service.ts
│   │
│   ├── 📁 store/
│   │   ├── 📄 authStore.ts
│   │   ├── 📄 notesStore.ts
│   │   ├── 📄 subscriptionStore.ts
│   │   └── 📄 userStore.ts
│   │
│   ├── 📁 styles/
│   │   └── 📄 globals.css
│   │   └── 📄 print.css
│   │
│   ├── 📁 types/
│   │   ├── 📄 auth.types.ts
│   │   ├── 📄 index.ts
│   │   ├── 📄 notes.types.ts
│   │   ├── 📄 payment.types.ts
│   │   ├── 📄 subscription.types.ts
│   │   ├── 📄 user.types.ts
│   │   └── 📄 youtube.types.ts
│   │
│   ├── 📁 utils/
│   │   ├── 📄 exportUtils.ts
│   │   ├── 📄 paymentMatching.ts
│   │   ├── 📄 pdfGenerator.ts
│   │   ├── 📄 subscriptionLimits.ts
│   │   ├── 📄 textToHtml.ts
│   │   ├── 📄 whatsappHelper.ts
│   │   └── 📄 youtubeHelpers.ts
│   │
│   ├── 📄 App.tsx
│   └── 📄 main.tsx
│
├── 📄 .env
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 components.json
├── 📄 eslint.config.js
├── 📄 index.html
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 README.md
├── 📄 tsconfig.app.json
├── 📄 tsconfig.json
├── 📄 tsconfig.node.json
└── 📄 vite.config.ts
```
