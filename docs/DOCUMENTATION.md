# JustPick — Complete Technical Documentation

---

## 1. Product Overview

**JustPick** is a mood-based decision engine for people who spend too long deciding what to eat or do. The user picks a mood, optionally filters by budget and time, and the app picks for them instantly.

**Core problem:** Decision fatigue. When it's lunchtime and you can't pick, or when the group chat goes silent because nobody wants to decide, JustPick makes the call.

**Target audience:** Global — the suggestion dataset reflects West African food culture and universal activities, making it accessible and relatable across markets.

**Live URL:** https://justpick-app.netlify.app  
**Repository:** https://github.com/kaabatapersonal-hub/justpick

---

## 2. Core Features

### Mood-Based Pick Engine
**What it does:** Filters the suggestion pool by the user's selected mood, category, budget, and time constraints, then picks one result at random.  
**User perspective:** Select a mood pill → tap "Just Pick for Me" → get a result in under a second.  
**Lives in:** `HomeScreen.jsx` (UI), `src/utils/pickEngine.js` (logic)

### Simple Mode
**What it does:** The default home screen. Shows five mood pills, a food/activity toggle, optional filters (budget, time), a main pick button, a Chaos Pick button, and a Daily Challenge card.  
**User perspective:** Choose a vibe, tap a button, done.  
**Lives in:** `HomeScreen.jsx` → `SimpleMode` component

### My Mode (Personalized)
**What it does:** After 3 picks, a "My Mode" toggle appears in the top bar. Activating it switches the home screen to a one-tap layout that remembers the user's last mood, category, budget, and time preferences.  
**User perspective:** Open the app → tap one button → instantly get a pick that matches your usual style.  
**Lives in:** `HomeScreen.jsx` → `MyMode` component, `AppShell.jsx` → toggle button, `AppContext.jsx` → `myModePrefs` state

### Chaos Pick
**What it does:** Ignores all filters and picks a completely random suggestion from the entire dataset.  
**User perspective:** "Surprise me." One tap, no filters, wildcard result.  
**Lives in:** `HomeScreen.jsx` → `ChaosButton`, `src/utils/pickEngine.js` → `getChaosPick()`

### Daily Challenge
**What it does:** Shows a rotating daily prompt (14 total, one per day based on day-of-year). Accepting it pre-fills the mood and category and triggers a pick immediately.  
**User perspective:** A card on the home screen with a challenge. Tap "Accept Challenge →" to go straight to a result.  
**Lives in:** `HomeScreen.jsx` → `DailyChallenge`, `src/data/dailyChallenges.js`, `src/utils/pickEngine.js` → `getDailyChallenge()`

### Streak System
**What it does:** Tracks consecutive days the user makes a pick. Increments when a pick is made on a new calendar day, resets if a day is skipped, preserves the longest streak ever.  
**User perspective:** A fire emoji and streak count shown on the home screen and stats screen.  
**Lives in:** `src/utils/statsUtils.js` → `calculateStreak()`, `AppContext.jsx` → `streak` state

### No Excuse Mode
**What it does:** When active, the user cannot immediately shuffle. A 30-second countdown appears before the pick is committed on the home screen. On the result screen, shuffling triggers a 10-second lockout before the shuffle can execute.  
**User perspective:** Toggle "No Excuse" → the app forces you to commit instead of endlessly reshuffling.  
**Lives in:** `HomeScreen.jsx` → `NoExcuseTimer`, `ResultScreen.jsx` → `NoExcuseBar`, `AppContext.jsx` → `noExcuseMode`

### Group Mode (Decide Together)
**What it does:** One person creates a session and gets a 6-character code. Others enter the code and pick their mood secretly. The host triggers a reveal that shows the vote tally and a group pick based on the winning mood.  
**User perspective:** Share code → friends pick moods → reveal the group decision.  
**Lives in:** `src/screens/GroupScreen.jsx`  
**Note:** Session data is stored in localStorage only. This is single-device simulation — not real multi-device sync.

### Share Result Cards
**What it does:** On the result screen, a visual share card is rendered showing the pick name, fun message, mood, streak, and date. The share button uses `navigator.share()` for native share sheets, falling back to clipboard copy.  
**User perspective:** See a card → tap share → send it to WhatsApp/iMessage/any app.  
**Lives in:** `ResultScreen.jsx`, `src/utils/shareUtils.js`

### Stats & Insights
**What it does:** Tracks total picks, mood frequency breakdown, top 3 most-picked suggestions, current + longest streak, and food vs. activity split.  
**User perspective:** A dedicated Stats screen with animated count-up numbers and gradient progress bars.  
**Lives in:** `src/screens/StatsScreen.jsx`, `src/utils/statsUtils.js`

### Pick History
**What it does:** Stores the last 10 picks with name, category, mood, and timestamp. Filterable by food/activity. Expandable rows show budget and time details. Long-press triggers a "Pick this again" action sheet.  
**User perspective:** History tab shows a scrollable list of past picks.  
**Lives in:** `src/screens/HistoryScreen.jsx`

### Push Notifications (OneSignal)
**What it does:** After the user's first pick, a permission prompt slides up from the bottom offering lunch and dinner reminders. If accepted, the browser asks for push permission. Users are tagged in OneSignal for campaign targeting.  
**User perspective:** After first use, a prompt asks if they want daily reminders. Toggle on Stats screen to enable/disable at any time.  
**Lives in:** `src/hooks/useNotifications.js`, `src/components/ui/NotificationPrompt.jsx`, `HomeScreen.jsx`, `StatsScreen.jsx`

### Dark Mode
**What it does:** Toggles a `.dark` class on the `<html>` element. Tailwind v4 dark variants apply to all components. Preference is persisted to localStorage.  
**User perspective:** Moon/sun icon in the top bar.  
**Lives in:** `AppShell.jsx` (toggle button), `AppContext.jsx` (state + effect), `globals.css` (dark variant definition)

### PWA (Installable)
**What it does:** The app is a Progressive Web App with a full web manifest, service worker, and offline caching. Users can "Add to Home Screen" for a native app experience.  
**User perspective:** Browser prompts or manual install via browser menu. Opens full-screen with no browser chrome.  
**Lives in:** `vite.config.js` (VitePWA plugin), `public/icons/`, `index.html`

### Auto-Update Detection
**What it does:** Polls the service worker every 60 seconds for a new version. When a new deploy is detected, an orange gradient banner slides down from the top with an "Update" button that reloads the app.  
**User perspective:** Banner appears automatically after a new version is deployed.  
**Lives in:** `src/hooks/useAppUpdate.js`, `src/components/ui/UpdateBanner.jsx`, `src/App.jsx`

---

## 3. Tech Stack

| Technology | Version | Role |
|---|---|---|
| React | 19.2.6 | UI framework |
| React DOM | 19.2.6 | DOM rendering |
| Vite | 8.0.12 | Build tool + dev server |
| Tailwind CSS | 4.3.0 | Utility-first styling |
| @tailwindcss/vite | 4.3.0 | Tailwind v4 Vite plugin |
| Framer Motion | 12.38.0 | Animation library |
| React Router DOM | 7.15.0 | Client-side routing |
| Firebase | 12.13.0 | Auth (anonymous) + Firestore (stubbed) |
| vite-plugin-pwa | 1.3.0 | Service worker + PWA manifest generation |
| OneSignal Web SDK | v16 (CDN) | Push notifications |
| Netlify | — | Hosting + CI/CD |
| GitHub | — | Version control |
| sharp | 0.34.5 | PWA icon generation script |

**State management:** React `useReducer` via Context API (no external library)  
**Persistence:** `localStorage` for all user data; Firestore stubs exist but are not active  
**Auth:** Firebase Anonymous Auth (auto sign-in on load)  
**Fonts:** Inter (Google Fonts, 400–800 weights)

---

## 4. Project Structure

```
JustPick/
├── public/
│   ├── OneSignalSDKWorker.js      # OneSignal service worker (must be at root)
│   ├── apple-touch-icon.png       # iOS home screen icon
│   ├── favicon.png                # Browser tab favicon
│   ├── favicon.svg                # Vector source favicon
│   ├── icons.svg                  # Master SVG used to generate icon set
│   └── icons/
│       ├── icon-72.png            # PWA icon 72×72
│       ├── icon-96.png            # PWA icon 96×96
│       ├── icon-128.png           # PWA icon 128×128
│       ├── icon-144.png           # PWA icon 144×144
│       ├── icon-152.png           # PWA icon 152×152
│       ├── icon-180.png           # PWA icon 180×180 (iOS)
│       ├── icon-192.png           # PWA icon 192×192 (Android)
│       ├── icon-384.png           # PWA icon 384×384
│       └── icon-512.png           # PWA icon 512×512 (maskable)
├── scripts/
│   └── generateIcons.js           # Node script: generates all icon PNGs from icons.svg via sharp
├── src/
│   ├── App.jsx                    # Root component: routes, update banner, useAppUpdate
│   ├── main.jsx                   # Entry point: StrictMode, BrowserRouter, AppProvider, ErrorBoundary
│   ├── assets/
│   │   └── hero.png               # Static image asset
│   ├── components/
│   │   ├── ErrorBoundary.jsx      # Class component error boundary with reload button
│   │   ├── layout/
│   │   │   └── AppShell.jsx       # Sticky top bar, fixed bottom nav, My Mode toggle, dark mode toggle
│   │   └── ui/
│   │       ├── LoadingSpinner.jsx          # Animated spinner shown during lazy screen loading
│   │       ├── MoodIllustration.jsx        # Five custom SVG illustrations, one per mood
│   │       ├── NotificationPrompt.jsx      # Spring slide-up sheet for OneSignal permission request
│   │       └── UpdateBanner.jsx            # Fixed top banner shown when a new app version is available
│   ├── data/
│   │   ├── dailyChallenges.js     # Array of 14 daily challenge objects
│   │   └── suggestions.js         # Master dataset: ~70 food + activity suggestions
│   ├── firebase/
│   │   ├── config.js              # Firebase app init; exports `db` (Firestore) and `auth`
│   │   └── helpers.js             # Empty async stubs for all Firestore operations
│   ├── hooks/
│   │   ├── useAppUpdate.js        # Wraps useRegisterSW; polls SW every 60s for updates
│   │   ├── useAuth.js             # Signs in anonymously via Firebase Auth on mount
│   │   └── useNotifications.js    # OneSignal wrapper: request/enable/disable, localStorage flags
│   ├── screens/
│   │   ├── GroupScreen.jsx        # Multi-view group decision screen (landing/create/join/vote/reveal)
│   │   ├── HistoryScreen.jsx      # Filterable pick history list with expand + long-press actions
│   │   ├── HomeScreen.jsx         # Main screen: SimpleMode + MyMode + FilterSheet + notification prompt
│   │   ├── OnboardingScreen.jsx   # First-launch swipeable mood card carousel with auto-select timer
│   │   ├── ResultScreen.jsx       # Pick result: accept/shuffle/chaos/share/feedback
│   │   └── StatsScreen.jsx        # Stats overview: count-up hero, streaks, mood bars, top picks, notif toggle
│   ├── store/
│   │   └── AppContext.jsx         # Global state via useReducer; all localStorage persistence effects
│   ├── styles/
│   │   └── globals.css            # Tailwind v4 import, custom theme tokens, dark variant, scrollbar hide
│   └── utils/
│       ├── haptics.js             # navigator.vibrate wrappers for tap and success feedback
│       ├── pickEngine.js          # Core pick algorithm with progressive fallbacks
│       ├── shareUtils.js          # Share text generator and share card data builder
│       └── statsUtils.js         # calculateStreak, updateStats, getTopMood, formatStreakMessage
├── .gitignore
├── README.md
├── eslint.config.js               # ESLint with react-hooks and react-refresh plugins
├── index.html                     # HTML shell with meta tags, OG tags, OneSignal SDK script
├── netlify.toml                   # Build command, publish dir, SPA redirect rule
├── package.json
├── package-lock.json
└── vite.config.js                 # Vite config: React plugin, Tailwind plugin, VitePWA plugin
```

---

## 5. Architecture Overview

### State Flow

```
localStorage → AppContext (useReducer) → screens via useApp()
                    ↓
              actions dispatched
                    ↓
           reducer updates state
                    ↓
         useEffect persists back to localStorage
```

Every piece of persistent state lives in `AppContext`. Screens read state via `useApp()` and write via action creators. There is no prop drilling beyond what is explicitly passed to sub-components within the same file.

### How Picks Are Generated

1. `triggerPick()` in `HomeScreen` calls `getPickResult()` from `pickEngine.js`
2. `getPickResult()` filters the suggestion dataset by category (required), then mood, budget, time
3. History deduplication removes the last 3 picks from the candidate pool
4. If the filtered pool is empty, it falls back progressively (relax to last 1 pick → ignore all filters)
5. A random item is selected from the candidate array
6. The result is stored in `currentResult` (AppContext), history is appended, stats are updated, streak is recalculated
7. Navigation fires to `/result`

### Data Persistence

| Data | Storage | Key |
|---|---|---|
| Dark mode | localStorage | `isDarkMode` |
| First time flag | localStorage | `isFirstTime` |
| Streak | localStorage | `streak` |
| Pick history (last 10) | localStorage | `history` |
| Stats | localStorage | `stats` |
| App mode | localStorage | `appMode` |
| My Mode prefs | localStorage | `myModePrefs` |
| Notification enabled | localStorage | `notificationsEnabled` |
| Notification prompt shown | localStorage | `notificationPromptShown` |
| My Mode tooltip dismissed | localStorage | `myModeTooltipDismissed` |
| Group sessions | localStorage | `session_${CODE}` |
| Per-pick feedback | localStorage | `feedback_${pickId}` |
| Anonymous user ID (group) | localStorage | `anonUid` |

Firestore helper functions exist in `src/firebase/helpers.js` but are all empty stubs. No data is currently written to or read from Firestore in production.

### Firebase Anonymous Auth

`useAuth.js` subscribes to `onAuthStateChanged`. If no user exists, `signInAnonymously()` is called automatically. The resulting Firebase `User` object is stored in `AppContext.currentUser`. The `uid` is passed to Firestore helpers (currently stubs) for future user-scoped data.

### PWA Service Worker

`vite-plugin-pwa` generates a Workbox-powered service worker at build time. Strategy: `generateSW`. All JS, CSS, HTML, PNG, and font files are pre-cached. Navigation fallback routes all URLs to `index.html` (required for client-side routing). The service worker is registered via `virtual:pwa-register/react` in `useAppUpdate.js`.

### OneSignal Notifications

1. `OneSignalSDK.page.js` is loaded via CDN `<script defer>` in `index.html`
2. Initialization runs via `OneSignalDeferred.push()` with the App ID
3. `public/OneSignalSDKWorker.js` loads the OneSignal service worker at `/OneSignalSDKWorker.js`
4. `useNotifications.js` wraps all OneSignal calls via a `getOneSignal()` promise that waits for SDK initialization
5. On permission grant, users are tagged with `lunch_reminder`, `dinner_reminder`, `app_version`, and `platform`

### Two Modes (Simple / My Mode)

`appMode` in AppContext is either `'simple'` or `'mymode'`. `AppShell` renders the toggle button only when `myModePrefs.pickCount >= 3`. `HomeScreen` uses `AnimatePresence` to fade between the two mode components. `MyMode` reads `myModePrefs` (last mood, category, budget, time) and offers a one-tap pick. Every successful pick updates `myModePrefs` via the `UPDATE_MY_MODE_PREFS` reducer action, which also increments `pickCount`.

### Update Banner

`useAppUpdate.js` uses `useRegisterSW` from `virtual:pwa-register/react`. The `onRegistered` callback sets a 60-second interval that calls `r.update()` on the service worker registration. When a new service worker is waiting, `needRefresh` becomes `true`. `App.jsx` renders `<UpdateBanner>` when `needRefresh` is true. Tapping "Update" calls `updateServiceWorker(true)`, which skips waiting and reloads.

---

## 6. Screen Documentation

### OnboardingScreen

**Routes:** `/onboarding`, `/swipe` (via `isSwipeMode` prop)  
**Purpose:** First-time mood selection. Shows a horizontally swipeable carousel of 5 mood cards. Auto-selects the active card after 1.5 seconds if the user doesn't interact.

**Key components rendered:**
- `MoodIllustration` — custom SVG per mood
- Circular progress ring (inline SVG, `requestAnimationFrame`)
- Swipe hint (animated hand + arrows, fades after first swipe)
- Dot pagination indicators

**State read from context:** `setMood`, `setFirstTimeDone`

**State written to context:**
- `selectedMood` — set on card selection
- `isFirstTime` → `false` (on confirm, not on mount — prevents route guard from killing the animation)

**Special behaviors:**
- `useMotionValue` + `animate()` for physics-based card sliding
- Drag threshold: 22% of card width or velocity > 250px/s
- Arrow key navigation via `keydown` event listener
- `mountedRef` prevents state updates after unmount
- Exit animation: card scale-up → white flash overlay expands from center
- `isSwipeMode` prop removes onboarding-specific UI for `/swipe` re-entry

---

### HomeScreen

**Route:** `/`  
**Purpose:** Main decision screen. Hosts both Simple Mode and My Mode.

**Key components rendered (Simple Mode):**
- Greeting (time-based), streak badge
- Mood pill grid (5 moods)
- Category toggle (Food / Activity)
- FilterSheet (bottom sheet, budget + time)
- Pick button (main CTA)
- ChaosButton
- DailyChallenge card
- NoExcuseTimer (inline countdown)
- No Excuse floating toggle button

**Key components rendered (My Mode):**
- Greeting + "Based on your style" label
- Profile card (last mood/category/budget/time with "Change" links)
- One-tap pick button
- ChaosButton
- DailyChallenge card
- Quick mood change row

**State read from context:** `selectedMood`, `selectedCategory`, `selectedBudget`, `selectedTime`, `noExcuseMode`, `streak`, `stats`, `history`, `appMode`, `myModePrefs`, `currentUser`

**State written to context:** `setMood`, `setCategory`, `setBudget`, `setTime`, `setResult`, `addToHistory`, `updateStats`, `updateStreak`, `updateMyModePrefs`

**Firebase operations:** `savePickToFirestore()` called on every pick (currently a no-op stub)

**Special behaviors:**
- Notification prompt shown 1.5s after HomeScreen mounts when `myModePrefs.pickCount === 1` and `notificationPromptShown` is not set
- Mode transition animated via `AnimatePresence mode="wait"` fade
- Toast shown on mode switch
- `finishPick` is a `useCallback` that handles all post-pick state updates + navigation

---

### ResultScreen

**Route:** `/result`  
**Purpose:** Shows the chosen result with accept, shuffle, chaos, share, and feedback actions.

**Key components rendered:**
- Gradient hero card (color varies by food/activity)
- `SparkleEffect` (8-point star burst on pick or shuffle)
- Accept button (turns green on accepting)
- Shuffle button (shake animation on empty; No Excuse lockout bar)
- `NoExcuseBar` (10-second countdown progress bar)
- Chaos pick ghost button
- Share card (visual card + share button)
- Like / Dislike pill buttons
- Toast

**State read from context:** `currentResult`, `selectedMood`, `selectedCategory`, `selectedBudget`, `selectedTime`, `shufflesLeft`, `noExcuseMode`, `streak`, `history`, `currentUser`

**State written to context:** `setResult`, `decrementShuffles`, `resetShuffles`

**Firebase operations:** `saveFeedbackToFirestore()` called on like/dislike (currently a no-op stub)

**Special behaviors:**
- Redirects to home if `currentResult` is null
- Shuffle respects No Excuse Mode (10s lockout timer)
- Per-pick feedback persisted to `localStorage` with key `feedback_${pickId}`
- Share uses `navigator.share()` → clipboard fallback
- Hero gradient: orange for food, blue for activity

---

### StatsScreen

**Route:** `/stats`  
**Purpose:** User statistics overview.

**Key components rendered:**
- Hero card (animated count-up total with overshoot effect)
- Streak card (current streak + personal best)
- Top Mood card
- Mood Breakdown (animated bar chart)
- Top Picks list (gold/silver/bronze rank badges)
- Category Split (food vs activity counts + percentages)
- Notification toggle card
- Reset All stats button + confirmation dialog

**State read from context:** `stats`, `streak`, `history`, `resetAll`

**Special behaviors:**
- `useCountUp()` — custom hook using `requestAnimationFrame`; animates from 0 → target+2 (overshoot) → target
- Bars animate in 300ms after mount via `barsVisible` state
- Gradient bar for the top mood; gray bars for others
- Rank badge colors: gold `#FFD166`, silver `#C0C0C0`, bronze `#CD7F32`
- Notification toggle calls `useNotifications()` enable/disable; shows toast feedback

---

### HistoryScreen

**Route:** `/history`  
**Purpose:** Chronological list of the last 10 picks.

**Key components rendered:**
- Filter pills (All / Food / Activity)
- Pick card list with expand/collapse
- Long-press action sheet ("Pick this again")
- Empty state with CTA

**State read from context:** `history`, `setResult`

**Special behaviors:**
- Expand toggles details (budget, time, fun message) via `AnimatePresence height: auto`
- Long-press: 500ms `setTimeout` on `mousedown`/`touchstart` triggers action sheet
- "Pick this again" reconstructs a full suggestion object from the dataset, falls back to a minimal object if the suggestion no longer exists
- Filter is local state; no context writes

---

### GroupScreen

**Route:** `/group`  
**Purpose:** Multiplayer decision session.

**Views (internal state machine):** `landing` → `create` or `join` → `vote` → `reveal`

**Key sub-components:**
- `LandingView` — start/join buttons + "How it works" accordion
- `CreateView` — session code display (pulsing), WhatsApp share, member simulation, category picker, reveal button
- `JoinView` — 6-character code input with shake-on-error
- `VoteView` — secret mood selection + lock-in
- `RevealView` — animated 5-step reveal: counting → tally bars → winning mood → flash → final result

**State read from context:** `currentUser`

**Firebase operations:** All group Firestore helpers are stubs. Sessions are stored in `localStorage` under `session_${CODE}`.

**Special behaviors:**
- Session code: 6 chars from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no ambiguous chars)
- Simulated members: host can add up to 3 simulated members with random mood votes
- Reveal sequence: 5 timed steps using `setTimeout` chains managed by a `revealStep` state integer
- `uid` falls back to a random `anonUid` stored in localStorage if Firebase auth hasn't resolved
- WhatsApp share via `wa.me/?text=` deep link

---

## 7. Component Documentation

### `AppShell` (`src/components/layout/AppShell.jsx`)

The layout wrapper rendered around every screen except Onboarding.

| Prop | Type | Description |
|---|---|---|
| `children` | ReactNode | Screen content rendered in `<main>` |

**Behavior:**
- Sticky top bar: JustPick logo (gradient text) + My Mode toggle + dark mode button
- My Mode toggle: hidden until `myModePrefs.pickCount >= 3`; shows first-time tooltip once (dismissed via localStorage)
- Fixed bottom nav: Pick / Group / Stats tabs; active state = orange + indicator dot
- Bottom nav uses `position: fixed` + `env(safe-area-inset-bottom, 20px)` for iOS home indicator clearance
- Main content has `paddingBottom: calc(5rem + env(safe-area-inset-bottom, 20px))` to avoid nav overlap
- Scrolls to top on route change via `useEffect` on `location.pathname`

**Used in:** `App.jsx` — wraps HomeScreen, ResultScreen, StatsScreen, GroupScreen, HistoryScreen

---

### `ErrorBoundary` (`src/components/ErrorBoundary.jsx`)

React class component that catches render errors and displays a crash screen with a reload button.

| Prop | Type | Description |
|---|---|---|
| `children` | ReactNode | The component tree to guard |

**Used in:** `main.jsx` — wraps the entire app

---

### `LoadingSpinner` (`src/components/ui/LoadingSpinner.jsx`)

Rotating orange spinner with "JustPick" label. Shown as the Suspense fallback during lazy screen loading.

No props.

**Used in:** `App.jsx` → `<Suspense fallback={<LoadingSpinner />}>`

---

### `MoodIllustration` (`src/components/ui/MoodIllustration.jsx`)

Renders one of five custom SVG illustrations based on mood ID.

| Prop | Type | Description |
|---|---|---|
| `mood` | `{ id: string, emoji: string }` | Mood object with `id` and `emoji` |

**Mood → Illustration mapping:**
- `lazy` → sofa with blanket, TV remote, floating Z's
- `broke` → empty wallet with flying coin
- `adventurous` → rocket with stars and flame
- `productive` → laptop with checkmark, coffee, plant
- `hungry` → bowl of noodles with fork and spoon

Each SVG is 200×200, white-tinted, displayed in a 48×48 rounded container. Emoji badge pinned to bottom-right corner.

**Used in:** `OnboardingScreen.jsx`

---

### `NotificationPrompt` (`src/components/ui/NotificationPrompt.jsx`)

Spring slide-up bottom sheet for OneSignal push permission request.

| Prop | Type | Description |
|---|---|---|
| `onAccept` | `async () => void` | Called when user taps "Yes, remind me" |
| `onDismiss` | `() => void` | Called when user taps "No thanks" or backdrop |

**Animation:** `initial: { y: 300, opacity: 0 }` → `animate: { y: 0, opacity: 1 }`, spring damping 25, stiffness 300.  
**Bell animation:** `rotate: [0, -15, 15, -15, 15, 0]` repeated twice over 1 second.  
**Layout:** Fixed bottom-0, max-width 430px, centered. Dark overlay backdrop (z-40), sheet at z-50.  
Includes `paddingBottom: env(safe-area-inset-bottom)` for notched devices.

**Used in:** `HomeScreen.jsx`

---

### `UpdateBanner` (`src/components/ui/UpdateBanner.jsx`)

Fixed top banner that slides down when a new app version is detected.

| Prop | Type | Description |
|---|---|---|
| `onUpdate` | `() => void` | Called when user taps the "Update" button |

**Animation:** `initial: { y: -80, opacity: 0 }` → `animate: { y: 0, opacity: 1 }`, spring damping 20.  
**Layout:** Fixed top-0, max-width 430px, z-index 100. Orange gradient, shadow, rounded bottom corners.  
Respects `env(safe-area-inset-top)` for notched devices.

**Used in:** `App.jsx`

---

## 8. Custom Hooks

### `useAuth` (`src/hooks/useAuth.js`)

Manages Firebase anonymous authentication.

**What it does:** Subscribes to `onAuthStateChanged`. If no user is signed in, calls `signInAnonymously()`. Sets the resulting user in `AppContext` via `setUser()`.

**Returns:** Nothing (side-effect only hook).

**Used in:** `App.jsx` → inside `AppRoutes` component

---

### `useNotifications` (`src/hooks/useNotifications.js`)

OneSignal push notification management.

**What it returns:**

| Key | Type | Description |
|---|---|---|
| `isSupported` | `() => boolean` | Checks if OneSignal is available in window |
| `requestPermission` | `async () => boolean` | Requests browser permission, tags user in OneSignal, sets localStorage |
| `isEnabled` | `() => boolean` | Reads `notificationsEnabled` from localStorage |
| `enable` | `async () => boolean` | Alias for `requestPermission` |
| `disable` | `async () => void` | Opts out of OneSignal push subscription, updates localStorage |
| `hasPromptBeenShown` | `() => boolean` | Reads `notificationPromptShown` from localStorage |
| `markPromptShown` | `() => void` | Sets `notificationPromptShown` in localStorage |

**Internal `getOneSignal()`:** Returns a Promise that resolves to the OneSignal instance. If `window.OneSignal` already exists, resolves immediately. Otherwise pushes a callback to `OneSignalDeferred`.

**Tags set on permission grant:** `lunch_reminder: 'true'`, `dinner_reminder: 'true'`, `app_version: '1.0'`, `platform: 'pwa'`

**Used in:** `HomeScreen.jsx`, `StatsScreen.jsx`

---

### `useAppUpdate` (`src/hooks/useAppUpdate.js`)

PWA version update detection.

**What it returns:**

| Key | Type | Description |
|---|---|---|
| `needRefresh` | `boolean` | `true` when a new service worker is waiting |
| `updateNow` | `() => void` | Calls `updateServiceWorker(true)` to skip waiting and reload |

**Internal behavior:** Uses `useRegisterSW` from `virtual:pwa-register/react`. The `onRegistered` callback sets a 60-second interval calling `r.update()` to check for new versions.

**Used in:** `App.jsx`

---

## 9. Utility Functions

### `src/utils/pickEngine.js`

#### `getPickResult({ mood, category, budget, time, history })`

| Parameter | Type | Description |
|---|---|---|
| `mood` | `string \| null` | Mood ID to filter by |
| `category` | `string` | `'food'` or `'activity'` (required) |
| `budget` | `string \| null` | `'free'`, `'low'`, or `'medium'` |
| `time` | `string \| null` | `'quick'` or `'chill'` |
| `history` | `Array` | Last N pick records for deduplication |

**Returns:** A suggestion object or `null` if no match.

**Example:**
```js
const pick = getPickResult({ mood: 'lazy', category: 'food', budget: 'low', time: null, history: [] });
// → { id: 2, name: 'Waakye', category: 'food', ... }
```

---

#### `getQuickPick(category)`

| Parameter | Type | Description |
|---|---|---|
| `category` | `string` | `'food'` or `'activity'` |

**Returns:** A random suggestion from the given category, ignoring all other filters. Returns `null` if the category has no suggestions.

---

#### `getChaosPick()`

No parameters.

**Returns:** A completely random suggestion from the entire dataset (ignores category, mood, budget, time).

---

#### `getDailyChallenge()`

No parameters.

**Returns:** A daily challenge object selected by `dayOfYear % dailyChallenges.length`. Rotates through all 14 challenges across the year.

**Example:**
```js
const challenge = getDailyChallenge();
// → { id: 1, mood: 'hungry', category: 'food', label: 'Eat like a local today 🍛', description: '...' }
```

---

#### `validateShuffleAllowed(shufflesLeft, noExcuseMode, noExcuseTimer)`

| Parameter | Type | Description |
|---|---|---|
| `shufflesLeft` | `number` | Remaining shuffles (0–3) |
| `noExcuseMode` | `boolean` | Whether No Excuse Mode is active |
| `noExcuseTimer` | `number` | Seconds remaining on the No Excuse timer |

**Returns:** `{ allowed: boolean, reason: string | null }` — reason is `'no_shuffles'` or `'no_excuse'`.

---

### `src/utils/statsUtils.js`

#### `calculateStreak(streak, lastPickDate)`

| Parameter | Type | Description |
|---|---|---|
| `streak` | `{ current, longest, lastPickDate }` | Current streak object |
| `lastPickDate` | `string \| null` | ISO date string `YYYY-MM-DD` of last pick |

**Returns:** New streak object. Logic:
- No prior date → streak starts at 1
- Same day as today → no change
- Yesterday → increment current, update longest
- Gap > 1 day → reset current to 1, preserve longest

---

#### `updateStats(stats, pick, mood)`

| Parameter | Type | Description |
|---|---|---|
| `stats` | `{ totalPicks, moodFrequency, topSuggestions }` | Current stats object |
| `pick` | Suggestion object | The pick that was just made |
| `mood` | `string \| null` | Selected mood ID |

**Returns:** New stats object with incremented `totalPicks`, updated `moodFrequency`, and updated `topSuggestions` array (sorted by count, capped at 10).

---

#### `getTopMood(moodFrequency)`

| Parameter | Type | Description |
|---|---|---|
| `moodFrequency` | `{ [moodId]: number }` | Mood frequency map |

**Returns:** The mood string with the highest count, or `null` if empty.

---

#### `formatStreakMessage(streak)`

| Parameter | Type | Description |
|---|---|---|
| `streak` | `{ current: number }` | Streak object |

**Returns:** A fun human-readable string based on streak count:
- 0 → `'Make your first pick to start a streak 🎯'`
- 1 → `'Day 1 of not overthinking 🎯'`
- 2 → `"Day 2 — you're on a roll 🔥"`
- 3–6 → `'Day N streak! Keep going 💪'`
- 7 → `"One week in. You're committed 🏆"`
- 14 → `"Two weeks! JustPick is part of you now 😄"`
- 15+ → `'Day N — you don't make decisions anymore. JustPick does. 👑'`

---

### `src/utils/shareUtils.js`

#### `generateShareText(pick, mood)`

| Parameter | Type | Description |
|---|---|---|
| `pick` | Suggestion object | The pick to share |
| `mood` | `string \| null` | Selected mood |

**Returns:** A multi-line string for native share or clipboard. Includes pick name, mood, and app URL.

---

#### `generateShareCardData(pick, mood, streak)`

| Parameter | Type | Description |
|---|---|---|
| `pick` | Suggestion object | The pick to display |
| `mood` | `string \| null` | Selected mood |
| `streak` | Streak object | Current streak |

**Returns:** `{ title, message, mood, streak, date, appName, appUrl }` — data object consumed by the share card UI in `ResultScreen`.

---

### `src/utils/haptics.js`

#### `hapticTap()`
Calls `navigator.vibrate(10)` — a 10ms pulse for button taps. No-op if Vibration API is not supported.

#### `hapticSuccess()`
Calls `navigator.vibrate([10, 30, 10])` — double pulse for successful picks. No-op if not supported.

---

## 10. Data Layer

### Suggestion Data Structure

```js
{
  id: 1,                              // Unique integer ID (food: 1–36, activity: 37+)
  category: 'food',                   // 'food' | 'activity'
  name: 'Jollof Rice',               // Display name shown on result card
  mood_tags: ['hungry', 'adventurous'], // Array of mood IDs this suggestion matches
  budget_level: 'medium',             // 'free' | 'low' | 'medium'
  time_required: 'chill',             // 'quick' | 'chill'
  fun_message: 'The GOAT of West African food. No debate needed 👑', // Shown under the name
}
```

**Dataset size:** ~70 suggestions total (36 food, ~34 activity).

**Mood IDs:** `'hungry'`, `'lazy'`, `'adventurous'`, `'broke'`, `'productive'`  
**Budget levels:** `'free'` (no cost), `'low'` (budget-friendly), `'medium'` (normal spend)  
**Time values:** `'quick'` (under 30 minutes), `'chill'` (relaxed, 1h+)

---

### Daily Challenge Structure

```js
{
  id: 1,                                // Integer ID
  mood: 'hungry',                       // Mood ID set when challenge is accepted
  category: 'food',                     // Category used for the resulting pick
  label: 'Eat like a local today 🍛',   // Title shown on the challenge card
  description: 'Try something from your culture or community', // Subtitle
}
```

**Total challenges:** 14. Selected by `dayOfYear % 14`.

---

### Context State

| Field | Type | Default | Persisted | Controls |
|---|---|---|---|---|
| `currentUser` | Firebase User \| null | null | No | Identity for Firestore writes |
| `selectedMood` | string \| null | null | No | Active mood filter |
| `selectedCategory` | string \| null | null | No | Active category filter |
| `selectedBudget` | string \| null | null | No | Active budget filter |
| `selectedTime` | string \| null | null | No | Active time filter |
| `currentResult` | Suggestion \| null | null | No | Result shown on ResultScreen |
| `shufflesLeft` | number | 3 | No | Shuffle count on ResultScreen |
| `noExcuseMode` | boolean | false | No | Forces commitment on picks |
| `streak` | `{ current, longest, lastPickDate }` | `{ 0, 0, null }` | `streak` | Streak display on home + stats |
| `history` | Array (max 10) | `[]` | `history` | Pick history list + deduplication |
| `stats` | `{ totalPicks, moodFrequency, topSuggestions }` | zeros | `stats` | Stats screen data |
| `isDarkMode` | boolean | system preference | `isDarkMode` | Dark/light theme |
| `isFirstTime` | boolean | true | `isFirstTime` | Onboarding redirect |
| `appMode` | `'simple' \| 'mymode'` | `'simple'` | `appMode` | Home screen layout |
| `myModePrefs` | `{ lastMood, lastCategory, lastBudget, lastTime, pickCount }` | nulls + 0 | `myModePrefs` | My Mode one-tap defaults |

---

### localStorage Keys

| Key | Shape | Written by | Read by |
|---|---|---|---|
| `isDarkMode` | `boolean` (JSON) | AppContext effect | AppContext init |
| `isFirstTime` | `boolean` (JSON) | AppContext effect | AppContext init |
| `streak` | `{ current, longest, lastPickDate }` | AppContext effect | AppContext init |
| `history` | `Array<PickRecord>` | AppContext effect | AppContext init |
| `stats` | `{ totalPicks, moodFrequency, topSuggestions }` | AppContext effect | AppContext init |
| `appMode` | `'simple' \| 'mymode'` | AppContext effect | AppContext init |
| `myModePrefs` | `{ lastMood, lastCategory, lastBudget, lastTime, pickCount }` | AppContext effect | AppContext init, AppShell |
| `notificationsEnabled` | `'true' \| 'false'` | useNotifications | useNotifications |
| `notificationPromptShown` | `'true'` | useNotifications | useNotifications, HomeScreen |
| `myModeTooltipDismissed` | `'1'` | AppShell | AppShell |
| `anonUid` | `string` | GroupScreen | GroupScreen |
| `session_${CODE}` | Session object | GroupScreen | GroupScreen |
| `feedback_${pickId}` | `'like' \| 'dislike'` | ResultScreen | ResultScreen |

---

### Firestore Collections

All Firestore operations are currently stubbed (empty async functions). The infrastructure exists but no data flows to Firestore in production.

| Collection (planned) | Document shape | When written | When read |
|---|---|---|---|
| `picks` | `{ pickId, name, category, mood, budget, time, timestamp, uid }` | After every pick | Never (stats are local) |
| `feedback` | `{ pickId, feedback: 'like'\|'dislike', timestamp, uid }` | On like/dislike | Never |
| `sessions` | `{ code, hostUid, category, votes, memberCount, status, result, createdAt }` | On group create/update | On group join |
| `streaks` | `{ current, longest, lastPickDate, uid }` | On streak update | Never |

---

## 11. Pick Engine Logic

### `getPickResult()` — Step by Step

**Input:**
```js
{
  mood: 'lazy',        // string | null
  category: 'food',   // 'food' | 'activity' (required)
  budget: 'low',      // string | null
  time: 'quick',      // string | null
  history: [...]      // Array of { id, name, ... } (last N picks)
}
```

**Filtering steps:**

1. **Category filter (required):**  
   `pool = suggestions.filter(s => s.category === category)`  
   This is always applied. If category is not provided by the caller, it defaults to `'food'` at the call site.

2. **Mood filter (optional):**  
   If `mood` is set: `pool = pool.filter(s => s.mood_tags.includes(mood))`

3. **Budget filter (optional):**  
   If `budget` is set: `pool = pool.filter(s => s.budget_level === budget)`

4. **Time filter (optional):**  
   If `time` is set: `pool = pool.filter(s => s.time_required === time)`

5. **History deduplication:**  
   Extract `recentIds = history.slice(0, 3).map(h => h.id)`  
   `candidates = pool.filter(s => !recentIds.includes(s.id))`

6. **Fallback A — Relax to last 1 pick:**  
   If `candidates.length === 0`:  
   `lastId = history.slice(0, 1).map(h => h.id)`  
   `candidates = pool.filter(s => !lastId.includes(s.id))`

7. **Fallback B — Category-only:**  
   If still empty: `candidates = suggestions.filter(s => s.category === category)`  
   (All mood/budget/time filters dropped)

8. **Final guard:**  
   If `candidates.length === 0`: return `null`

9. **Random selection:**  
   `return candidates[Math.floor(Math.random() * candidates.length)]`

**Output:** A single suggestion object or `null`.

---

### `getQuickPick(category)`
Filters `suggestions` by category only. Returns a random item. No history deduplication. Used for instant picks without any user filters.

### `getChaosPick()`
`suggestions[Math.floor(Math.random() * suggestions.length)]` — pure random, no filters.

### `getDailyChallenge()`
```js
const dayOfYear = Math.floor((now - startOfYear) / 86400000);
return dailyChallenges[dayOfYear % dailyChallenges.length];
```
Returns a deterministic challenge per calendar day. All users see the same challenge on the same day.

### `validateShuffleAllowed(shufflesLeft, noExcuseMode, noExcuseTimer)`
Returns `{ allowed: false, reason: 'no_shuffles' }` if shuffles are exhausted.  
Returns `{ allowed: false, reason: 'no_excuse' }` if No Excuse Mode is active and timer is running.  
Returns `{ allowed: true, reason: null }` otherwise.

---

## 12. Environment & Configuration

### Firebase Configuration

Firebase is initialized in `src/firebase/config.js`. The following keys are required:

```
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
```

These values are currently hardcoded in the config file (acceptable for a client-side PWA with Firestore security rules). For production with sensitive logic, move to environment variables using `import.meta.env.VITE_*`.

The config exports `db` (Firestore instance) and `auth` (Firebase Auth instance).

---

### OneSignal Configuration

**App ID:** `62a64f22-1256-4e1d-8ab5-e11bf0708f81`

**SDK:** Loaded via CDN in `index.html`:
```html
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
```

**Init script:** Also in `index.html`, initializes via `OneSignalDeferred.push()`.

**Service worker:** `public/OneSignalSDKWorker.js` must be served from the root of the domain. Content:
```js
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
```

**`notifyButton: false`** — disables the OneSignal default bell widget. The app uses its own `NotificationPrompt` component.  
**`allowLocalhostAsSecureOrigin: true`** — enables testing on `localhost` without HTTPS.

---

### Vite Configuration

```js
// vite.config.js
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.png', 'apple-touch-icon.png', 'icons/*.png'],
  manifest: {
    name: 'JustPick',
    short_name: 'JustPick',
    display: 'standalone',
    start_url: '/',
    background_color: '#FFF9F0',
    theme_color: '#FF8C42',
    // icons: 8 sizes from 72px to 512px
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    navigateFallback: 'index.html',
  }
})
```

`navigateFallback: 'index.html'` is critical — it ensures the service worker returns `index.html` for all navigation requests, enabling client-side routing to work offline and when refreshing deep routes.

---

### Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

The redirect rule is the SPA catch-all. All routes serve `index.html` with a 200 (not 301/302) so React Router handles the routing client-side. Without this, refreshing `/result` would return a 404.

---

## 13. PWA Details

### Manifest

| Field | Value |
|---|---|
| `name` | JustPick |
| `short_name` | JustPick |
| `description` | Stop thinking. Just pick. |
| `display` | `standalone` |
| `start_url` | `/` |
| `background_color` | `#FFF9F0` |
| `theme_color` | `#FF8C42` |

### Icon Sizes

| Size | File | Purpose |
|---|---|---|
| 72×72 | `icon-72.png` | Legacy Android |
| 96×96 | `icon-96.png` | Chrome |
| 128×128 | `icon-128.png` | Chrome Web Store |
| 144×144 | `icon-144.png` | Windows tile |
| 152×152 | `icon-152.png` | iOS Safari |
| 180×180 | `icon-180.png` | iOS Safari (Retina) |
| 192×192 | `icon-192.png` | Android home screen |
| 384×384 | `icon-384.png` | High-res Android |
| 512×512 | `icon-512.png` | Splash screen + maskable |

Generated via `npm run icons` using `scripts/generateIcons.js` with the `sharp` library from `public/icons.svg`.

### Service Worker Strategy

`generateSW` mode via Workbox. Pre-caches all JS, CSS, HTML, PNG, SVG, WOFF2 files at build time. Any uncached navigation request falls back to `index.html` for SPA routing.

### Offline Behavior

All app assets are pre-cached. The app loads and runs fully offline after first visit. The suggestion dataset is bundled in JS so picks work without network. Firebase and OneSignal calls may fail silently offline (both are fire-and-forget).

### Install Behavior

Standard PWA install: browser shows install prompt or user installs via browser menu. On iOS, user must use "Add to Home Screen" from Safari share menu. Once installed, opens in `standalone` mode (no browser chrome).

### Update Detection

Every 60 seconds, `r.update()` is called on the service worker registration. When Workbox detects a new version, `needRefresh` becomes `true`. The orange `UpdateBanner` slides down. Tapping "Update" calls `skipWaiting` and reloads the page.

---

## 14. Push Notifications

### OneSignal Setup Steps

1. Create a OneSignal account at onesignal.com
2. Create a Web Push app
3. Set the site URL to `https://justpick-app.netlify.app`
4. Copy the App ID (`62a64f22-1256-4e1d-8ab5-e11bf0708f81`)
5. Place `OneSignalSDKWorker.js` at the root of `public/`
6. Add the SDK script to `index.html`

### How Permission Is Requested

1. User makes their first pick
2. After returning to HomeScreen, `myModePrefs.pickCount === 1` triggers a `useEffect`
3. 1.5 seconds later, `NotificationPrompt` slides up
4. User taps "Yes, remind me" → `requestPermission()` is called
5. Browser native permission dialog appears
6. On grant: localStorage flag set, OneSignal tags added

The prompt is shown at most once. `notificationPromptShown` in localStorage prevents repeat displays regardless of whether the user accepted or dismissed.

### What Tags Are Set

On successful permission grant via `OneSignal.User.addTags()`:
```js
{
  lunch_reminder: 'true',
  dinner_reminder: 'true',
  app_version: '1.0',
  platform: 'pwa'
}
```

These tags enable targeted campaign filtering in the OneSignal dashboard.

### How to Send Campaigns from Dashboard

1. Go to **Messages → New Push**
2. Select target: "Users with tag `lunch_reminder = true`"
3. Set message content (title + body)
4. Set the click URL to `https://justpick-app.netlify.app`
5. Schedule or send immediately

**Recommended templates:**

*Lunch Reminder*
- Title: `Lunch time! 🍔`
- Body: `What are we eating? Let JustPick decide 🎲`

*Dinner Reminder*
- Title: `Evening plans? 🌆`
- Body: `Let JustPick decide what's next 🎯`

### Free vs Paid Tier

| Feature | Free | Growth (paid) |
|---|---|---|
| Manual push campaigns | ✅ | ✅ |
| User tagging | ✅ | ✅ |
| Subscriber dashboard | ✅ | ✅ |
| Automated Journeys (scheduled sends) | ❌ | ✅ |
| Daily at 12:00 PM user local time | ❌ | ✅ |

For the free tier, send lunch and dinner reminders manually from the dashboard as needed.

---

## 15. Deployment

### Run Locally

```bash
# Clone the repo
git clone https://github.com/kaabatapersonal-hub/justpick
cd justpick

# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5173
```

The dev server supports hot reload. OneSignal won't fully function on localhost unless the browser has been granted permission previously, but `allowLocalhostAsSecureOrigin: true` allows testing the SDK.

### Build for Production

```bash
npm run build
# Output in dist/
# dist/sw.js — generated service worker
# dist/manifest.webmanifest — PWA manifest
# dist/OneSignalSDKWorker.js — copied from public/
```

Preview the production build locally:
```bash
npm run preview
# → http://localhost:4173
```

### How Netlify Auto-Deploys

1. Push to `main` branch on GitHub
2. Netlify webhook triggers automatically (connected via GitHub OAuth)
3. Netlify runs `npm run build`
4. `dist/` is published as the live site
5. Deploys typically complete in 60–90 seconds

### Check Deployment Status

- Go to https://app.netlify.com → your site → **Deploys**
- Each deploy shows build log, status, and deploy preview URL
- Production deploy is the most recent successful build on `main`

### Roll Back

In Netlify dashboard:
1. Go to **Deploys**
2. Click any previous successful deploy
3. Click **Publish deploy**

This instantly rolls back without re-running a build.

---

## 16. Known Limitations

| Limitation | Detail |
|---|---|
| Group mode is single-device only | Sessions are stored in localStorage. Friends on other devices cannot join unless they are on the same device. A Firestore real-time listener implementation is needed for true multi-device group play. |
| iOS push notifications require PWA install | Safari on iOS only supports push notifications when the app is installed to the home screen (iOS 16.4+). Browser-tab notifications are not supported on iOS Safari. |
| Automated notification scheduling requires OneSignal paid plan | Daily lunch/dinner sends via Journeys require the Growth plan. On the free tier, campaigns must be sent manually from the dashboard. |
| History limited to 10 picks | `AppContext` slices history to the last 10 entries. Older picks are lost. |
| Firestore is stubbed | All Firestore helper functions are empty. No data flows to the cloud. Stats and history are entirely local. |
| Pick deduplication is shallow | Only the last 3 picks (or 1 in fallback) are excluded. With a small filtered pool, users may still see repeated suggestions. |
| No user accounts | Anonymous auth only. Clearing browser data or switching devices loses all history, stats, and streaks. |
| Suggestion dataset is static | Picks come from a hard-coded JS array. Adding new suggestions requires a code deploy. |

---

## 17. Future Roadmap

| Feature | Description |
|---|---|
| Premium tier / My Mode advanced | Lock My Mode behind a paywall. Add custom mood creation, expanded filter options, and a "surprise mode" that learns from feedback. |
| Hyper-local suggestions | Use geolocation to surface nearby restaurants and activities. Requires a location API integration (Google Places or similar). |
| WhatsApp bot | A WhatsApp Business API bot that accepts "pick food" and responds with a suggestion. No app install required. |
| Real-time group mode | Replace localStorage sessions with Firestore real-time listeners. True multi-device sync for group voting. |
| Custom mood creation | Let users define their own mood labels and emoji. Store custom moods in a user profile (requires proper auth). |
| Feedback-driven personalization | Use like/dislike feedback stored in Firestore to weight the pick algorithm toward preferred suggestions. |
| Onboarding re-entry | Let returning users re-do the mood swipe carousel to reset their initial mood preference. |
| Weekly stats recap | Push notification every Sunday: "This week you made N picks. Your top mood was X." |

---

## 18. Version History

| Commit | Description |
|---|---|
| `b5adfc4` | feat: OneSignal push notifications + PWA update banner |
| `37fcd8c` | polish: final visual polish across all screens |
| `587b2c9` | feat: simple mode + my mode, bottom sheet filters |
| `e13fb0f` | fix: nav redesign, remove auto-pick, fix PWA safe area |
| `f70edb8` | fix: dark mode, PWA safe-area nav, zero-stats copy, UI upgrade |
| `160b3b7` | polish: PWA icons, lazy loading, haptics, desktop frame, meta tags |
| `1a107a2` | build: group mode screen |
| `c50c58b` | build: stats screen and history screen |
| `984fb29` | build: complete result screen with share card |
| `3770d10` | fix: stop quick-pick auto-firing on every home screen mount |
| `d513c73` | fix: resolve app crash on home screen load |
| `fa53993` | build: complete home screen |
| `f54af90` | session 3: suggestion dataset, pick engine, stats and share utils |
| `58c3dc6` | fix onboarding: stable cards, mood illustrations, swipe hints |
| `0fe9c24` | add firebase config, onboarding screen, and netlify deploy config |
| `ecc6d60` | merge remote init, keep local project files |
| `2dad30b` | initial commit |
| `91f4359` | Initial commit |
