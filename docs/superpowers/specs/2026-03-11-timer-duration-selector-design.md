# Timer Duration Selector — Design Spec

**Date:** 2026-03-11
**Status:** Approved

---

## Overview

Add a pill-style segmented toggle to the Timer component allowing users to choose between three durations — 90 seconds, 3 minutes, and 5 minutes — before starting the countdown.

---

## Behaviour

- The pill toggle appears between the progress ring and the Start/Pause + Reset button row inside `Timer`.
- Three options: **90s** (default), **3 min**, **5 min** — values in seconds: `90 | 180 | 300`.
- Selecting a duration while the timer is stopped immediately resets the countdown to that duration.
- Once the timer starts (`isRunning === true`), the pill toggle is **disabled** — greyed out at 45% opacity, `cursor: not-allowed`, `pointer-events: none`.
- Clicking **Reset** stops the timer and re-enables the pill (preserves the currently selected duration, does not snap back to 90s).
- **New Round** resets `timerDuration` back to `90`.
- Selected duration persists in `localStorage` as part of `AppState`.

---

## Data Model

### `AppState` (App.tsx) — add one field

```ts
interface AppState {
  // ...existing fields...
  timerDuration: 90 | 180 | 300;  // new — selected duration in seconds
}
```

`initialState` default: `timerDuration: 90`.

`DEFAULT_TIMER_SECONDS` constant is removed; replaced by `timerDuration` from state.

### localStorage

`timerDuration` is stored as part of the existing `emoji-story-state` key via `useLocalStorage` — no separate key needed.

---

## Component Changes

### `App.tsx`

1. Add `timerDuration: 90 | 180 | 300` to `AppState` interface and `initialState`.
2. Remove `DEFAULT_TIMER_SECONDS` constant (or keep only for `initialState` default — `90`).
3. Add handler:
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
4. Update `handleTimerReset` — reset `timerSeconds` to `state.timerDuration` (not hardcoded `90`):
   ```ts
   const handleTimerReset = useCallback(() => {
     setState((prev) => ({
       ...prev,
       timerSeconds: prev.timerDuration,
       timerRunning: false,
     }));
   }, [setState]);
   ```
5. Update `handleNewRound` — reset `timerDuration: 90` and `timerSeconds: 90`.
6. Pass two new props to `<Timer>`:
   - `selectedDuration={state.timerDuration}`
   - `onDurationChange={handleTimerDurationChange}`
7. Update `maxSeconds` prop: `maxSeconds={state.timerDuration}` (was `DEFAULT_TIMER_SECONDS`).

### `Timer.tsx`

1. Extend `TimerProps`:
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
2. Add pill toggle markup between `<div className="timer-display">` and `<div className="timer-controls">`:
   ```tsx
   const DURATIONS: { value: 90 | 180 | 300; label: string }[] = [
     { value: 90,  label: '90s'   },
     { value: 180, label: '3 min' },
     { value: 300, label: '5 min' },
   ];

   <div className={`timer-pill${isRunning ? ' timer-pill--disabled' : ''}`} role="group" aria-label="Timer duration">
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

### `styles.css`

Add after existing `.timer-controls` styles, using CSS variables from `:root`:

```css
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

---

## Files Changed

| File | Change |
|---|---|
| `src/App.tsx` | Add `timerDuration` to state, new handler, update reset/new-round, update Timer props |
| `src/components/Timer.tsx` | Add 2 props, render pill toggle |
| `src/styles.css` | Add `.timer-pill` styles |

No other files touched.

---

## Acceptance Criteria

- [ ] Pill shows 90s selected by default on first load.
- [ ] Clicking 3 min or 5 min while stopped resets countdown to that value.
- [ ] Pill is visually disabled (45% opacity, no pointer events) once timer starts.
- [ ] Pill re-enables after Reset is clicked; selected duration is preserved.
- [ ] New Round resets duration back to 90s.
- [ ] `maxSeconds` (progress ring) always matches selected duration.
- [ ] Selected duration survives page reload via localStorage.
- [ ] Works correctly in dark mode (uses CSS variables).
- [ ] Keyboard accessible: Tab to focus options, Space/Enter to select.
