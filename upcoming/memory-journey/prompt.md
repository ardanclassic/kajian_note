# Story Journey - Frontend Implementation Guide

## 🎯 Goal
Transform JSON blueprint into interactive story-based learning experience with progressive unlocking, challenges, and gamification.

---

## 🎨 Core Components

### 1. JourneyUploader
**Purpose:** Upload & validate JSON blueprint

**Features:**
- Drag & drop zone for JSON files
- File validation (size, format)
- Schema validation with Zod
- Preview modal showing: title, scenes count, total XP, themes
- Save to localStorage with generated ID
- Auto-navigate to journey page

---

### 2. JourneyMap
**Purpose:** Visual progress indicator

**Design:**
```
[✅]─────[🔵]─────[🔒]─────[🔒]─────[🔒]
Done   Current   Locked  Locked  Locked
```

**States:**
- **Completed:** Green, checkmark
- **Current:** Blue, pulsing animation
- **Locked:** Gray, lock icon

**Interactions:**
- Click unlocked scene → navigate
- Hover → show tooltip with scene title
- Smooth unlock animation when scene completed

---

### 3. SceneViewer
**Purpose:** Main content display

**Layout sections (vertical scroll):**

**A. Scene Header**
- Scene number badge
- Title (large, bold)
- Location with icon
- Character chips

**B. Story Content**
- Prose format, optimized for reading
- Line height 1.8, max-width 65ch
- Natural paragraph spacing

**C. Learning Content**
- Highlighted box (green-tinted background)
- Concept title + key points (bullets)
- Dalil box (if present):
  - Arabic text (right-aligned, larger font)
  - Translation
  - Source reference

**D. Challenge Section**
- Hidden initially
- "Lanjutkan ke Tantangan" button
- Slides down with animation when revealed
- Interactive challenge component

---

### 4. ChallengeComponent
**Purpose:** Interactive quiz with validation

**Challenge Types:**
- **Multiple Choice:** 4 options, radio selection
- **True/False:** Binary choice buttons
- **Fill in Blank:** Text input
- **Scenario Decision:** Like multiple choice, different styling
- **Sequence Ordering:** Drag & drop (use dnd-kit)

**Flow:**
1. Display question
2. User answers
3. Submit → validate
4. Show result (correct/incorrect)
5. Display explanation (always)
6. Award XP if correct
7. Enable "Next Scene" button

**Visual Feedback:**
- Selected: Highlighted
- Correct: Green border + checkmark
- Incorrect: Red border + X
- Shake animation on wrong
- Confetti on correct

---

### 5. CompletionModal
**Purpose:** Celebrate journey completion

**Content:**
- 🎉 Congratulations message
- Stats summary (XP, time, accuracy)
- Badges earned (visual)
- Action buttons:
  - Ulangi Journey
  - Kembali ke Dashboard
  - Coba Journey Lain

**Effects:**
- Fullscreen confetti
- Smooth fade-in animation

---

## 💾 localStorage Strategy

**Storage Keys:**
- `kajian-note-journey` → Zustand persist (active journey)
- `journey_{timestamp}` → Individual journey data

**Data Structure:**
```javascript
{
  id: "journey_123456",
  blueprint: {...},  // Full JSON
  progress: {
    completedScenes: [1, 2],
    currentScene: 3,
    totalXP: 100,
    sceneAnswers: {...},
    startedAt: "ISO date",
    completedAt: null,
    isCompleted: false
  },
  metadata: {
    title: "...",
    totalScenes: 7,
    totalXP: 350,
    difficulty: "sedang",
    themes: [...]
  }
}
```

**Key Functions:**
- `saveJourney()` → Store blueprint with generated ID
- `loadJourney(id)` → Retrieve journey data
- `updateProgress()` → Update scene completion
- `getAllJourneys()` → List all journeys (sorted by date)
- `deleteJourney(id)` → Remove journey

---

## 🎭 State Management (Zustand)

**Store Structure:**
```javascript
{
  currentJourney: Journey | null,
  currentSceneIndex: number,
  completedScenes: Set<number>,
  sceneAnswers: Map<number, any>,
  totalXP: number,
  isLoading: boolean,
  
  // Actions
  loadJourney(blueprintData),
  completeScene(sceneNumber, xp),
  unlockNextScene(),
  resetJourney()
}
```

**Auto-persist to localStorage** using Zustand persist middleware.

---

## 🔄 User Flow

**1. Upload Journey:**
- Drag JSON → Validate → Preview → Confirm → Save to localStorage → Navigate

**2. Start Journey:**
- Load from localStorage → Initialize Zustand → Show Scene 1

**3. Scene Interaction:**
- Read story → Review learning → Click "Tantangan" → Answer challenge → Submit

**4. Scene Completion:**
- Validate answer → Show feedback → Award XP (if correct) → Update localStorage → Unlock next scene

**5. Journey Complete:**
- All scenes done → Save final stats → Show celebration modal → Options to restart/continue

---

## 🎨 Design Guidelines

**Typography:**
- Story text: 18px, line-height 1.8
- Arabic dalil: 24px, right-aligned, Traditional Arabic font
- Scene title: 30px, bold

**Colors:**
- Completed scene: Green (#10b981)
- Current scene: Blue (#3b82f6)
- Locked scene: Gray (#9ca3af)
- Correct answer: Green-100 background
- Wrong answer: Red-100 background
- Learning content: Green-50 background

**Animations:**
- Scene transitions: Fade + slide (0.5s)
- Challenge reveal: Height expand (0.4s)
- XP bar fill: Smooth 1s animation
- Unlock scene: Scale + pulse effect
- Wrong answer: Shake animation
- Correct answer: Confetti burst

---

## 📱 Mobile Considerations

**Responsive Design:**
- Journey Map: Horizontal on desktop, vertical on mobile
- Larger touch targets (min 44px)
- Sticky header with progress
- Collapsible sections for learning content
- Bottom-fixed "Next Scene" button on mobile

**Performance:**
- Lazy load components (React.lazy)
- Memoize heavy computations
- Compress JSON if > 1MB before localStorage
- Reduce animations on low-end devices

---

## 🧪 Testing Strategy

**Validation:**
- JSON schema validation (Zod)
- File size/format checks
- Answer validation (all challenge types)

**Flow Testing:**
- Upload → Save → Load journey
- Complete scene → Unlock next
- Answer challenge → XP award → Progress save
- Complete all scenes → Show completion modal
- Refresh page → Progress persists

**Edge Cases:**
- localStorage full (5MB limit)
- Invalid JSON upload
- Navigation between scenes
- Multiple journeys management

---

## 💡 Key Implementation Notes

**localStorage Management:**
- Auto-save via Zustand persist (no manual sync needed)
- Generate unique ID with timestamp
- Store full blueprint + progress separately for efficiency
- Add cleanup utility (remove journeys > 30 days old)

**Challenge Validation:**
- Normalize text for fill-in-blank (lowercase, trim)
- Allow retries with explanation shown
- Track attempts per challenge (for analytics)

**Progress Tracking:**
- Mark scene completed only on correct answer
- Unlock next scene immediately
- Calculate total XP dynamically
- Track time spent per scene (optional)

**Error Handling:**
- User-friendly messages for all errors
- Graceful fallback if localStorage unavailable
- Validate data structure on load (prevent corruption)

**Analytics (via localStorage):**
- Journey completion rate
- Average time per scene
- Challenge accuracy by type
- Most abandoned scenes

---

## 🔄 Future Migration Path

**When scaling to Supabase:**
1. Keep localStorage as local cache
2. Add sync layer on scene/journey completion
3. Conflict resolution: latest timestamp wins
4. Offline queue: sync when back online

---

**Ready to build! 🚀**