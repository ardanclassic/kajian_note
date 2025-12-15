# Next Session - Quick Start Guide

## 📋 Files to Attach (Priority Order)

### 1. **Backend Context** (Already Done)
```
✅ 20250113_multi_role_complete.sql
✅ rollback.sql
✅ migration_guide.md
```
**Status:** Migration READY to run

---

### 2. **Project Structure** (Reference)
```
✅ 1_PROJECT_STRUCTURE.md (updated)
✅ 4_PRD_PROJECT_PLAN_v2.md
```

---

### 3. **Current Types** (For Reference)
```
✅ src/types/user.types.ts
✅ src/types/auth.types.ts
```

---

### 4. **Existing Services** (Optional - attach if asked)
```
- src/services/supabase/auth.service.ts
- src/services/supabase/user.service.ts
- src/services/supabase/notes.service.ts
```

---

## 🚀 Opening Prompt for Next Session

Copy-paste this:

```
Hi! Lanjutan dari session sebelumnya.

**Context:**
Kajian Note - Multi-role auth migration sudah SELESAI di backend:
- ✅ Migration SQL ready (20250113_multi_role_complete.sql)
- ✅ Database schema complete (5 new tables)
- ✅ RLS policies active

**Current Phase:** Frontend Implementation

**What I need:**
1. TypeScript types untuk new tables (role_requests, admin_invites, note_shares, role_features, note_share_batches)
2. New service files untuk handle multi-role operations
3. Guidance on which existing files need updates

**Project Info:**
- Tech: React 19 + TypeScript 5.9 + Zustand + Supabase
- Structure: Services in src/services/supabase/
- Types: src/types/ (separate files per feature)

**Files attached:**
- 1_PROJECT_STRUCTURE.md (updated structure)
- 4_PRD_PROJECT_PLAN_v2.md (requirements)
- user.types.ts & auth.types.ts (current types)
- Migration files (for reference)

**Request:**
Please create TypeScript types for the 5 new tables, then guide me on service implementation.

Start with types first, stop for confirmation, then proceed with services.
```

---

## 🎯 What to Expect Next Session

### Phase 1: TypeScript Types (~10 min)
**Output:**
```
src/types/
├── roleRequest.types.ts  🆕
├── adminInvite.types.ts  🆕
├── noteShare.types.ts    🆕
└── roleFeature.types.ts  🆕
```

### Phase 2: Service Files (~20 min)
**Output:**
```
src/services/supabase/
├── roleRequest.service.ts  🆕
├── adminInvite.service.ts  🆕
├── noteShare.service.ts    🆕
└── roleFeature.service.ts  🆕
```

### Phase 3: Service Updates (~15 min)
**Update existing:**
```
src/services/supabase/
├── auth.service.ts      (add role request logic)
├── user.service.ts      (add approval workflow)
└── notes.service.ts     (add sharing logic)
```

### Phase 4: Zustand Stores (~10 min)
**New stores:**
```
src/store/
├── roleRequestStore.ts  🆕
└── noteShareStore.ts    🆕
```

### Phase 5: Components Guidance (~10 min)
**Checklist of components to build**

---

## 💡 Pro Tips for Next Session

### Keep It Focused
- One file at a time
- Stop for confirmation after each file
- Test incrementally

### Migration Order
1. ✅ Backend (done)
2. 🔄 Types (next)
3. 🔄 Services (after types)
4. 🔄 Stores (after services)
5. 🔄 Components (final)

### File Size Expectations
- Types: ~150-200 lines total
- Services: ~400-500 lines total
- Updates: ~50-100 lines per file

---

## 📝 Quick Reference

### New Tables Summary
```
1. role_requests       - User role upgrade requests
2. admin_invites       - Invite links for staff
3. note_shares         - Individual shares (bulk feature)
4. note_share_batches  - Batch tracking
5. role_features       - Feature flags (role + tier)
```

### New Columns in Users
```
- approval_status (pending/approved/rejected)
- approved_by (UUID)
- approved_at (TIMESTAMPTZ)
- invite_code (TEXT)
- status (active/pending/suspended/inactive)
```

### New Subscription Tiers
```
- panitia_basic
- panitia_pro
```

---

## ✅ Session Checklist

Before starting next session:

- [ ] Backend migration executed successfully
- [ ] Verification queries passed
- [ ] Basic tests done
- [ ] All migration files saved
- [ ] Project structure documented
- [ ] Ready to code frontend

---

## 🔥 That's It!

**Total prep time:** < 2 minutes  
**Files to attach:** 4-6 files  
**Context preserved:** 100%

**Just copy the opening prompt, attach files, and GO!** 🚀