# PRD & Project Planning

## Kajian Note - Multi-Role Authentication System

---

## 📋 Product Requirements Document (PRD)

### 1. Overview

**Feature:** Multi-Role Authentication System  
**Version:** 2.0  
**Status:** Planning  
**Priority:** High  
**Target Release:** Q1 2025

### 2. Problem Statement

**Current State:**

- Auth system hanya support role `member` dengan Username + PIN
- Tidak ada mekanisme untuk role `admin`, `panitia`, `ustadz`
- Tidak ada approval workflow untuk role elevation
- Tidak ada admin panel untuk user management

**Impact:**

- Tidak bisa onboard staff/admin
- Tidak bisa delegate permissions
- Manual user management via database

### 3. Goals & Success Metrics

**Goals:**

- ✅ Support 4 roles: Admin, Panitia, Ustadz, Member
- ✅ Maintain user-friendly PIN auth for members
- ✅ Implement secure email auth for staff
- ✅ Build approval workflow for role requests
- ✅ Create admin panel for user management

**Success Metrics:**

- Registration success rate: >95% (members), >80% (staff)
- Role approval time: <24 hours average
- Login success rate: >98% (all roles)
- Zero unauthorized role escalation incidents

### 4. User Stories

#### 4.1 Member (Jamaah)

```
AS A jamaah
I WANT TO register dengan username + PIN
SO THAT saya bisa langsung mencatat kajian tanpa ribet
```

**Acceptance Criteria:**

- [x] Register dengan nama, username, PIN (6 digit)
- [x] Auto-approved, langsung bisa login
- [x] Email auto-generated
- [x] No email verification required

#### 4.2 Panitia/Ustadz (Self-Register)

```
AS A calon panitia/ustadz
I WANT TO request role upgrade
SO THAT saya bisa akses fitur khusus staff
```

**Acceptance Criteria:**

- [ ] Register dengan email + password
- [ ] Pilih role yang diminta (Panitia/Ustadz)
- [ ] Isi alasan request
- [ ] Status "Pending Approval"
- [ ] Dapat notifikasi saat approved/rejected

#### 4.3 Admin (User Management)

```
AS AN admin
I WANT TO manage user roles
SO THAT saya bisa kontrol akses sistem
```

**Acceptance Criteria:**

- [ ] Lihat daftar role requests (pending/approved/rejected)
- [ ] Approve/reject role requests dengan notes
- [ ] Create user langsung dengan role tertentu
- [ ] Generate invite link untuk staff baru
- [ ] Suspend/activate user accounts

#### 4.4 Invited User

```
AS AN invited user
I WANT TO register via invite link
SO THAT saya bisa langsung dapat role yang sesuai
```

**Acceptance Criteria:**

- [ ] Klik invite link dari email
- [ ] Form pre-filled dengan email & role
- [ ] Complete registration
- [ ] Auto-approved (bypass approval)

### 5. Technical Requirements

#### 5.1 Authentication Methods

| Role    | Auth Method      | Approval | Email Verification |
| ------- | ---------------- | -------- | ------------------ |
| Member  | Username + PIN   | Auto     | No                 |
| Panitia | Email + Password | Required | Yes                |
| Ustadz  | Email + Password | Required | Yes                |
| Admin   | Email + Password | Manual   | Yes                |

#### 5.2 Database Schema Changes

**New Tables:**

```sql
- role_requests (id, user_id, requested_role, reason, status, reviewed_by, etc)
- admin_invites (id, email, role, invite_code, invited_by, expires_at, etc)
```

**Updated Tables:**

```sql
users:
  + approval_status (pending|approved|rejected)
  + approved_by (UUID)
  + approved_at (TIMESTAMPTZ)
  + invite_code (TEXT)
  + status (active|pending|suspended|inactive)
```

#### 5.3 API Endpoints

**Auth:**

```
POST /auth/register              # Enhanced with role support
POST /auth/login                 # Auto-detect auth type
POST /auth/request-role          # Request role upgrade
```

**Admin:**

```
GET  /admin/role-requests        # List role requests
POST /admin/role-requests/:id/approve
POST /admin/role-requests/:id/reject
POST /admin/users                # Create user
POST /admin/invites              # Generate invite
GET  /admin/invites              # List invites
```

### 6. UI/UX Requirements

#### 6.1 Register Page

- **Tab 1:** "Jamaah (PIN)" - Current form (unchanged)
- **Tab 2:** "Staff (Email)" - New form with role selection

#### 6.2 Admin Panel (New)

- **Dashboard:** Quick stats (pending requests, active users)
- **Role Requests:** List with filter (pending/approved/rejected)
- **User Management:** CRUD users, suspend/activate
- **Invites:** Generate & manage invite links

#### 6.3 Profile Page (Enhancement)

- Show current role & status
- If pending: Show "Waiting for approval" badge
- If rejected: Show reason & allow re-request

### 7. Security Requirements

- ✅ PIN remains 6 digits (members only)
- ✅ Password min 8 characters (staff)
- ✅ Email verification mandatory (staff)
- ✅ Force password change on first login (admin-created users)
- ✅ Audit trail for role changes
- ✅ Prevent self-role-elevation
- ✅ Rate limiting on registration attempts

### 8. Out of Scope (Future)

- ⏳ Magic link authentication
- ⏳ 2FA for admin accounts
- ⏳ Social login (Google, Facebook)
- ⏳ Biometric authentication
- ⏳ Bulk user import

---

## 🗓️ Project Planning

### Phase 1: Database & Backend (Week 1)

#### Day 1-2: Database Migration

**Tasks:**

- [ ] Create migration scripts
- [ ] Add new columns to `users` table
- [ ] Create `role_requests` table
- [ ] Create `admin_invites` table
- [ ] Add indexes
- [ ] Test migration on dev environment

**Files to Create/Modify:**

```
supabase/migrations/
  └── 20250101_multi_role_auth.sql

database/schema/
  └── users.sql (update)
  └── role_requests.sql (new)
  └── admin_invites.sql (new)
```

**Owner:** Backend Developer  
**Estimate:** 16 hours

---

#### Day 3-4: Auth Services

**Tasks:**

- [ ] Update `auth.service.ts`
  - [ ] Enhance `register()` function
  - [ ] Enhance `login()` function
  - [ ] Add `registerWithPIN()`
  - [ ] Add `registerWithEmail()`
  - [ ] Add `validateInviteCode()`
- [ ] Create `roleRequest.service.ts`
  - [ ] `createRoleRequest()`
  - [ ] `getRoleRequests()`
  - [ ] `approveRoleRequest()`
  - [ ] `rejectRoleRequest()`

**Files to Create/Modify:**

```
src/services/supabase/
  ├── auth.service.ts (update)
  ├── roleRequest.service.ts (new)
  └── admin.service.ts (new)

src/types/
  ├── auth.types.ts (update)
  ├── roleRequest.types.ts (new)
  └── admin.types.ts (new)
```

**Owner:** Backend Developer  
**Estimate:** 16 hours

---

#### Day 5: Admin Services

**Tasks:**

- [ ] Create `admin.service.ts`
  - [ ] `createUserAsAdmin()`
  - [ ] `generateInviteCode()`
  - [ ] `getUsersList()`
  - [ ] `suspendUser()`
  - [ ] `activateUser()`
- [ ] Update permissions config
- [ ] Write unit tests

**Files to Create/Modify:**

```
src/services/supabase/
  └── admin.service.ts

src/config/
  └── permissions.ts (update)

tests/services/
  └── admin.service.test.ts (new)
```

**Owner:** Backend Developer  
**Estimate:** 8 hours

---

### Phase 2: Frontend Components (Week 2)

#### Day 1-2: Enhanced Register Form

**Tasks:**

- [ ] Update `RegisterForm.tsx`
  - [ ] Add tab switching (PIN/Email)
  - [ ] Create `RegisterWithPIN` component
  - [ ] Create `RegisterWithEmail` component
  - [ ] Add role selection dropdown
  - [ ] Add reason textarea (for role requests)
  - [ ] Handle invite code from URL
- [ ] Update register page
- [ ] Add validation schemas

**Files to Create/Modify:**

```
src/components/features/auth/
  ├── RegisterForm.tsx (update)
  ├── RegisterWithPIN.tsx (new)
  ├── RegisterWithEmail.tsx (new)
  └── RoleRequestForm.tsx (new)

src/schemas/
  └── auth.schema.ts (update)

src/pages/
  └── Register.tsx (update)
```

**Owner:** Frontend Developer  
**Estimate:** 16 hours

---

#### Day 3-4: Admin Panel

**Tasks:**

- [ ] Create admin layout
- [ ] Create `RoleRequestsList.tsx`
- [ ] Create `RoleRequestCard.tsx`
- [ ] Create `ApprovalDialog.tsx`
- [ ] Create `UserManagementTable.tsx`
- [ ] Create `CreateUserDialog.tsx`
- [ ] Create `InviteGenerator.tsx`

**Files to Create/Modify:**

```
src/pages/admin/
  ├── RoleRequests.tsx (new)
  ├── UserManagement.tsx (update)
  ├── Dashboard.tsx (new)
  └── Invites.tsx (new)

src/components/features/admin/
  ├── RoleRequestsList.tsx (new)
  ├── RoleRequestCard.tsx (new)
  ├── ApprovalDialog.tsx (new)
  ├── UserManagementTable.tsx (new)
  ├── CreateUserDialog.tsx (new)
  └── InviteGenerator.tsx (new)
```

**Owner:** Frontend Developer  
**Estimate:** 16 hours

---

#### Day 5: Profile & Status Components

**Tasks:**

- [ ] Update `Profile.tsx`
  - [ ] Show role & status
  - [ ] Show approval status badge
  - [ ] Add "Request Role Upgrade" button
- [ ] Create `RoleStatusBadge.tsx`
- [ ] Create `RoleRequestButton.tsx`
- [ ] Update navigation (show admin menu for admins)

**Files to Create/Modify:**

```
src/pages/
  └── Profile.tsx (update)

src/components/features/profile/
  ├── RoleStatusBadge.tsx (new)
  └── RoleRequestButton.tsx (new)

src/components/layout/
  └── Navigation.tsx (update)
```

**Owner:** Frontend Developer  
**Estimate:** 8 hours

---

### Referensi Cepat (Tidak Perlu Attach Docs)

**Copy-paste context ini jika butuh referensi:**

#### Tech Stack

```
Frontend: React 19 + Vite 7 + TypeScript 5.9
Styling: Tailwind 4.1 + shadcn/ui
State: Zustand 5.0
Forms: React Hook Form + Zod
Backend: Supabase (Auth + PostgreSQL + Edge Functions)
```

#### Current Auth Flow (Member Only)

```
Register: Nama → Username (auto) → PIN (6 digit) → Auto email: username@kajiannote.com
Login: Username + PIN → JWT token
```

#### Target Auth Flow (Multi-Role)

```
Member: Username + PIN → Auto-approved
Staff (Panitia/Ustadz): Email + Password → Pending approval
Admin: Email + Password → Manual creation only
Invited: Invite link → Auto-approved
```

#### Database Schema Summary

```sql
users: id, email, username, full_name, phone, role, auth_type,
       subscription_tier, approval_status, approved_by, status

role_requests: id, user_id, requested_role, reason, status,
               reviewed_by, created_at

admin_invites: id, email, role, invite_code, invited_by,
               expires_at, status
```

#### Key Services

```
src/services/supabase/
  ├── auth.service.ts (login, register, PIN/email auth)
  ├── roleRequest.service.ts (request, approve, reject)
  └── admin.service.ts (create user, generate invite)
```

---

### Maintaining Context Across Chats

**Create a Progress Log File:**

```markdown
# Multi-Role Auth - Progress Log

## Completed Tasks
- [x] 2025-01-01: Database schema designed
- [x] 2025-01-02: Migration script created & tested
- [x] 2025-01-03: Auth service updated

## Current Task
- [ ] Implementing RegisterWithEmail component
  - Started: 2025-01-04
  - Blocker: Need to clarify validation rules
  - File: src/components/features/auth/RegisterWithEmail.tsx

## Pending Tasks
- [ ] Create admin panel
- [ ] Write tests
- [ ] Deploy to staging

## Important Notes
- Using Supabase auth.admin.createUser() for admin-created users
- Invite codes expire after 7 days
- Email verification required for all staff roles

## Questions & Decisions
- Q: Should Ustadz require approval?
- A: Yes, same as Panitia (decided 2025-01-02)
````

**Attach Progress Log** to new chats for full context.

---

## 📝 Documentation Updates

After completion, update these docs:

1. **README.md**

   - Add multi-role auth description
   - Update setup instructions

2. **2_DOCUMENTATION.md**

   - Update authentication section
   - Document new API endpoints
   - Update database schema section

3. **API_DOCS.md** (create if not exists)

   - Document all admin endpoints
   - Include request/response examples

4. **USER_GUIDE.md** (create)
   - How to register as different roles
   - Admin panel user guide

---