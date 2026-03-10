# Badminton 2x2 — Queue Manager

## Project Overview

Local web app for managing player queue and court assignments during amateur badminton 2x2 sessions. Designed for a coach/admin running sessions with 4-20 players on 1-5 courts.

**Primary device:** 12" tablet placed courtside, also works on phones and desktops.

## Tech Stack

- Pure HTML / CSS / JavaScript — no frameworks, no build tools, no npm
- `localStorage` for data persistence (survives refresh)
- Firebase Realtime Database for optional multi-device sync (CDN script tags)
- Mobile-first responsive CSS with breakpoints at 768px and 1024px

## Files

```
index.html   — App shell, 6 tab panels, modal, toast container
styles.css   — All styles, CSS variables, responsive breakpoints
app.js       — Full application logic (~2100 lines)
```

## How to Run

Open `index.html` in a browser. That's it. No server required.

Or use a local server:
```bash
python3 -m http.server 8080
```

## Architecture

Single global `App` object with modules:

| Module         | Purpose                                          |
|----------------|--------------------------------------------------|
| `App.i18n`     | Internationalization (Polish + English)           |
| `App.Utils`    | ID generation, date/time formatting               |
| `App.Storage`  | localStorage read/write, JSON export/import       |
| `App.Session`  | Session create/reset, court initialization         |
| `App.Players`  | Add/remove players, mark present/absent, wishes    |
| `App.Queue`    | Waiting queue CRUD, reorder, move to end           |
| `App.Courts`   | Start/finish/cancel games, pair stats tracking     |
| `App.Matches`  | Match history, filtering, undo last match          |
| `App.Suggest`  | Auto-suggestion algorithm for next 4 players       |
| `App.Sync`     | Firebase Realtime Database sync                    |
| `App.UI`       | All rendering, event binding, modals, toasts       |
| `App.DnD`      | Drag-and-drop (mouse + touch) for queue reorder    |

## Key Concepts

### Living Queue
Players arrive and get a sequential number (#1, #2, ...). After a game finishes, all 4 players go to the **end** of the queue. Queue position is the primary factor for next game selection.

### Suggestion Algorithm
Scores each candidate by:
- Queue position (weight: 100 per position)
- Games above average penalty (weight: 50 per game)
- Unfulfilled wish bonus (-80)

Team split scoring:
- Pair repeat penalty (30 per repeat)
- Opponent repeat penalty (15 per repeat beyond 1st)
- Wish fulfillment bonus (-100)

### Two UI Modes
- **Board** (player-facing): Simple view — courts with teams + timer, queue list. One-tap "Finish" button.
- **Management** (admin): Full control — all 6 tabs, add/remove players, manual player selection, settings.

Toggle between modes with the gear icon in the header.

### i18n (Internationalization)
- Two languages: Polish (default) and English
- Static text uses `data-i18n` attributes on HTML elements
- Dynamic text uses `App.t('key')` function calls
- Language preference saved in `localStorage` (`badminton_lang`)
- Switcher in header with flag buttons

### Firebase Sync
- Admin creates a room, shares the room ID (e.g., via WhatsApp)
- Players join with the room ID to see live updates
- Config placeholder in `App.Sync.init()` — replace `YOUR_API_KEY`, `YOUR_DATABASE_URL`, `YOUR_PROJECT_ID`
- Not required for local single-device use

## Data Model

Session state stored in `localStorage` as `badminton_session_YYYY-MM-DD`:

```
{
  version: 1,
  date: "2026-03-10",
  dayName: "Monday",
  players: { [id]: Player },
  waitingQueue: [playerId, ...],
  courts: { [id]: Court },
  matches: { [id]: Match },
  settings: { courtNumbers, syncEnabled, syncRoomId },
  nextPlayerNumber: 1,
  isAdmin: true
}
```

**Player:** `{ id, number, name, present, gamesPlayed, lastGameEndTime, queueEntryTime, partnerHistory, opponentHistory, wishedPartner, wishFulfilled }`

**Court:** `{ id, displayNumber, active, occupied, currentMatch, gameStartTime }`

**Match:** `{ id, startTime, endTime, courtId, teamA: [id,id], teamB: [id,id], score, status }`

## Future Ideas

- Score tracking per game
- Player statistics dashboard (win rate, avg game time)
- Session history across days
- PWA support (offline, installable)
- QR code for room join link
- Player self-check-in via phone
