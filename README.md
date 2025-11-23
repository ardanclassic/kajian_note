# Kajian Note

> Aplikasi catatan kajian dengan sistem auth yang user-friendly untuk jamaah masjid. Tidak perlu email, cukup username dan PIN!

![Version](https://img.shields.io/badge/version-3.1-blue)
![Status](https://img.shields.io/badge/status-MVP-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🔐 **Simple Auth** - Username + 6-digit PIN (no email required)
- 📝 **Notes Management** - Create, organize, and share kajian notes
- 🏷️ **Smart Tags** - Categorize notes with tags
- 👥 **Role-Based Access** - Admin, Panitia, Ustadz, Jamaah
- 💳 **Subscription Tiers** - Free, Premium, Advance
- 📄 **Export** - PDF export (Premium+)
- 🔒 **Privacy First** - Private notes by default

## 🚀 Tech Stack

**Frontend:**
- React 19.1.1 + Vite 7.1.7 + TypeScript 5.9.3
- Tailwind CSS 4.1.16 + shadcn/ui
- Zustand 5.0.8 (State Management)
- React Hook Form 7.66.0 + Zod 4.1.12

**Backend:**
- Supabase (Auth + PostgreSQL + Edge Functions)
- Lynk.id Payment Gateway (webhook-based)

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/yourusername/kajian-note.git
cd kajian-note

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your Supabase & Lynk.id credentials

# Run development server
npm run dev
```

## ⚙️ Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_LYNK_WEBHOOK_SECRET=your_lynk_webhook_secret
```

## 📊 Subscription Tiers

| Tier    | Price      | Notes     | Tags      | Features                    |
|---------|------------|-----------|-----------|----------------------------|
| Free    | Rp 0       | 10        | 3         | Basic features             |
| Premium | Rp 50K/mo  | 100       | 10        | Public notes, PDF export   |
| Advance | Rp 100K/mo | Unlimited | Unlimited | All features               |

## 🏗️ Project Structure

```
kajian_note/
├── src/
│   ├── components/     # UI components
│   ├── pages/          # Page components
│   ├── store/          # Zustand stores
│   ├── services/       # API services
│   ├── types/          # TypeScript types
│   ├── schemas/        # Zod validation schemas
│   └── config/         # App configuration
├── supabase/
│   └── functions/      # Edge functions (webhooks)
└── public/             # Static assets
```

## 👥 User Roles

- **Admin** - Full system access, user management
- **Panitia** - User support, password reset
- **Ustadz** - Create public notes, full export
- **Jamaah** - Basic note-taking (with subscription limits)

## 🔒 Authentication Flow

1. Register with username + 6-digit PIN
2. Auto-login after registration
3. Dummy email: `{username}@kajiannote.local`
4. Password reset via Admin/Panitia

## 💳 Payment Flow

1. User clicks "Upgrade" → Redirects to Lynk.id
2. User enters real email + pays via QRIS/Bank
3. Lynk.id sends webhook to backend
4. Backend matches user by email
5. Subscription auto-updated

⚠️ **Note:** Real email required for payment matching!

## 🛠️ Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint
```

## 📝 Database Schema

Key tables:
- `users` - User accounts & profiles
- `subscriptions` - Subscription records
- `payment_webhooks` - Payment webhook logs
- `notes` - User notes & content

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Supabase)
```bash
# Deploy edge functions
supabase functions deploy lynk-webhook
```

## 📚 Documentation

- [Project Summary](./docs/project_summary_1.md) - Full specifications
- [API Documentation](./docs/api.md) - API endpoints (coming soon)
- [Deployment Guide](./docs/deployment.md) - Production setup (coming soon)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Your Name - [@ardanclassic]

## 🙏 Acknowledgments

- Supabase for amazing backend infrastructure
- shadcn/ui for beautiful UI components
- Lynk.id for payment gateway
- All jamaah masjid who inspired this project

---

**Built with ❤️ for Jember Muslim Lab**