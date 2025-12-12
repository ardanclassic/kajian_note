## 🔄 Prompt Continuation Strategy

### When Starting a New Chat

**Attach These Files (MINIMAL):**

```
📁 Essential Only (Token-Efficient):
  ├── 1_PROJECT_STRUCTURE.md
  └── 3_PRD_PROJECT_PLAN.md (this file)

📁 Current State (if available):
  ├── src/services/supabase/auth.service.ts (jika sedang kerjakan backend)
  ├── src/components/features/auth/RegisterForm.tsx (jika sedang kerjakan frontend)
  └── specific file yang sedang dikerjakan

⚠️ SKIP: 2_DOCUMENTATION.md (terlalu panjang, gunakan hanya jika butuh referensi spesifik)
```

**Prompt Template (Compact Version):**

```
Project: Kajian Note - Aplikasi catatan kajian berbasis web

**Tech Stack:** React + TypeScript + Supabase + Tailwind + shadcn/ui

**Current Task:** Implementasi Multi-Role Authentication System

**Context Singkat:**
- Saat ini: Only "member" role dengan Username + PIN (6 digit)
- Target: Support 4 roles (Admin, Panitia, Ustadz, Member)
- Strategy: Hybrid auth - PIN untuk member, Email/Password untuk staff
- Auth flow: Member auto-approved, Staff butuh approval

**Files Attached:**
1. PROJECT_STRUCTURE.md - Folder structure & file organization
2. PRD_PROJECT_PLAN.md - Requirements & planning detail

**Current Phase:** [Week 1/2/3/4] - [specific task name]

**Task Detail:**
[Describe what you need, e.g., "Implement registerWithEmail() function"]

**Specific Requirements:**
- [List 2-3 key requirements]
- [Any constraints or dependencies]

**Question/Request:**
[Your specific question or what you need help with]

[Optional: Paste code snippet if debugging]
```

---

### Alternative: Inline Context (Tanpa Attach File)

Jika tidak mau attach file sama sekali, gunakan prompt ini:

````
Project: Kajian Note - Aplikasi catatan kajian (React + TypeScript + Supabase)

**Background:**
Saat ini auth system hanya support "member" role dengan Username + PIN.
Perlu ditambah support untuk Admin, Panitia, Ustadz dengan approval workflow.

**Solution Design:**
- Member: Keep Username + PIN (user-friendly untuk jamaah)
- Staff: Email + Password dengan approval admin
- Admin: Manual creation dengan invite system
- Database: Add role_requests & admin_invites tables

**Current Implementation Phase:** [Week X - Task Y]

**Your Task:**
[Describe specific implementation task]

**What You Need:**
[Your specific question]

**Code Context:**
```typescript
// Paste relevant code here if needed
````

Tolong bantu [specific request].

```

---

### For Specific Tasks

#### Task 1: Database Migration
**Prompt:**
```

Context: Implementing multi-role auth system for Kajian Note.

Task: Create database migration script

Requirements from PRD:

- Add columns to users table (approval_status, approved_by, etc)
- Create role_requests table
- Create admin_invites table

Current schema: [attach users.sql]

Please create the migration SQL script following Supabase conventions.

```

#### Task 2: Auth Service Implementation
**Prompt:**
```

Context: Multi-role auth for Kajian Note

Task: Implement registerWithEmail() function

Requirements:

- Support email + password registration
- Handle role selection (panitia/ustadz)
- Set approval_status based on role
- Send verification email

Current code: [attach auth.service.ts]

Please update the service with the new function.

```

#### Task 3: Frontend Component
**Prompt:**
```

Context: Multi-role auth UI

Task: Create RegisterWithEmail component

Requirements:

- Form fields: email, password, confirm password, full_name, phone, role
- Validation with Zod
- Show "reason" field if role is panitia/ustadz
- Handle invite_code from URL params
- Use shadcn/ui components

Style: Follow existing RegisterForm.tsx patterns

Please create the component.

```

#### Task 4: Debugging
**Prompt:**
```

Context: Multi-role auth - debugging issue

Problem: [Describe the issue]

Error: [Paste error message]

Code: [Paste relevant code]

What I've Tried:

- [List attempts]

Documentation: [attach relevant docs]

Please help me identify the issue and suggest a fix.

```

---
```
