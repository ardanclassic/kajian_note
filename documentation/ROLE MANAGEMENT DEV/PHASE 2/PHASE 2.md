# Phase 2 - UI Components Quick Start

## 📋 Files to Attach

```
From Phase 1B (8 files):
✅ roleRequest.types.ts
✅ adminInvite.types.ts
✅ noteShare.types.ts
✅ roleFeature.types.ts
✅ roleRequest.service.ts
✅ adminInvite.service.ts
✅ noteShare.service.ts
✅ roleFeature.service.ts

Reference (1 file):
✅ 1_PROJECT_STRUCTURE.md
```

---

## 🚀 Opening Prompt

```
Hi! Phase 1B complete - types & services ready.

**Starting Phase 2:** UI Components

**Goal:** Build admin panel & role management UI

**Tech Stack:**
- React 19 + TypeScript
- shadcn/ui (Table, Card, Dialog, Button)
- React Hook Form + Zod
- Zustand stores

**Implementation Plan:**
Sprint 1: Admin role approval (RoleRequestsList, ApprovalDialog)
Sprint 2: Member role request (RoleRequestForm, RoleStatusBadge)
Sprint 3: Admin invites (InviteGenerator, InviteList)
Sprint 4: Bulk sharing (BulkShareModal, RecipientSelector)
Sprint 5: Feature limits (useFeatureLimits hook)

**Current Sprint:** Sprint 1 - Admin Core

**Request:**
Create RoleRequestsList component:
- shadcn Table with columns: User, Role, Reason, Date, Actions
- Filter: All/Pending/Approved/Rejected
- Use roleRequest.service.ts for data
- Stop after component for review

Files attached: [list files]
```

---

## 🗺️ Roadmap (5 Sprints)

### Sprint 1: Admin Core (3-4h) 🔥
```
Components:
├── RoleRequestsList.tsx    - Table of requests
├── RoleRequestCard.tsx     - Single request view
├── ApprovalDialog.tsx      - Approve/reject modal
└── Page: /admin/role-requests

Priority: HIGH - Blocking feature!
```

### Sprint 2: Member Self-Service (2-3h)
```
Components:
├── RoleRequestForm.tsx     - Request role upgrade
├── RoleStatusBadge.tsx     - Show status
└── Update: Profile.tsx     - Add request section

Priority: HIGH - User onboarding
```

### Sprint 3: Admin Invites (3-4h)
```
Components:
├── InviteGenerator.tsx     - Generate links
├── InviteList.tsx          - View invites
├── Page: /admin/invites
└── Update: Register.tsx    - Handle invite codes

Priority: MEDIUM - Alternative onboarding
```

### Sprint 4: Bulk Sharing (4-5h)
```
Components:
├── BulkShareModal.tsx      - Main sharing UI
├── RecipientSelector.tsx   - Multi-select users
├── ShareHistoryList.tsx    - View shares
└── Update: NoteCard.tsx    - Add share button

Priority: MEDIUM - Main panitia feature
```

### Sprint 5: Feature Limits (2-3h)
```
Components:
├── useFeatureLimits.ts     - Hook for limits
├── SubscriptionGuard.tsx   - Block if exceeded
└── PanitiaUpgradeModal.tsx - Upgrade prompt

Priority: LOW - Nice-to-have
```

---

## 📁 New Files Structure

```
src/
├── components/features/
│   ├── admin/              🆕
│   │   ├── RoleRequestsList.tsx
│   │   ├── ApprovalDialog.tsx
│   │   ├── InviteGenerator.tsx
│   │   └── InviteList.tsx
│   ├── profile/
│   │   ├── RoleRequestForm.tsx     🆕
│   │   └── RoleStatusBadge.tsx     🆕
│   └── notes/
│       ├── BulkShareModal.tsx      🆕
│       └── RecipientSelector.tsx   🆕
│
├── pages/admin/
│   ├── RoleRequests.tsx    🆕
│   └── AdminInvites.tsx    🆕
│
└── hooks/
    └── useFeatureLimits.ts 🆕
```

---

## 🛣️ Routing Updates

```typescript
// src/routes/index.tsx
<Route path="/admin" element={<RoleBasedRoute allowedRoles={['admin']} />}>
  <Route path="role-requests" element={<RoleRequests />} />
  <Route path="invites" element={<AdminInvites />} />
</Route>

<Route path="/register/:inviteCode?" element={<Register />} />
```

---

## 💡 Quick Patterns

### Check Role
```typescript
const { user } = useAuthStore()
const isAdmin = user?.role === 'admin'
```

### Check Limit
```typescript
const { checkLimit, getLimit } = useFeatureLimits()
const canShare = await checkLimit('can_share_notes')
```

### Bulk Share
```typescript
// 1. Create batch
// 2. Insert shares (chunked 100)
// 3. Update batch stats
// 4. Show success
```

---

## 🧪 Testing Checklist

**Sprint 1:**
- [ ] Admin view/approve/reject requests
- [ ] User role updated after approval

**Sprint 2:**
- [ ] Member submit request
- [ ] Status badge shows correctly

**Sprint 3:**
- [ ] Admin generate invite
- [ ] Invite code works on register

**Sprint 4:**
- [ ] Panitia share to multiple users
- [ ] Recipients see shared note

**Sprint 5:**
- [ ] Limits enforced
- [ ] Upgrade prompt shows

---

## ✅ Phase 2 Complete

- [ ] All 5 sprints done
- [ ] Manual testing passed
- [ ] No console errors
- [ ] All features work

---

## 🎯 Component Template

```typescript
import { useState } from 'react'
import { RoleRequest } from '@/types/roleRequest.types'
import { approveRequest } from '@/services/...'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function RoleRequestCard({ request }: Props) {
  const [loading, setLoading] = useState(false)
  
  const handleApprove = async () => {
    setLoading(true)
    try {
      await approveRequest(request.id)
      toast.success('Approved!')
    } catch (error) {
      toast.error('Failed')
    } finally {
      setLoading(false)
    }
  }
  
  return <Card>{/* UI */}</Card>
}
```

---

**That's it! Build → Test → Ship! 🚀**