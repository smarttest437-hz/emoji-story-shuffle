# Timer Duration Selector Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pill-style segmented toggle to the Timer component so users can choose 90s, 3 min, or 5 min before starting the countdown.

**Architecture:** Add `timerDuration` to the existing `AppState` (persisted via `useLocalStorage`), pass it down to `Timer` as two new props, render the pill toggle inside `Timer` between the ring and the controls, and add CSS using the existing variable system.

**Tech Stack:** React 18, TypeScript, Vitest, CSS custom properties (`var(--*)`), Vite dev server

---

## Chunk 1: All Changes

### Task 1: Update AppState and handlers in App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add `timerDuration` to `AppState` interface**

  Open `src/App.tsx`. Change lines 15–23:

  ```ts
  interface AppState {
    emojis: string[];
    lockedIndices: number[];
    emojiCount: 3 | 4 | 5;
    story: string;
    timerSeconds: number;
    timerDuration: 90 | 180 | 300;   // ← add this line
    timerRunning: boolean;
    darkMode: boolean;
  }
  ```

- [ ] **Step 2: Remove `DEFAULT_TIMER_SECONDS` constant and add `timerDuration` to `initialState`**

  Remove line 11 (`const DEFAULT_TIMER_SECONDS = 90;`) — it is fully replaced by `state.timerDuration`.

  Change lines 25–33:

  ```ts
  const initialState: AppState = {
    emojis: getRandomEmojis(EMOJI_SEED, 3),
    lockedIndices: [],
    emojiCount: 3,
    story: '',
    timerSeconds: 90,
    timerDuration: 90,               // ← add this line
    timerRunning: false,
    darkMode: false,
  };
  ```

- [ ] **Step 3: Add `handleTimerDurationChange` handler**

  Add after `handleTimerPause` (after line 168):

  ```ts
  const handleTimerDurationChange = useCallback((duration: 90 | 180 | 300) => {
    setState((prev) => ({
      ...prev,
      timerDuration: duration,
      timerSeconds: duration,
      timerRunning: false,
    }));
  }, [setState]);
  ```

- [ ] **Step 4: Fix `handleTimerReset` to use `timerDuration` instead of hardcoded 90**

  Replace lines 170–176:

  ```ts
  const handleTimerReset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      timerSeconds: prev.timerDuration,
      timerRunning: false,
    }));
  }, [setState]);
  ```

- [ ] **Step 5: Fix `handleNewRound` to reset `timerDuration` back to 90**

  Inside `handleNewRound` (around line 183), update the `setState` call to include:

  ```ts
  setState((prev) => ({
    ...prev,
    emojis: newEmojis,
    lockedIndices: [],
    story: '',
    timerDuration: 90,        // ← add
    timerSeconds: 90,
    timerRunning: false,
  }));
  ```

- [ ] **Step 6: Pass new props to `<Timer>` and fix `maxSeconds`**

  Update the `<Timer>` JSX (around lines 216–224):

  ```tsx
  <Timer
    seconds={state.timerSeconds}
    isRunning={state.timerRunning}
    maxSeconds={state.timerDuration}
    selectedDuration={state.timerDuration}
    onDurationChange={handleTimerDurationChange}
    onTick={handleTimerTick}
    onStart={handleTimerStart}
    onPause={handleTimerPause}
    onReset={handleTimerReset}
  />
  ```

- [ ] **Step 7: Verify TypeScript compiles**

  Run:
  ```bash
  cd /Users/hattie.zhang/Documents/claudecode/projects/emoji-story-shuffle
  npm run build 2>&1 | head -30
  ```

  Expected: build errors only for `Timer.tsx` missing the new props (not yet updated). No errors from `App.tsx` itself.

- [ ] **Step 8: Commit**

  ```bash
  git add src/App.tsx
  git commit -m "feat: add timerDuration to AppState and wire up handlers"
  ```

---

### Task 2: Update Timer.tsx — add props and pill toggle

**Files:**
- Modify: `src/components/Timer.tsx`

- [ ] **Step 1: Extend `TimerProps` interface**

  Replace lines 4–12:

  ```ts
  interface TimerProps {
    seconds: number;
    isRunning: boolean;
    maxSeconds: number;
    selectedDuration: 90 | 180 | 300;
    onDurationChange: (duration: 90 | 180 | 300) => void;
    onTick: () => void;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
  }
  ```

- [ ] **Step 2: Destructure new props in the component signature**

  Replace lines 14–22:

  ```ts
  export const Timer: React.FC<TimerProps> = ({
    seconds,
    isRunning,
    maxSeconds,
    selectedDuration,
    onDurationChange,
    onTick,
    onStart,
    onPause,
    onReset,
  }) => {
  ```

- [ ] **Step 3: Add `DURATIONS` constant above the component return**

  Add before the `return (` statement:

  ```ts
  const DURATIONS: { value: 90 | 180 | 300; label: string }[] = [
    { value: 90,  label: '90s'   },
    { value: 180, label: '3 min' },
    { value: 300, label: '5 min' },
  ];
  ```

- [ ] **Step 4: Add pill toggle markup between `timer-display` and `timer-controls`**

  After the closing `</div>` of `timer-display` (after line 82) and before `<div className="timer-controls">`:

  ```tsx
  <div
    className={`timer-pill${isRunning ? ' timer-pill--disabled' : ''}`}
    role="group"
    aria-label="Timer duration"
  >
    {DURATIONS.map(({ value, label }) => (
      <button
        key={value}
        className={`timer-pill__option${selectedDuration === value ? ' timer-pill__option--active' : ''}`}
        onClick={() => !isRunning && onDurationChange(value)}
        disabled={isRunning}
        aria-pressed={selectedDuration === value}
        aria-label={`Set timer to ${label}`}
      >
        {label}
      </button>
    ))}
  </div>
  ```

- [ ] **Step 5: Verify TypeScript compiles cleanly**

  Run:
  ```bash
  npm run build 2>&1 | head -30
  ```

  Expected: no TypeScript errors. Build succeeds.

- [ ] **Step 6: Commit**

  ```bash
  git add src/components/Timer.tsx
  git commit -m "feat: add pill toggle to Timer component"
  ```

---

### Task 3: Add CSS for the pill toggle

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Add pill styles after `.timer-controls` block**

  `.timer-controls` ends at line 422. Add immediately after it (after the closing `}`):

  ```css
  /* Timer duration pill */
  .timer-pill {
    display: flex;
    gap: 4px;
    background: var(--bg-tertiary);
    border-radius: 999px;
    padding: 3px;
    margin-bottom: 12px;
  }

  .timer-pill--disabled {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
  }

  .timer-pill__option {
    background: transparent;
    border: none;
    border-radius: 999px;
    padding: 5px 14px;
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .timer-pill__option:hover:not(:disabled) {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .timer-pill__option--active {
    background: var(--accent-primary);
    color: #ffffff;
    font-weight: 600;
  }
  ```

- [ ] **Step 2: Start dev server and verify visually**

  Run:
  ```bash
  npm run dev
  ```

  Open `http://localhost:5173` and check:
  - Pill shows **90s** selected (highlighted in blue) by default
  - Clicking **3 min** resets countdown to 3:00 and highlights that option
  - Clicking **5 min** resets countdown to 5:00 and highlights that option
  - Clicking **▶️ Start** — pill greys out, buttons are unclickable
  - Clicking **🔄 Reset** — pill re-enables, selected duration preserved
  - Reload page — selected duration persists
  - Toggle dark mode — pill colours adapt correctly

- [ ] **Step 3: Run existing tests to confirm no regressions**

  Run:
  ```bash
  npm test
  ```

  Expected: all existing tests in `tests/utils.test.ts` pass (utils are unchanged).

- [ ] **Step 4: Commit**

  ```bash
  git add src/styles.css
  git commit -m "feat: add CSS styles for timer-pill component"
  ```

---

### Task 4: Final verification

- [ ] **Step 1: Verify New Round resets pill to 90s**

  In the running dev server:
  1. Select **5 min**
  2. Click **New Round** and confirm
  3. Expected: pill resets to **90s**, countdown shows **1:30**

- [ ] **Step 2: Verify progress ring matches selected duration**

  1. Select **3 min** — countdown shows **3:00**, ring is full
  2. Click **▶️ Start**, wait 5 seconds, click **⏸️ Pause**
  3. Expected: ring has drained slightly relative to 3:00 (not 1:30)

- [ ] **Step 3: Verify keyboard accessibility**

  1. Tab to the pill toggle
  2. Use Tab to move between options
  3. Press Space/Enter to select — countdown should update
  4. Expected: full keyboard navigation works

- [ ] **Step 4: Final commit tag**

  ```bash
  git tag v1.1.0-timer-selector
  ```
