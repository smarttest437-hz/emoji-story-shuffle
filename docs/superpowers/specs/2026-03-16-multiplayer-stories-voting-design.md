# Multiplayer Story Submission & Voting — Design Spec

**Date:** 2026-03-16
**Status:** Approved

---

## Overview

Add multiplayer support to emoji-story-shuffle so team members can submit stories, see each other's submissions in real time, and vote for their favourite at the end. A host controls phase transitions. No login required — users enter a name on arrival.

---

## Behaviour

### User flow
1. User opens the app. If `mp-name` is not in localStorage, a name-entry screen is shown. The user types their name and clicks **Join**. The name and a random UUID (`mp-voter-id`) are saved to localStorage. If `mp-name` already exists, the name-entry screen is skipped entirely; there is no way to change the name without clearing localStorage.
2. User writes their story in the existing textarea. The currently displayed emojis are captured at submit time. The user clicks **Submit Story** to send `{ author, text, emojis }` to the backend.
3. All submitted stories appear in a **Multiplayer Panel** visible to everyone, polling every 3 seconds.
4. When the host clicks **Open Voting**, the phase changes to `voting`. Each story card shows a **Vote** button; the Submit Story button is disabled.
5. Each user casts exactly one vote (can vote for their own story). Once voted, their choice is locked; the Vote buttons are replaced with a "Voted" indicator.
6. When the host clicks **Show Results**, the phase changes to `results`. Stories display vote counts and the winner is highlighted.
7. Host can click **Reset** to clear all stories and votes and return to `submission` phase.

### Host role
- Designated by visiting `/?host=true` in the URL.
- Sees three extra buttons: **Open Voting**, **Show Results**, **Reset**.
- No authentication — host controls are frontend-gated only. This is an intentional trade-off for simplicity.

### Phases
- `submission` — users can submit stories; voting buttons hidden.
- `voting` — Submit Story button disabled; each user can cast one vote.
- `results` — vote counts shown; winner (most votes) highlighted. Ties show all tied stories as winners.

### Backend unavailability
If `GET /api/state` fails (network error, server cold start, etc.), the Multiplayer Panel displays a "Connecting..." message and retries on the next poll cycle. Story submission and voting show an inline error message if the request fails. The rest of the app (emoji shuffling, local story writing, timer) continues to work normally.

### Data persistence on Render
`db.json` is mutated at runtime on the Render file system. If the Render instance restarts (e.g., after inactivity on the free tier), all stories and votes are lost and the game resets to the initial `submission` state. This is an accepted trade-off for this project.

---

## Data Model

**db.json** (single global state, initial content committed to repo):

```json
{
  "phase": "submission",
  "stories": [],
  "votes": []
}
```

Story shape:
```json
{ "id": "uuid", "author": "Alice", "text": "Once upon a time...", "emojis": ["🐱", "🚀", "🌙"] }
```

Vote shape:
```json
{ "voterId": "alice-uuid", "storyId": "story-uuid" }
```

### localStorage (client-side)
- `mp-name` — user's display name
- `mp-voter-id` — random UUID for vote deduplication

---

## API

All endpoints on the Express backend at `/api/*`.

| Method | Path | Body | Success response | Error response |
|--------|------|------|-----------------|----------------|
| `GET` | `/api/state` | — | `200 { phase, stories, votes }` | — |
| `POST` | `/api/stories` | `{ author, text, emojis }` | `200 { stories }` | `400` if phase is not `submission` |
| `POST` | `/api/votes` | `{ voterId, storyId }` | `200 { votes }` | `409` if voterId already voted; `400` if phase is not `voting` |
| `POST` | `/api/phase` | `{ phase }` | `200 { phase }` | `400` if phase value is invalid |
| `POST` | `/api/reset` | — | `200 { phase, stories, votes }` | — |

**Phase enforcement is on the backend:**
- `POST /api/stories` returns `400` if `phase !== "submission"`.
- `POST /api/votes` returns `400` if `phase !== "voting"`, and `409` with `{ error: "Already voted" }` if the `voterId` is already in the `votes` array.

No authentication on the backend — host gating is purely frontend.

---

## Architecture

### Backend (`server/`)
- `server/index.js` — Express server: serves the Vite-built static files from `dist/` and exposes the API routes.
- `server/db.json` — initial state file (committed to repo, mutated at runtime on Render).
- Uses `fs.readFileSync`/`fs.writeFileSync` (same pattern as retrospective-app).
- Single `db.json` object with `phase`, `stories`, `votes`.

### Frontend changes
- `src/components/MultiplayerPanel.tsx` — new component. Responsibilities: poll `/api/state` every 3 seconds, render story list with vote buttons or vote counts depending on phase, handle story submission and voting, show connection error state. Receives `authorName`, `voterId`, `storyText`, `emojis` as props. Clears interval on unmount.
- `src/App.tsx` — adds name-entry gate (renders name-entry form if `mp-name` not in localStorage, otherwise renders main app with `MultiplayerPanel`). Passes `storyText` and current `emojis` as props to `MultiplayerPanel`.
- `src/styles.css` — styles for panel, story cards, vote buttons, winner highlight, connection error state.

### Polling
- `MultiplayerPanel` calls `GET /api/state` every 3 seconds via `setInterval`.
- Clears interval on unmount.
- On fetch failure, shows "Connecting..." and retries on next tick.

---

## Files Changed

| File | Change |
|------|--------|
| `server/index.js` | New — Express backend |
| `server/db.json` | New — initial db state |
| `src/components/MultiplayerPanel.tsx` | New — multiplayer UI |
| `src/App.tsx` | Modify — name entry gate, render panel |
| `src/styles.css` | Modify — panel + card styles |
| `package.json` | Modify — add Express dependency, add `start` script |

---

## Acceptance Criteria

- [ ] User is prompted for a name on first visit; name persists across reloads; screen is skipped if name already in localStorage.
- [ ] Submitting a story sends it to the backend and it appears in all connected clients within ~3 seconds.
- [ ] `POST /api/stories` returns `400` if phase is not `submission`.
- [ ] During `voting` phase, each user can cast exactly one vote; `POST /api/votes` returns `409` on a duplicate vote.
- [ ] During `results` phase, vote counts are shown and the story with the most votes is highlighted (ties: all tied stories highlighted).
- [ ] Host controls (Open Voting, Show Results, Reset) are only visible at `/?host=true`.
- [ ] Reset clears all stories and votes and returns to `submission` phase.
- [ ] If the backend is unreachable, the panel shows "Connecting..." and retries; the rest of the app continues to work.
