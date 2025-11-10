# Kajian Note - Project Structure Best Practice

```
kajian_note/
├── public/                          # Static assets
│   ├── favicon.ico
│   └── images/
│
├── src/
│   ├── assets/                      # Asset files (images, fonts, icons)
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   │       └── react.svg
│   │
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── form.tsx
│   │   │   ├── label.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── index.ts             # Export barrel
│   │   │
│   │   ├── common/                  # Common shared components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   ├── layout/                  # Layout components
│   │   │   ├── MainLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── DashboardLayout.tsx
│   │   │
│   │   └── features/                # Feature-specific components
│   │       ├── auth/
│   │       │   ├── LoginForm.tsx
│   │       │   └── RegisterForm.tsx
│   │       └── dashboard/
│   │           └── DashboardCard.tsx
│   │
│   ├── pages/                       # Page components (routes)
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── NotFound.tsx
│   │
│   ├── lib/                         # Library configurations & utilities
│   │   ├── supabase.ts              # Supabase client setup
│   │   ├── axios.ts                 # Axios instance & interceptors
│   │   ├── utils.ts                 # Utility functions (cn, etc)
│   │   └── constants.ts             # App constants
│   │
│   ├── store/                       # Zustand state management
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   ├── themeStore.ts
│   │   └── index.ts
│   │
│   ├── services/                    # API services & data fetching
│   │   ├── api/
│   │   │   ├── auth.api.ts
│   │   │   ├── user.api.ts
│   │   │   └── index.ts
│   │   └── supabase/
│   │       ├── auth.service.ts
│   │       ├── database.service.ts
│   │       └── storage.service.ts
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── api.types.ts
│   │   └── supabase.types.ts
│   │
│   ├── schemas/                     # Zod validation schemas
│   │   ├── auth.schema.ts
│   │   ├── user.schema.ts
│   │   └── index.ts
│   │
│   ├── routes/                      # Route configuration
│   │   ├── index.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── routes.config.ts
│   │
│   ├── styles/                      # Global styles
│   │   ├── globals.css
│   │   ├── animations.css
│   │   └── utilities.css
│   │
│   ├── config/                      # App configuration
│   │   ├── env.ts                   # Environment variables
│   │   └── app.config.ts
│   │
│   ├── utils/                       # Utility functions
│   │   ├── formatters.ts            # Date, currency formatters
│   │   ├── validators.ts
│   │   ├── helpers.ts
│   │   └── index.ts
│   │
│   ├── App.tsx                      # Main App component
│   ├── App.css                      # App styles
│   ├── main.tsx                     # App entry point
│   └── vite-env.d.ts               # Vite type definitions
│
├── .env                             # Environment variables (local) - JANGAN COMMIT!
├── .env.example                     # Environment variables template
├── .env.local                       # Local development (git ignored)
├── .env.production                  # Production variables (git ignored)
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## 📁 Penjelasan Struktur

### **1. `src/components/`**
- **`ui/`**: Komponen UI dasar dari shadcn/ui atau custom UI components
- **`common/`**: Komponen yang digunakan di banyak tempat (Header, Footer, Loading)
- **`layout/`**: Komponen layout (MainLayout, AuthLayout)
- **`features/`**: Komponen yang spesifik untuk fitur tertentu

### **2. `src/pages/`**
- Setiap file mewakili satu halaman/route
- Berfungsi sebagai container untuk components

### **3. `src/lib/`**
- Konfigurasi library eksternal (Supabase, Axios)
- Utility functions yang general purpose

### **4. `src/store/`**
- Zustand stores untuk state management global
- Setiap store fokus pada domain tertentu

### **5. `src/services/`**
- API calls dan data fetching logic
- Terpisah antara REST API dan Supabase services

### **6. `src/types/`**
- TypeScript type definitions dan interfaces
- Satu file per domain/feature

### **7. `src/schemas/`**
- Zod validation schemas
- Untuk form validation dengan react-hook-form

### **8. `src/routes/`**
- Konfigurasi routing
- Protected routes logic

## 🎯 Best Practices

1. **Komponen**: Gunakan functional components
2. **Naming**: PascalCase untuk components, camelCase untuk functions
3. **Exports**: Gunakan named exports untuk better tree-shaking
4. **Types**: Selalu define types/interfaces
5. **Validation**: Gunakan Zod schemas untuk form validation
6. **State**: Zustand untuk state management (global & local state)
7. **API**: Centralize API calls di services folder
8. **Styling**: Tailwind utility classes + component variants
9. **Env Vars**: Gunakan prefix `VITE_` untuk vars yang accessible di browser

## 📝 File Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `Button.tsx`)
- **Utils**: `camelCase.ts` (e.g., `formatters.ts`)
- **Types**: `camelCase.types.ts` (e.g., `user.types.ts`)
- **Schemas**: `camelCase.schema.ts` (e.g., `auth.schema.ts`)
- **Services**: `camelCase.service.ts` atau `camelCase.api.ts`
- **Store**: `camelCase.store.ts` (e.g., `authStore.ts`)