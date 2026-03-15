# Sonic Blueprint / Track DNA

## Product position

This should not feel like a normal chatbot page with a waveform attached.

It should feel like **music intelligence made visible**.

The product metaphor is closer to:
- **AI score**
- **sonic blueprint**
- **music observatory**
- **track genome**

The core idea:

> The AI does not just talk about the music — it reveals how the music works.

---

## Core UX direction

Do **not** make the chatbot the main thing.

Make the **track itself the interface**.

Hierarchy:
1. **Track canvas first**
2. **Musical features as visual objects**
3. **AI as an interpretive layer living inside the track**
4. **Command dock as the input surface**

Instead of:
- chat
- waveform
- sidebar

Build:
- immersive track canvas
- semantic music overlays
- inline AI annotations
- striking extension preview

---

## Design system

### Color tokens

All colors are defined as semantic CSS custom properties. Do not use raw hex in components.

```css
:root {
  /* Surfaces */
  --bg-deep: #0F0F23;
  --bg-base: #1B1B30;
  --bg-elevated: #27273B;
  --surface: rgba(255, 255, 255, 0.05);

  /* Text */
  --foreground: #F8FAFC;
  --foreground-muted: #94A3B8;

  /* Primary & accent */
  --primary: #1E1B4B;
  --primary-hover: #312E81;
  --secondary: #4338CA;
  --accent: #22C55E;
  --accent-glow: rgba(34, 197, 94, 0.2);

  /* Borders */
  --border: rgba(255, 255, 255, 0.08);
  --border-active: #312E81;

  /* Feedback */
  --destructive: #EF4444;
  --warning: #F97316;
  --success: #22C55E;

  /* Ring / focus */
  --ring: #4338CA;
  --ring-offset: #0F0F23;

  /* Musical feature colors — all verified ≥4.5:1 against --bg-deep */
  --color-tempo: #F59E0B;       /* amber — tempo pulses */
  --color-harmony: #8B5CF6;     /* violet — key/harmonic field */
  --color-structure: #CBD5E1;   /* silver — time signature/bars */
  --color-melody: #06B6D4;      /* cyan — note traces */
  --color-bass: #DC2626;        /* red — low ribbon */
  --color-percussion: #FBBF24;  /* bright gold — sharp ticks */
  --color-vocals: #EC4899;      /* pink — vocal ribbon */
  --color-extension: rgba(139, 92, 246, 0.4); /* translucent violet — ghost region */
  --color-ai-node: rgba(255, 255, 255, 0.12); /* glass node background */
  --color-ai-node-border: rgba(139, 92, 246, 0.3); /* accent glow border */
}
```

**Contrast verification checklist:**
- `--foreground` on `--bg-deep`: #F8FAFC on #0F0F23 → 15.8:1 (AAA)
- `--foreground-muted` on `--bg-deep`: #94A3B8 on #0F0F23 → 6.2:1 (AA)
- `--color-tempo` on `--bg-deep`: #F59E0B on #0F0F23 → 7.1:1 (AA)
- `--color-harmony` on `--bg-deep`: #8B5CF6 on #0F0F23 → 4.8:1 (AA)
- `--color-melody` on `--bg-deep`: #06B6D4 on #0F0F23 → 7.9:1 (AA)
- Each feature color is paired with a secondary indicator (icon or pattern) so color is never the only differentiator

### Typography

Font system: **Inter** (single-family precision system).

```css
/* Import */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Scale */
--font-family: 'Inter', system-ui, -apple-system, sans-serif;
--font-display-size: 48px;    /* page title */
--font-display-weight: 700;
--font-display-tracking: -1.5px;
--font-h1-size: 32px;         /* section headers */
--font-h1-weight: 600;
--font-h1-tracking: -0.5px;
--font-h2-size: 24px;         /* sub-headers */
--font-h2-weight: 600;
--font-body-size: 16px;       /* body text, AI insights */
--font-body-weight: 400;
--font-body-line-height: 1.6;
--font-label-size: 12px;      /* labels, metadata */
--font-label-weight: 500;
--font-label-tracking: 0.5px;
--font-label-transform: uppercase;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace; /* BPM, key, time sig values */
```

Heading hierarchy: h1 → h2 → h3, no level skips. Body text minimum 16px on all breakpoints. Line length constrained to 60–75 characters on desktop.

### Spacing system

Use a 4px base / 8px rhythm:

```
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

All padding, margins, and gaps reference these tokens.

### Border radius

```
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-full: 9999px;
```

### Z-index scale

Three-layer architecture requires strict z-index management:

```
--z-canvas: 0;           /* track canvas base */
--z-canvas-lanes: 10;    /* waveform, note lanes */
--z-canvas-playhead: 20; /* playhead line */
--z-ai-layer: 30;        /* insight nodes, annotations */
--z-hover-card: 40;      /* explanation cards on hover */
--z-context-rail: 50;    /* right panel overlay on mobile */
--z-command-dock: 60;    /* bottom input bar */
--z-modal: 100;          /* modals, dialogs */
--z-toast: 110;          /* toast notifications */
```

### Icon system

Use **Lucide** icons (stroke width 1.5px, consistent 24px sizing). No emojis as structural icons. All interactive icons include `aria-label` and meet 44x44px minimum touch target via padding/hitSlop.

---

## Main modes

### 1. Analyst Mode
The consultant side.

Purpose:
- upload a short clip
- extract tempo, key, time signature
- show how the track works
- explain stems / structure / mood / energy
- prepare a structured extension prompt

This mode should feel like a live scan or diagnosis of the track.

### 2. Performance / DJ Mode
The immersive creative side.

Purpose:
- manipulate the generated or analyzed audio live
- map gestures to stems or controls
- visualize music as reactive objects
- make the user feel like they are performing on the track

This mode should feel like a stage interface, not a dashboard.

**Accessibility requirement:** Every gesture-mapped control must have a visible on-screen button fallback. Gesture input is an enhancement, not the only path. Keyboard shortcuts must map to the same controls (e.g., `1-4` for stem focus, `Space` for play/pause, `M` for mute).

---

## Primary flow

1. User uploads a short audio file
2. System extracts:
   - tempo
   - key
   - time signature
   - sections
   - stem presence / dominant layers
   - mood / energy
3. These features are transformed into a structured prompt
4. A separate API extends the original audio
5. The extension appears visually as a projected future region
6. The user explores, refines, or performs on the result

### Error & edge case flows

| State | Behavior |
|-------|----------|
| Upload fails | Toast with `--destructive` color, retry button, `aria-live="polite"` announcement |
| Unsupported format | Inline error below upload area listing accepted formats (.mp3, .wav, .flac, .ogg) |
| Analysis times out (>30s) | Progress bar with cancel option, fallback to partial results with "incomplete" badge |
| Extension API fails | Ghost region shows "Generation failed" with retry action, existing analysis preserved |
| Empty state (no upload) | Full-screen upload prompt with drag-and-drop zone (min 200x200px), accepted formats listed |
| Clip too short (<3s) | Warning toast: "Clip is too short for reliable analysis. Minimum 3 seconds recommended." |
| Clip too long (>60s) | Upload rejected with explanation and trim suggestion |

---

## Hero moment

The strongest sequence in the product should be:

1. Upload track
2. Track appears in a cinematic canvas
3. A scan line passes through the audio
4. Musical features lock in one by one
   - tempo pulses appear
   - key blooms into color
   - measures snap into grouping
   - stems illuminate
5. The system projects a **ghost continuation** of the track to the right
6. The user sees the future extension before hearing it

This is the productized "wow" moment.

### Animation constraints for hero sequence

- Total sequence duration: **2.5–4 seconds** (no longer)
- Each feature lock-in: **300ms** with `ease-out` easing
- Stagger between feature reveals: **400ms**
- Scan line motion: `transform: translateX()` only (GPU-composited)
- Ghost region materialization: **600ms** fade + scale from `opacity: 0; scale: 0.98` to `opacity: 1; scale: 1`
- `prefers-reduced-motion: reduce` → skip scan line animation, show all features simultaneously with a single 300ms fade-in
- All animations use `will-change: transform, opacity` and avoid animating `width`, `height`, `top`, `left`

---

## Layout direction

### Responsive layout strategy

**Mobile-first.** Design for 375px, scale up.

| Breakpoint | Layout |
|-----------|--------|
| **375px** (mobile) | Full-width track canvas (100%), collapsible metadata panel below canvas, command dock fixed bottom, 2 visible feature lanes (expandable) |
| **768px** (tablet) | Track canvas 100%, context rail slides in from right as overlay (not always visible), command dock fixed bottom |
| **1024px** (desktop) | Track canvas 65%, context rail 35% side-by-side, command dock fixed bottom |
| **1440px** (wide) | Track canvas 70%, context rail 30%, max-width container 1400px centered |

Viewport meta: `width=device-width, initial-scale=1` — never disable zoom.

### Layer architecture (3 layers)

#### Layer 1 — Track Canvas
The main immersive surface.

Contains:
- waveform / note-field hybrid
- playhead
- section labels
- future extension region
- semantic overlays for musical features

**On mobile:** Show waveform + 2 default lanes (tempo, melody). Other lanes available via toggle chips above canvas. Horizontal scroll/pinch-zoom for timeline navigation.

#### Layer 2 — AI Interpretation Layer
Lives on top of the track.

Contains:
- inline insight nodes (min touch target: 44x44px)
- hover/tap annotations
- explanation cards tied to exact timestamps
- suggested continuation logic

**Interaction:** Desktop: hover to preview, click to expand. Mobile: tap to expand, swipe to dismiss.

#### Layer 3 — Command Dock
A slim persistent control area, fixed to bottom.

Contains:
- prompt input (min height: 48px, visible label: "Describe continuation, mood shift, or remix idea")
- quick actions (min 44x44px each, 8px gap between)
- toggles for feature layers
- extension controls
- mode switch between Analyze / Extend / Perform

**Safe area:** Bottom padding respects device safe area insets (home indicator, gesture bar).

---

## Important interaction rule

Do **not** use a normal rectangular chatbot feed as the center of the screen.

Instead:
- keep text input in a **command dock**
- surface AI responses as **inline track annotations**
- attach insights directly to moments in the audio

Examples:
- "Key stabilizes here"
- "Chorus energy peaks here"
- "Bass anchors the groove here"
- "Suggested extension begins with harmonic tension here"

This makes the AI feel embedded in the song, not sitting below it.

### Annotation interaction spec

| Element | Desktop | Mobile | Keyboard |
|---------|---------|--------|----------|
| Insight node | Hover: glow + tooltip preview. Click: expand card. | Tap: expand card. Swipe down: dismiss. | Tab to focus, Enter to expand, Escape to dismiss. |
| Explanation card | Appears anchored to timestamp. Max width 320px. | Full-width bottom sheet. | Arrow keys to navigate between cards. |
| Ghost suggestion | Hover: region brightens. Click: preview audio. | Tap: preview audio. Long-press: options menu. | Enter to preview, Space to play. |

All annotation nodes have `role="button"`, `aria-label` describing the insight, and visible focus rings (`2px solid var(--ring)`).

---

## Track canvas concept

The top of the screen should not be a plain waveform.

It should be a **music map** with multiple musical layers.

Available layers (togglable):
- waveform (always visible, non-togglable)
- section blocks
- tempo pulse lane
- key / harmonic band
- meter / time signature grouping
- instrument ribbons
- mood / energy shape
- generated future region

### Default visibility

On load, show **3 layers maximum** to avoid cognitive overload:
1. Waveform (always)
2. Section blocks
3. Dominant stem (detected automatically)

Other layers activate via toggle chips. Each toggle chip shows the layer's color swatch + label for accessibility (`color-not-only`).

### Rendering performance

- Canvas/WebGL rendering for waveform and animated lanes
- Target: 60fps on desktop, 30fps acceptable on mobile
- Offscreen lanes are not rendered (virtualized)
- Frame budget: <16ms per frame on desktop, <33ms on mobile
- Heavy analysis visualizations lazy-loaded after initial render
- Use `requestAnimationFrame` for all animation loops
- Debounce resize handlers (250ms)

---

## Note-sheet mapping idea

Do **not** make it literal full sheet music unless the target audience is highly music-literate.

Instead, use a **hybrid notation layer**:
- part piano roll
- part score
- part semantic map

Possible mappings:
- **tempo** → repeating pulse markers (icon: metronome + color swatch)
- **key** → highlighted scale-tone lane / harmonic field (icon: music note + color swatch)
- **time signature** → grouped measure blocks (icon: grid + color swatch)
- **melody center** → dominant note glow
- **bass / drums / vocals / piano** → separate colored note streams with distinct patterns (solid, dashed, dotted, wavy) so color is not the only differentiator
- **generated extension** → translucent future notes or ghost notes

This makes the UI feel like the system understands the track's DNA.

---

## Visual language by feature

Use a consistent color and motion system. Each feature has a **color token**, a **pattern/icon**, and a **motion behavior** — ensuring identification through multiple channels, not color alone.

| Feature | Color token | Icon/Pattern | Motion (default) | Motion (reduced-motion) |
|---------|------------|-------------|-------------------|------------------------|
| Tempo | `--color-tempo` | Metronome icon, pulse dots | Steady beat pulse, 200ms | Static dots |
| Key / Harmony | `--color-harmony` | Music note icon, gradient band | Soft drift, 400ms ease | Static band |
| Time Signature | `--color-structure` | Grid icon, bar dividers | None (structural) | None |
| Melody | `--color-melody` | Waveform icon, solid line | Trace follows playhead | Static line |
| Bass | `--color-bass` | Speaker icon, dashed ribbon | Low throb, 300ms | Static ribbon |
| Percussion | `--color-percussion` | Drum icon, vertical ticks | Sharp snap, 100ms | Static ticks |
| Vocals | `--color-vocals` | Mic icon, wavy ribbon | Gentle wave, 500ms | Static ribbon |
| Extension | `--color-extension` | Arrow-right icon, dotted region | Shimmer, 800ms loop | Dotted border only |
| AI Insight | `--color-ai-node` | Sparkle icon, glass circle | Soft glow on approach | Static badge |

---

## Make it striking through motion, not clutter

The interface should feel striking because of:
- cinematic transitions (300-400ms, `ease-out`)
- depth and layered motion (parallax limited to 2 layers max)
- soft atmospheric idle motion (single ambient element, not multiple)
- crisp reactions on hover and playback (150ms feedback)
- synchronized pulses on beat

### Animation rules

| Rule | Spec |
|------|------|
| Max simultaneous animations | 3 per viewport (excluding playhead) |
| Micro-interaction duration | 150–300ms |
| Complex transition duration | 300–400ms, never >500ms |
| Easing (enter) | `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) |
| Easing (exit) | `ease-in`, duration = 60-70% of enter |
| Properties to animate | `transform`, `opacity` only |
| Properties to NEVER animate | `width`, `height`, `top`, `left`, `margin`, `padding` |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` → disable all non-essential animation, keep playhead and progress indicators |
| Interruptibility | All animations cancellable by user interaction |
| Stagger (list items) | 30-50ms per item |

Avoid:
- too many particles
- random neon everywhere
- constant motion with no hierarchy
- unreadable glassmorphism overload
- flashy gradients that do not encode meaning

---

## Recommended screen composition

### Desktop (≥1024px)

#### Top 65% — Track canvas
Large, immersive, low-chrome.

Contains:
- waveform + note-field hybrid
- playhead
- section labels
- bars and measure grouping
- AI insight markers (44x44px touch targets)
- extension preview zone to the right

#### Right 35% — Context panel
Collapsible. Not a metadata dump — structured into sections with clear hierarchy.

Contains:
- **Track info** (key, tempo, time sig — displayed in `--font-mono`)
- **Current region** (section name, active stems)
- **Mood / energy tags** (pill badges)
- **Extension prompt preview** (editable text area)

Each section separated by `--space-6` vertical gap. Section headers use `--font-label-size` uppercase.

#### Bottom — Command dock (fixed, 64px height)
Contains:
- natural language prompt field (`<label>` visible, placeholder as hint only)
- quick action buttons (44x44px min, 8px gap)
- feature toggles (toggle chips with color + label)
- mode switch between Analyze / Extend / Perform
- `padding-bottom: env(safe-area-inset-bottom)`

#### Inline overlays
Contains:
- AI thought nodes (`role="button"`, `aria-label`, focus ring)
- explanations tied to regions (max-width 320px card)
- ghost suggestions for possible continuation

### Tablet (768px–1023px)

- Track canvas: 100% width
- Context panel: slide-in overlay from right (triggered by info button in top bar)
- Command dock: fixed bottom
- Feature toggles: horizontal scroll row above canvas

### Mobile (375px–767px)

- Track canvas: 100% width, horizontal scroll for timeline, pinch-to-zoom
- Default lanes: waveform + 2 (toggle chips to switch)
- Context panel: bottom sheet (swipe up from collapsed summary showing key/tempo/time sig)
- Command dock: fixed bottom, collapses to single input + expand button
- AI insights: tap markers → bottom sheet cards (not inline hover)
- Mode switch: segmented control at top of command dock

---

## Symbolic UI map — primary screen

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│  SONIC BLUEPRINT                                            ● Playing    BPM 124   Key Am  │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│  [Verse]        [Pre]            [Chorus]                     [Ghost Extension → → → ]      │
│                                                                                              │
│  ╭──────────────────────────────── TRACK CANVAS ─────────────────────────────────────────╮   │
│  │                                                                                      │   │
│  │  waveform      ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁   ▁▃▅▇▆▅▄▃▁   ▁▂▃▄▅▆▇███▇▆▅▃▁              ░░░░░░░░   │
│  │  playhead                           │                                                │   │
│  │                                                                                      │   │
│  │  tempo lane     •   •   •   •   •   •   •   •   •   •   •   •             • • •     │   │
│  │  key field      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓             ▒▒▒▒▒▒   │
│  │  meter lane     │ 1 │ 2 │ 3 │ 4 │ 1 │ 2 │ 3 │ 4 │ 1 │ 2 │ 3 │ 4 │       │1│2│3│4│   │
│  │                                                                                      │   │
│  │  bass           ▂▂▃▃▄▄▅▅▄▄▃▃▂▂─── dashed low ribbon ──────────                      │   │
│  │  melody         ╱╲╱╲──╱╲────╱╲╱╲── solid note traces ──────────                      │   │
│  │  vocals         ~~~ ~~~~ ~~~~~ ~~~ wavy atmospheric ribbon ~~~~                      │   │
│  │  percussion     ! ! ! ! ! ! ! ! ! ! dotted vertical ticks                            │   │
│  │                                                                                      │   │
│  │        ◎ [Tab] insight: "bass anchors groove here"                                   │   │
│  │                         ◎ [Tab] "chorus lift starts here"                            │   │
│  │                                                       ◌ future continuation          │   │
│  ╰──────────────────────────────────────────────────────────────────────────────────────╯   │
│                                                                                              │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│  Context Panel (collapsible)               │  AI Insight Card (aria-live region)           │
│  ────────────                              │  ┌────────────────────────────────────────┐   │
│  TRACK INFO                                │  │ Chorus energy peaks here.              │   │
│  Tempo         124 BPM  [mono]             │  │ Suggest extending with retained        │   │
│  Key           A minor  [mono]             │  │ harmonic tension and brighter top      │   │
│  Time Sig      4/4      [mono]             │  │ percussion.                            │   │
│  ────────────                              │  └────────────────────────────────────────┘   │
│  CURRENT REGION                            │                                                │
│  Section       Chorus                      │                                                │
│  Dominant      bass + vocals               │                                                │
│  ────────────                              │                                                │
│  MOOD                                      │                                                │
│  [nocturnal] [cinematic]  ← pill badges    │                                                │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│  Command Dock (fixed, 64px)                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ <label> Describe the continuation, mood shift, or remix idea…                         │  │
│  └────────────────────────────────────────────────────────────────────────────────────────┘  │
│   [Analyze]   [Extend]   [Perform]   [≡ Harmony]   [≡ Rhythm]   [≡ Stems]   44x44px ea  │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Symbolic UI map — upload to analysis transition

```text
[ Upload Audio ]                    ← drag-and-drop zone, 200x200px min
[ .mp3 .wav .flac .ogg ]           ← accepted formats listed
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Analyzing track…                                    │
│  ████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  [Cancel]          │
│                                                      │
│  ♪ tempo ............ ✓ locked (300ms fade-in)       │
│  ♫ key .............. ✓ locked (300ms, +400ms delay) │
│  # time signature ... ✓ locked (300ms, +800ms delay) │
│  ◌ sections ......... ✓ mapped (300ms, +1200ms)      │
│  ✦ stem layers ...... ✓ identified (300ms, +1600ms)  │
│                                                      │
│  [reduced-motion: all appear at once, single fade]   │
│                                                      │
│  Timeout: 30s → show partial + "incomplete" badge    │
│  Error: toast + retry button                         │
└──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Ghost extension projected (600ms materialization)   │
│  existing clip  ████████████████████░░░░░░░░░ future │
│  [Retry] if generation failed                        │
└──────────────────────────────────────────────────────┘
```

---

## Symbolic UI map — inline AI instead of chat feed

```text
Normal chat layout:              Better embedded layout:

┌───────────────┐               track ───◎──────◎────────◎─────
│ AI response   │                          │      │        │
│ text text     │               [Tab]  [Tab]  [Tab]  ← keyboard navigable
│ text text     │                    "Key shift" "Hook"  "Extend"
└───────────────┘               Each node: role="button", aria-label, 44x44px

AI should annotate the music itself.
```

---

## Symbolic UI map — note / feature overlay

```text
Bar grid      │1 & 2 & 3 & 4 &│1 & 2 & 3 & 4 &│
Tempo pulse   ●   ●   ●   ●    ●   ●   ●   ●       [dots — color + shape]
Melody        ──◡────◠───◡──────◠────◡──────         [solid line]
Bass          ▃▃____▅▅____▃▃____▆▆____               [dashed ribbon]
Harmony       ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓              [gradient band]
Percussion    ! ! ! ! ! ! ! ! ! ! ! !                 [dotted ticks]
Extension                                     ░░◌░░◌░░◌░░  [translucent + dotted border]
```

Each lane uses a distinct **pattern** in addition to color, ensuring features are distinguishable without color vision.

---

## Symbolic UI map — performance / DJ mode

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  PERFORM MODE                                                [Exit: Esc/✕]  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│          ◉ BASS              ◉ VOCALS              ◉ PIANO                  │
│        ╱──────╲            ╱────────╲            ╱───────╲                  │
│       │  low   │          │ shimmer │          │ harmony │                  │
│        ╲──────╱            ╲────────╱            ╲───────╱                  │
│         [1]                  [2]                   [3]    ← keyboard keys   │
│                                                                              │
│  Visible button fallbacks (always shown):                                   │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                              │
│  │ Filter │ │  Gain  │ │ Width  │ │  Mute  │  ← 44x44px, labeled          │
│  └────────┘ └────────┘ └────────┘ └────────┘                              │
│                                                                              │
│  Optional gesture mapping (enhancement, not required):                      │
│  pinch  → bass filter      │  Keyboard: ↑↓ arrows                          │
│  raise  → vocal gain       │  Keyboard: +/- keys                           │
│  spread → piano width      │  Keyboard: [/] keys                           │
│  fist   → drum mute        │  Keyboard: M key                              │
│                                                                              │
│  Reactive feedback: object glows when controlled (150ms, ease-out)          │
│  Haptic: light impact on gesture detection (mobile only, not overused)      │
│                                                                              │
│  [reduced-motion: disable glow animation, use border highlight instead]     │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Accessibility specification

### WCAG 2.1 AA compliance (minimum target)

| Requirement | Implementation |
|------------|----------------|
| Color contrast | All text ≥4.5:1 against background. Large text (≥24px) ≥3:1. Verified per token pair above. |
| Color not only | Every feature lane uses color + pattern + icon. Status uses color + icon + text. |
| Keyboard navigation | Full Tab order through all interactive elements. Focus rings visible (2px solid `var(--ring)`). Arrow keys within track canvas. Escape dismisses overlays. |
| Screen reader | All insight nodes have `aria-label`. AI cards use `aria-live="polite"`. Track metadata exposed via `aria-describedby`. |
| Focus management | After upload completes, focus moves to track canvas. After error, focus moves to first actionable element. |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` disables all decorative animation. Playhead and progress indicators remain. |
| Touch targets | All interactive elements ≥44x44px. Spacing between targets ≥8px. |
| Heading hierarchy | `h1` page title → `h2` section → `h3` subsection, no skips. |
| Skip link | "Skip to track canvas" link at top of page for keyboard users. |
| Alt text | Upload zone has descriptive text. Chart-like canvas has `aria-label` summary of current analysis. |

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` / `→` | Seek backward / forward 5s |
| `Shift + ←` / `→` | Seek 1s |
| `1–7` | Toggle feature lanes |
| `Tab` | Navigate between insight nodes |
| `Enter` | Expand focused insight |
| `Escape` | Close overlay / exit Performance mode |
| `M` | Mute / unmute |
| `A` / `E` / `P` | Switch mode: Analyze / Extend / Perform |

---

## Product behavior principles

### 1. Track-first, chat-second
The song is always the focal point.

### 2. Every AI explanation should point to something visible
No free-floating generic text.

### 3. Every musical feature should have a visible encoding
Tempo, key, meter, energy, stems, and extension logic should all be seen — through color, pattern, and icon together.

### 4. Future audio should feel projected
The extension is not just output — it is a visible possibility space.

### 5. Motion should communicate state
Movement must explain, not decorate. Max 3 simultaneous animations per view.

### 6. Accessibility is not optional
Every interaction path has a keyboard equivalent. Every visual encoding has a non-color alternative. Every animation respects user preferences.

---

## UX details that will make it feel premium

- on hover, the timeline subtly expands (150ms, `ease-out`, `transform: scaleY(1.05)`)
- on section change, labels softly bloom in (200ms fade, staggered 30ms)
- on playback, tempo pulses lock to beat (synced to audio clock, not setTimeout)
- on AI insight hover, related region glows (150ms, `box-shadow` with accent color)
- on extension generation, the future region materializes (600ms, `opacity` + `scale` from 0.98)
- on toggling a feature, only the corresponding visual system intensifies (200ms, `opacity: 0.3 → 1`)
- on stem focus, unrelated layers dim (`opacity: 0.2`, 200ms transition)
- all hover effects disabled on touch devices (use `@media (hover: hover)`)
- all timing values have `prefers-reduced-motion` fallback (instant or disabled)

---

## What to avoid

Avoid designing it like:
- a generic chatbot page
- a normal music SaaS dashboard
- a DAW clone
- an overbusy visualizer

Avoid:
- tiny sidebars filled with metadata → use structured, collapsible context panel instead
- endless stacked messages → use inline annotations tied to timestamps
- flat cards with no relationship to the track → anchor everything to the timeline
- decorative neon with no meaning → every color/glow encodes a musical feature
- emoji as icons → use Lucide SVG icons consistently
- hover-only interactions → always provide tap/keyboard alternative
- blocking animations → all animations interruptible, none blocking input
- ignoring mobile → every element has a mobile layout strategy

---

## Performance budget

| Metric | Target |
|--------|--------|
| First Contentful Paint | <1.5s |
| Largest Contentful Paint | <2.5s |
| Cumulative Layout Shift | <0.1 |
| First Input Delay | <100ms |
| Time to Interactive | <3.5s |
| Frame rate (desktop) | 60fps |
| Frame rate (mobile) | 30fps minimum |
| Bundle size (initial) | <200KB gzipped |

### Implementation strategy

- Canvas/WebGL for waveform and animated lanes (off main thread where possible)
- Lazy load Performance/DJ mode (code-split, loaded on mode switch)
- Lazy load below-fold analysis details
- `font-display: swap` for Inter
- Preload critical font weights (400, 600) only
- Image assets: WebP/AVIF with explicit `width`/`height`
- Debounce resize (250ms), throttle scroll handlers (16ms)
- Virtualize feature lanes not currently in viewport
- Web Workers for audio analysis computation
- `will-change: transform, opacity` on animated elements (remove after animation completes)

---

## Hackathon-safe build priorities

If time is limited, prioritize these in order:

1. **One beautiful upload → scan → projection sequence** (with error states)
2. **One strong track canvas with 3 default feature overlays** (not 8)
3. **Inline AI insight nodes instead of a normal chat feed** (keyboard navigable)
4. **One ghost extension preview region** (with failure fallback)
5. **One polished command dock** (with visible label, proper input)
6. **Optional: one performance mode screen** (with button fallbacks for gestures)

Minimum accessibility for hackathon: focus rings, keyboard play/pause, `prefers-reduced-motion` check, contrast-verified colors.

This is enough to feel memorable without overbuilding.

---

## Recommended implementation split

### Web app
Use for:
- upload
- track canvas UI (Canvas/WebGL)
- command dock
- consultant mode
- analysis results

### Visual engine / immersive layer
Optional WebGL-based scene for:
- cinematic transitions
- stage visuals
- DJ mode
- performance budget: share GL context with track canvas, do not create separate

### Local hand tracking
Use for:
- gesture input (enhancement only)
- mapping to stems / controls
- performance mode only
- **Required:** visible button fallbacks for every gesture-mapped control

### Backend
Use for:
- feature extraction
- prompt generation
- extension API orchestration
- explanation generation

---

## Suggested naming

Good names for the main page:
- **Sonic Blueprint**
- **Track DNA**
- **Music Map**
- **Extension Canvas**
- **Harmonic Blueprint**

The strongest are probably:
- **Sonic Blueprint**
- **Track DNA**

---

## Positioning sentence

> An immersive AI music interface where the track becomes the canvas, musical features become visible layers, and audio extension appears as a projected future of the song.

---

## Final recommendation

Build around this idea:

**Not "chat with music."**

**"Enter the track, understand its DNA, and shape its future."**

---

## Pre-delivery checklist

Before shipping, verify:

### Scope guardrail (must stay true)
- [ ] This project implements UI, orchestration, annotation, and extension-request flows only
- [ ] No in-browser DSP, stem separation, waveform rewriting, or direct music manipulation is implemented here
- [ ] Any "extend/transform" action is an API orchestration boundary with explicit loading/error states

### Visual Quality
- [ ] All colors use semantic tokens from design system (no raw hex in components)
- [ ] No emojis used as icons (Lucide SVG throughout)
- [ ] Feature lanes distinguishable without color (pattern + icon + color)
- [ ] Ghost extension region clearly distinct from analyzed region
- [ ] Dark mode contrast verified for all text/background pairs

### Interaction
- [ ] All interactive elements ≥44x44px touch targets
- [ ] All hover interactions have tap equivalent on mobile
- [ ] Command dock input has visible `<label>`, not placeholder-only
- [ ] Mode switching preserves canvas state (scroll position, active layers)
- [ ] Error states implemented for upload, analysis, and extension flows

### Accessibility
- [ ] Tab order matches visual order across all elements
- [ ] Focus rings visible on all interactive elements
- [ ] Keyboard shortcuts functional (Space, arrows, 1-7, Escape)
- [ ] `aria-label` on all insight nodes and icon-only buttons
- [ ] `aria-live` on AI response regions
- [ ] Skip link to track canvas
- [ ] `prefers-reduced-motion` respected (all decorative animation disabled)

### Performance
- [ ] FCP <1.5s, LCP <2.5s, CLS <0.1
- [ ] Canvas rendering ≥30fps on mobile
- [ ] Performance/DJ mode code-split and lazy loaded
- [ ] Font loaded with `font-display: swap`
- [ ] No layout-shifting animations (transform/opacity only)

### Responsive
- [ ] Tested at 375px, 768px, 1024px, 1440px
- [ ] Mobile: track canvas scrollable, context panel is bottom sheet
- [ ] Safe area insets respected on command dock
- [ ] No horizontal scroll on mobile
- [ ] Viewport meta: `width=device-width, initial-scale=1`

---

## Delegated build checklist (Vercel React best practices)

Use this before implementation starts. Each item is delegated and mapped to high-impact Vercel React/Next patterns.

### Track A - Data and server flow (Frontend + API)
- [ ] **A1 (async-parallel, async-api-routes):** Start independent async operations early in route handlers/server actions; await late with `Promise.all`
- [ ] **A2 (server-parallel-fetching, async-suspense-boundaries):** Split page sections so non-dependent data fetches render in parallel with Suspense boundaries
- [ ] **A3 (server-auth-actions):** Authenticate and authorize every server action exactly like public API routes
- [ ] **A4 (server-cache-react):** Wrap repeated request-scope reads (auth/session/feature metadata) with `React.cache()`
- [ ] **A5 (server-serialization, server-dedup-props):** Pass minimal props to client components; avoid duplicate transformed payloads across RSC boundaries

### Track B - Bundle and loading strategy (Frontend)
- [ ] **B1 (bundle-dynamic-imports):** Dynamically import heavy views (`PerformanceMode`, `DJMode`, dense visualization inspectors)
- [ ] **B2 (bundle-conditional):** Load optional feature modules only after user activates that feature
- [ ] **B3 (bundle-defer-third-party):** Defer analytics/logging/telemetry libraries until after hydration
- [ ] **B4 (bundle-barrel-imports):** Avoid barrel imports from heavy libraries; use direct imports or `optimizePackageImports`
- [ ] **B5 (bundle-preload):** Preload likely-next heavy modules on hover/focus (intent-based prefetch)

### Track C - Client interaction and rendering (Frontend)
- [ ] **C1 (rerender-no-inline-components):** Never define components inside render functions for canvas panels/docks/toolbars
- [ ] **C2 (rerender-functional-setstate, rerender-transitions):** Use functional state updates and `startTransition` for non-urgent UI updates
- [ ] **C3 (client-passive-event-listeners):** Use passive listeners for scroll/touch where `preventDefault` is not needed
- [ ] **C4 (rendering-content-visibility):** Apply `content-visibility: auto` to long, off-screen insight lists/timelines
- [ ] **C5 (rendering-resource-hints):** Add `preconnect`/`preload` hints for critical fonts and API domains

### Track D - Verification and budgets (QA + Frontend)
- [ ] **D1:** Confirm no async waterfalls in critical routes via code review checklist
- [ ] **D2:** Verify initial route bundle and lazy chunks in build output; fail PR on unexpected heavy imports
- [ ] **D3:** Run Core Web Vitals checks on mobile profile (FCP, LCP, CLS) and store results per milestone
- [ ] **D4:** Verify loading, empty, and error states for upload -> analysis -> extension orchestration path
- [ ] **D5:** Re-validate scope guardrail: no direct music manipulation code introduced in frontend or API layer
