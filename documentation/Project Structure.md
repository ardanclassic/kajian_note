# Alwaah - Project Structure

---

## 📖 Project Overview

**Alwaah** - Aplikasi Muslim Productivity Suite.

### Core Modules

1. **Smart Note** (YouTube Import + AI Summary)
2. **Creation Suite** (Content Studio + Prompt Studio)
3. **Quest Multiplayer** (Realtime Quiz)
4. **Auth & Subscription system**

---

## 📁 Project Structure

```
kajian_note_9/
├── 📁 documentation/
│   ├── 📄 Documentation.md
│   ├── 📄 Project Structure.md
│   └── 📄 Supabase Setup & Config.md
│
├── 📁 public/
│   ├── 📄 logo.png
│   ├── 📄 logo.svg
│   └── ...
│
├── � src/
│   │
│   ├── 📁 assets/
│   │   ├── 📁 icons/
│   │   ├── 📁 images/
│   │   └── 📁 lottie/
│   │
│   ├── 📁 components/
│   │   │
│   │   ├── 📁 common/
│   │   │   ├── 📄 CatLoading.tsx
│   │   │   ├── 📄 ConfirmDialog.tsx
│   │   │   ├── 📄 Loading.tsx
│   │   │   ├── 📄 PageHeader.tsx
│   │   │   └── 📄 ScrollToTopButton.tsx
│   │   │
│   │   ├── 📁 features/
│   │   │   │
│   │   │   ├── 📁 auth/
│   │   │   │   ├── 📄 ProgressIndicator.tsx
│   │   │   │   ├── 📄 TypeformLoginForm.tsx
│   │   │   │   ├── 📄 TypeformRegisterForm.tsx
│   │   │   │   └── 📄 TypeformStep.tsx
│   │   │   │
│   │   │   ├── 📁 content-studio/
│   │   │   │   ├── 📁 components/
│   │   │   │   │   ├── 📁 toolbar/              (Editing Controls)
│   │   │   │   │   │   ├── 📄 CornerControl.tsx
│   │   │   │   │   │   ├── 📄 FillColorControl.tsx
│   │   │   │   │   │   ├── 📄 FontFamilySelect.tsx
│   │   │   │   │   │   ├── 📄 FontSizeCombobox.tsx
│   │   │   │   │   │   ├── 📄 LayerOrderPopover.tsx
│   │   │   │   │   │   ├── 📄 LineControls.tsx
│   │   │   │   │   │   ├── 📄 PositionControl.tsx
│   │   │   │   │   │   └── 📄 ...
│   │   │   │   │   ├── 📄 BlueprintImportDialog.tsx
│   │   │   │   │   ├── 📄 CaptionDisplay.tsx
│   │   │   │   │   ├── 📄 ContentPromptGeneratorDialog.tsx
│   │   │   │   │   ├── 📄 DragDropOverlay.tsx
│   │   │   │   │   ├── 📄 ElementInspector.tsx
│   │   │   │   │   ├── 📄 ElementToolbar.tsx
│   │   │   │   │   ├── 📄 ExportButton.tsx
│   │   │   │   │   ├── 📄 FloatingSelectionMenu.tsx
│   │   │   │   │   ├── 📄 ImageCropper.tsx
│   │   │   │   │   ├── 📄 LoadingOverlay.tsx
│   │   │   │   │   ├── 📄 Sidebar.tsx
│   │   │   │   │   ├── 📄 SlideNavigator.tsx
│   │   │   │   │   ├── 📄 SupportingBoxesToolbar.tsx
│   │   │   │   │   ├── 📄 TemplateBrowser.tsx
│   │   │   │   │   └── 📄 TopToolbar.tsx
│   │   │   │   ├── 📁 hooks/
│   │   │   │   │   ├── 📄 useCanvas.ts
│   │   │   │   │   └── � useKeyboardShortcuts.ts
│   │   │   │   ├── 📄 CanvasEditor.tsx
│   │   │   │   ├── 📄 Editor.tsx
│   │   │   │   └── 📄 index.ts
│   │   │   │
│   │   │   ├── 📁 dashboard/
│   │   │   │   └── 📄 MenuArea.tsx
│   │   │   │
│   │   │   ├── 📁 notes/
│   │   │   │   ├── 📁 WaitingExperience/        (AI Waiting Screen)
│   │   │   │   │   ├── � ContentSelector.tsx
│   │   │   │   │   ├── 📄 QuizMode.tsx
│   │   │   │   │   ├── � StoryMode.tsx
│   │   │   │   │   └── 📄 WaitingExperienceOverlay.tsx
│   │   │   │   ├── 📄 BackgroundTaskBanner.tsx
│   │   │   │   ├── � ExportActionsDropdown.tsx
│   │   │   │   ├── 📄 NoteCard.tsx
│   │   │   │   ├── � NoteForm.tsx
│   │   │   │   ├── 📄 NoteList.tsx
│   │   │   │   ├── � NoteSearch.tsx
│   │   │   │   ├── 📄 NoteViewer.tsx
│   │   │   │   ├── � SendToTelegramButton.tsx
│   │   │   │   ├── � SendToWhatsAppButton.tsx
│   │   │   │   ├── 📄 SubscriptionLimitBanner.tsx
│   │   │   │   ├── � TiptapEditor.tsx
│   │   │   │   ├── 📄 YouTubeImportButton.tsx
│   │   │   │   └── 📄 YouTubeImportModal.tsx
│   │   │   │
│   │   │   ├── 📁 profile/
│   │   │   │   ├── 📄 ChangePINForm.tsx
│   │   │   │   └── 📄 EditProfileForm.tsx
│   │   │   │
│   │   │   ├── 📁 prompt-studio/
│   │   │   │   ├── 📁 components/
│   │   │   │   │   ├── 📁 common/
│   │   │   │   │   │   ├── 📄 GuideComponents.tsx
│   │   │   │   │   │   ├── 📄 PromptDialogLayout.tsx
│   │   │   │   │   │   └── 📄 PromptFormFields.tsx
│   │   │   │   │   ├── 📄 ImagePromptConfigForm.tsx
│   │   │   │   │   ├── 📄 ImagePromptGuide.tsx
│   │   │   │   │   ├── 📄 PromptPreview.tsx
│   │   │   │   │   ├── 📄 StorybookConfigForm.tsx
│   │   │   │   │   ├── 📄 StorybookGuide.tsx
│   │   │   │   │   ├── 📄 TaarufConfigForm.tsx
│   │   │   │   │   └── 📄 TaarufGuide.tsx
│   │   │   │   ├── 📁 dialogs/
│   │   │   │   │   ├── 📄 ImagePromptDialog.tsx
│   │   │   │   │   ├── 📄 PresetSelectionDialog.tsx
│   │   │   │   │   ├── 📄 StorybookPromptDialog.tsx
│   │   │   │   │   └── � TaarufPromptDialog.tsx
│   │   │   │   └── 📄 PromptStudioPage.tsx
│   │   │   │
│   │   │   ├── 📁 quest/
│   │   │   │   ├── 📁 multiplayer/
│   │   │   │   │   ├── � CreateRoomForm.tsx
│   │   │   │   │   ├── 📄 JoinRoomForm.tsx
│   │   │   │   │   ├── 📄 LobbyRoom.tsx
│   │   │   │   │   ├── 📄 MultiplayerGame.tsx
│   │   │   │   │   ├── 📄 MultiplayerResults.tsx
│   │   │   │   │   └── 📄 QuestMultiplayerView.tsx
│   │   │   │   ├── � QuestionLimitDialog.tsx
│   │   │   │   ├── 📄 QuizSession.tsx
│   │   │   │   └── 📄 QuestPage.tsx
│   │   │   │
│   │   │   ├── 📁 settings/
│   │   │   ├── 📁 subscription/
│   │   │   │   ├── 📄 PaymentButton.tsx
│   │   │   │   ├── 📄 PricingTable.tsx
│   │   │   │   ├── � SubscriptionCard.tsx
│   │   │   │   └── 📄 UpgradeModal.tsx
│   │   │   └── 📁 theme/
│   │   │
│   │   ├── 📁 home/
│   │   │   ├── 📄 CTASection.tsx
│   │   │   ├── � FeaturesSection.tsx
│   │   │   ├── 📄 Footer.tsx
│   │   │   ├── 📄 HeroSection.tsx
│   │   │   ├── 📄 HowItWorksSection.tsx
│   │   │   ├── 📄 PricingSection.tsx
│   │   │   ├── 📄 StatsSection.tsx
│   │   │   └── 📄 index.tsx
│   │   │
│   │   ├── 📁 layout/
│   │   │   ├── 📄 AppSidebar.tsx
│   │   │   └── 📄 TopHeader.tsx
│   │   │
│   │   └── 📁 ui/
│   │       ├── 📄 (shadcn components...)
│   │       └── ...
│   │
│   ├── 📁 config/
│   │   ├── � env.ts
│   │   ├── 📄 payment.ts
│   │   ├── 📄 permissions.ts
│   │   ├── 📄 theme.ts
│   │   └── 📄 youtube.ts
│   │
│   ├── �📁 data/
│   │   └── 📁 waiting-experience/
│   │
│   ├── 📁 lib/
│   │   ├── 📄 axios.ts
│   │   ├── 📄 constants.ts
│   │   ├── 📄 imagekit.ts
│   │   ├── 📄 supabase.ts
│   │   └── ...
│   │
│   ├── 📁 pages/
│   │   ├── 📁 about/
│   │   │   └── 📄 About.tsx
│   │   ├── 📁 admin/
│   │   │   └── 📄 UserManagement.tsx
│   │   ├── 📁 authentication/
│   │   │   ├── � Login.tsx
│   │   │   └── 📄 Register.tsx
│   │   ├── �📁 content-studio/
│   │   │   └── 📄 index.tsx
│   │   ├── 📁 dashboard/
│   │   │   └── 📄 Dashboard.tsx
│   │   ├── 📁 landing/
│   │   │   └── � Landing.tsx
│   │   ├── 📁 notes/
│   │   ├── 📁 profile/
│   │   │   └── 📄 Profile.tsx
│   │   ├── 📁 prompt-studio/
│   │   │   └── 📄 index.tsx
│   │   ├── 📁 quest/
│   │   │   └── 📄 index.tsx
│   │   └── ...
│   │
│   ├── 📁 routes/
│   ├── 📁 schemas/
│   │
│   ├── 📁 services/
│   │   ├── 📁 supabase/
│   │   │   ├── 📄 QuestMultiplayerService.ts
│   │   │   ├── 📄 auth.service.ts
│   │   │   ├── 📄 database.service.ts
│   │   │   ├── 📄 notes.service.ts
│   │   │   ├── � questService.ts
│   │   │   ├── � subscription.service.ts
│   │   │   └── 📄 user.service.ts
│   │   └── 📁 youtube/
│   │
│   ├── 📁 store/
│   │   ├── 📄 authStore.ts
│   │   ├── 📄 contentStudioStore.ts    (NEW)
│   │   ├── 📄 notesStore.ts
│   │   ├── 📄 questStore.ts            (NEW)
│   │   ├── 📄 subscriptionStore.ts
│   │   ├── 📄 themeStore.ts
│   │   └── 📄 userStore.ts
│   │
│   ├── 📁 styles/
│   ├── 📁 types/
│   │   ├── 📄 contentStudio.types.ts
│   │   ├── 📄 multiplayer.types.ts
│   │   └── ...
│   │
│   ├── 📁 utils/
│   ├── 📄 App.tsx
│   └── 📄 main.tsx
│
├── 📄 .env
├── 📄 package.json
└── 📄 vite.config.ts
```
