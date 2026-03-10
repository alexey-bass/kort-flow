# Badminton 2x2 — Development Plan

## Phase 1: MVP (DONE)

- [x] Three-file structure: index.html, styles.css, app.js
- [x] Pure HTML/CSS/JS, no frameworks, no build tools
- [x] localStorage persistence (survives page refresh)
- [x] Player management: add, remove, mark present/absent
- [x] Living queue: arrival numbering, auto-requeue after game
- [x] Court management: 1-5 configurable courts
- [x] One-tap game start/finish per court (all 4 players update)
- [x] Auto-suggestion algorithm (queue position + games balance + wishes)
- [x] Team split scoring (pair repeats, opponent repeats, wish bonus)
- [x] Manual player selection for courts
- [x] Match history with court/player filters
- [x] Undo last match
- [x] Two UI modes: Board (player-facing) and Management (admin)
- [x] Mobile-first responsive design (phone, 12" tablet, desktop)
- [x] Drag-and-drop queue reorder (mouse + touch)
- [x] Firebase Realtime Database sync (room create/join)
- [x] JSON export/import
- [x] Session create/reset

## Phase 2: i18n (DONE)

- [x] Polish language (default)
- [x] English language
- [x] Language switcher in header with flag buttons
- [x] `data-i18n` attributes for static HTML text
- [x] `App.t()` function for dynamic strings
- [x] Language preference saved in localStorage
- [x] All Russian comments in code replaced with English

## Phase 3: Polish & UX Improvements

- [ ] Fix session date display to use localized day names (currently shows old saved Russian day name for existing sessions)
- [ ] Add "mark all present" bulk action button
- [ ] Add player search/filter on Players tab
- [ ] Show game count next to player name on Board queue
- [ ] Add confirmation toast with undo option (instead of modal confirm)
- [ ] Improve touch drag-and-drop smoothness
- [ ] Add haptic feedback on mobile (vibrate API)
- [ ] Add session name display on Board tab

## Phase 4: Score Tracking

- [ ] Optional score input on game finish (e.g., 21-15)
- [ ] Score display in match history
- [ ] Win/loss tracking per player
- [ ] Player stats: win rate, total points scored/conceded
- [ ] Leaderboard view

## Phase 5: Advanced Statistics

- [ ] Player statistics dashboard (games played, avg game time, favorite partners)
- [ ] Head-to-head stats between players
- [ ] Session comparison across days
- [ ] Charts/graphs for trends
- [ ] "Best pair" and "most common opponents" insights

## Phase 6: PWA & Offline

- [ ] Service Worker for offline support
- [ ] Web App Manifest (installable on home screen)
- [ ] Offline-first with sync on reconnect
- [ ] App icon and splash screen

## Phase 7: Multi-Device Experience

- [ ] QR code generation for room join link
- [ ] Player self-check-in via phone (scan QR, tap "I'm here")
- [ ] Real-time board view for spectators
- [ ] Push notifications (game starting, your turn coming up)
- [ ] WhatsApp share button for room link

## Phase 8: Advanced Features

- [ ] Tournament mode (round-robin, knockout brackets)
- [ ] Skill rating system (ELO-like)
- [ ] Automatic court assignment based on skill balance
- [ ] Rest time tracking (minimum break between games)
- [ ] Custom game duration timer with alerts
- [ ] Multiple session templates (Friday evening, Sunday morning, etc.)
- [ ] Admin password protection
- [ ] Data export to CSV/Excel
