#!/usr/bin/env node
// Shuffle mode session simulation
// Usage: node scripts/simulation-shuffle.js [--courts N] [--players N] [--rounds N] [--lang pl|en]
// Late arrivals are hardcoded: player 16 at 5min, player 17 at 10min
// Generates simulation-shuffle-report.html

var path = require('path');
var fs = require('fs');
var { loadApp } = require('../test/helpers');

// --- Parse CLI args ---
var args = process.argv.slice(2);
function getArg(name, def) {
  var idx = args.indexOf('--' + name);
  if (idx === -1) return def;
  var val = parseInt(args[idx + 1], 10);
  return isNaN(val) ? def : val;
}

var NUM_COURTS = getArg('courts', 4);
var NUM_PLAYERS = getArg('players', 17);
var NUM_ROUNDS = getArg('rounds', 10);

var langIdx = args.indexOf('--lang');
var LANG = (langIdx !== -1 && args[langIdx + 1]) ? args[langIdx + 1] : 'en';

var T = {
  en: {
    title: 'Shuffle Mode Session Report',
    simulation: 'Simulation (Shuffle)',
    players: 'Players',
    matches: 'Matches',
    courts: 'Courts',
    rounds: 'Rounds',
    lateArrival: 'late arrival',
    lateArrivals: 'late arrivals',
    afterMin: 'after',
    min: 'min',
    leaderboard: 'Player Leaderboard',
    player: 'Player',
    games: 'Games',
    matchLog: 'Match Log',
    batch: 'Batch',
    court: 'Court',
    teamA: 'Team A',
    score: 'Score',
    teamB: 'Team B',
    pairStats: 'Pair Statistics',
    pair: 'Pair',
    played: 'Played',
    wins: 'Wins',
    distribution: 'Games Distribution',
    bar: 'Bar',
    schedule: 'Generated Schedule',
    status: 'Status',
    game: 'Game',
    reshuffled: 'reshuffled after late arrival'
  },
  pl: {
    title: 'Raport sesji (tryb Shuffle)',
    simulation: 'Symulacja (Shuffle)',
    players: 'Graczy',
    matches: 'Mecze',
    courts: 'Korty',
    rounds: 'Rundy',
    lateArrival: 'spóźniony',
    lateArrivals: 'spóźnionych',
    afterMin: 'po',
    min: 'min',
    leaderboard: 'Ranking graczy',
    player: 'Gracz',
    games: 'Gry',
    matchLog: 'Dziennik meczów',
    batch: 'Partia',
    court: 'Kort',
    teamA: 'Drużyna A',
    score: 'Wynik',
    teamB: 'Drużyna B',
    pairStats: 'Statystyki par',
    pair: 'Para',
    played: 'Gry',
    wins: 'Wygr.',
    distribution: 'Rozkład gier',
    bar: 'Wykres',
    schedule: 'Wygenerowany harmonogram',
    status: 'Status',
    game: 'Gra',
    reshuffled: 'przetasowanie po spóźnieniu'
  }
};

function t(key) { return (T[LANG] || T.en)[key] || T.en[key]; }

if (NUM_PLAYERS < 4) { console.error('Need at least 4 players'); process.exit(1); }
if (NUM_COURTS < 1) { console.error('Need at least 1 court'); process.exit(1); }

var App = loadApp();

// Mock Date.now to control time
var _fakeNow = Date.now();
var _realDateNow = Date.now;
Date.now = function() { return _fakeNow; };
function advanceMinutes(m) { _fakeNow += m * 60 * 1000; }
function advanceSeconds(s) { _fakeNow += s * 1000; }

// --- Setup ---
localStorage.clear();
App.Session.create('Shuffle Simulation', 'shuffle');
var courtNumbers = [];
for (var cn = 1; cn <= NUM_COURTS; cn++) courtNumbers.push(cn);
App.Session.initCourts(courtNumbers);

var POOL = [
  'Aleksy', 'Bartek', 'Celina', 'Darek', 'Ewa',
  'Filip', 'Gosia', 'Henryk', 'Iza', 'Jakub',
  'Kasia', 'Leon', 'Magda', 'Norbert', 'Ola',
  'Patryk', 'Renata', 'Szymon', 'Teresa', 'Urszula',
  'Wiktor', 'Xena', 'Yola', 'Zenon', 'Adam',
  'Beata', 'Cyprian', 'Dorota', 'Emil', 'Faustyna'
];

var NAMES = POOL.slice(0, NUM_PLAYERS);
var NUM_ON_TIME = NUM_PLAYERS - 2; // 2 late players

// Add all players
var playerIds = NAMES.map(function(name) {
  return App.Players.add(name);
});

// Mark on-time players present (first 15)
for (var i = 0; i < NUM_ON_TIME; i++) {
  App.Players.markPresent(playerIds[i]);
  advanceSeconds(10);
}

var courtIds = courtNumbers.map(function(n) { return 'c_' + n; });
var matchLog = [];
var batchNum = 0;
var lateArrivals = [];
var late1Arrived = false;
var late2Arrived = false;
var sessionStartTime = _fakeNow;
var events = []; // track events for the report

// --- Initial schedule generation ---
// Generate initial batch: 2x courts worth of games
var initialCount = NUM_COURTS * 2;
App.Shuffle.generate(initialCount);
App.Shuffle.autoAssignAll();
events.push({ time: 0, text: 'Generated initial schedule: ' + initialCount + ' games for ' + NUM_ON_TIME + ' players' });

// Start all ready games on courts
function startReadyGames() {
  courtIds.forEach(function(courtId) {
    var court = App.state.courts[courtId];
    if (court.occupied) return;
    // Find ready entry for this court
    var entry = App.state.schedule.find(function(e) {
      return e.courtId === courtId && e.status === 'ready';
    });
    if (!entry) return;
    App.Courts.startGame(courtId, entry.teamA, entry.teamB);
  });
}

function finishAllCourts() {
  courtIds.forEach(function(courtId) {
    var court = App.state.courts[courtId];
    if (!court.occupied) return;

    var winScore = 21;
    var loseScore = Math.floor(Math.random() * 16) + 5;
    var scoreStr = winScore + '-' + loseScore;
    if (Math.random() < 0.5) scoreStr = loseScore + '-' + winScore;

    var match = App.state.matches[court.currentMatch];
    matchLog.push({
      batch: batchNum,
      courtId: courtId,
      courtNum: court.displayNumber,
      teamA: match.teamA.slice(),
      teamB: match.teamB.slice(),
      score: scoreStr,
      startTime: match.startTime
    });

    App.Courts.finishGame(courtId, scoreStr);
    advanceSeconds(30);
  });
}

function playerName(id) {
  return App.state.players[id] ? App.state.players[id].name : id;
}

// --- Run simulation rounds ---
for (var r = 0; r < NUM_ROUNDS; r++) {
  batchNum++;

  // Check for late arrivals based on elapsed time
  var elapsedMin = (_fakeNow - sessionStartTime) / 60000;

  // Late player 1 arrives at 5 min
  if (!late1Arrived && elapsedMin >= 5) {
    var lateIdx1 = NUM_ON_TIME;
    App.Players.markPresent(playerIds[lateIdx1]);
    late1Arrived = true;
    lateArrivals.push({ name: NAMES[lateIdx1], afterMin: 5 });
    events.push({ time: Math.round(elapsedMin), text: NAMES[lateIdx1] + ' arrived (5 min late) — reshuffling pending games' });
    // Reshuffle to include the new player
    App.Shuffle.reshuffle();
    App.Shuffle.autoAssignAll();
  }

  // Late player 2 arrives at 10 min
  if (!late2Arrived && elapsedMin >= 10) {
    var lateIdx2 = NUM_ON_TIME + 1;
    App.Players.markPresent(playerIds[lateIdx2]);
    late2Arrived = true;
    lateArrivals.push({ name: NAMES[lateIdx2], afterMin: 10 });
    events.push({ time: Math.round(elapsedMin), text: NAMES[lateIdx2] + ' arrived (10 min late) — reshuffling pending games' });
    // Reshuffle to include the new player
    App.Shuffle.reshuffle();
    App.Shuffle.autoAssignAll();
  }

  // Start ready games
  startReadyGames();

  // Simulate game time (8-15 minutes)
  advanceMinutes(8 + Math.floor(Math.random() * 8));

  // Finish all courts
  finishAllCourts();

  // After finishing, autoAssignAll already runs via finishGame
  // But also generate more if schedule is getting low
  var pending = App.state.schedule.filter(function(e) {
    return e.status === 'pending' || e.status === 'ready';
  });
  if (pending.length < NUM_COURTS) {
    App.Shuffle.generate(NUM_COURTS);
    App.Shuffle.autoAssignAll();
    events.push({ time: Math.round((_fakeNow - sessionStartTime) / 60000), text: 'Generated ' + NUM_COURTS + ' more games (batch ' + batchNum + ')' });
  }
}

// Mark any late players who still haven't arrived
if (!late1Arrived) {
  App.Players.markPresent(playerIds[NUM_ON_TIME]);
  lateArrivals.push({ name: NAMES[NUM_ON_TIME], afterMin: 'end' });
}
if (!late2Arrived) {
  App.Players.markPresent(playerIds[NUM_ON_TIME + 1]);
  lateArrivals.push({ name: NAMES[NUM_ON_TIME + 1], afterMin: 'end' });
}

// --- Collect stats ---
var players = Object.values(App.state.players).filter(function(p) { return p.present; });
players.sort(function(a, b) {
  if (b.wins !== a.wins) return b.wins - a.wins;
  var aRate = a.gamesPlayed ? a.wins / a.gamesPlayed : 0;
  var bRate = b.gamesPlayed ? b.wins / b.gamesPlayed : 0;
  if (bRate !== aRate) return bRate - aRate;
  var aDiff = a.pointsScored - a.pointsConceded;
  var bDiff = b.pointsScored - b.pointsConceded;
  return bDiff - aDiff;
});

var finishedMatches = App.Matches.getFinished();

function pairKey(id1, id2) {
  var n1 = playerName(id1), n2 = playerName(id2);
  return n1 < n2 ? n1 + ' & ' + n2 : n2 + ' & ' + n1;
}

// Build pair matrix
var pairMap = {};
finishedMatches.forEach(function(m) {
  var scoreParts = m.score ? m.score.split('-').map(Number) : [0, 0];
  var aWon = scoreParts[0] > scoreParts[1];

  if (m.teamA.length === 2) {
    var kA = pairKey(m.teamA[0], m.teamA[1]);
    if (!pairMap[kA]) pairMap[kA] = { played: 0, wins: 0 };
    pairMap[kA].played++;
    if (aWon) pairMap[kA].wins++;
  }

  if (m.teamB.length === 2) {
    var kB = pairKey(m.teamB[0], m.teamB[1]);
    if (!pairMap[kB]) pairMap[kB] = { played: 0, wins: 0 };
    pairMap[kB].played++;
    if (!aWon) pairMap[kB].wins++;
  }
});

var pairs = Object.keys(pairMap).map(function(k) {
  return { pair: k, played: pairMap[k].played, wins: pairMap[k].wins };
});
pairs.sort(function(a, b) {
  if (b.played !== a.played) return b.played - a.played;
  return b.wins - a.wins;
});

// Build late arrivals lookup
var lateMap = {};
lateArrivals.forEach(function(la) { lateMap[la.name] = la.afterMin; });

// --- Generate HTML report ---
var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
html += '<title>Badmixton Flow — ' + t('title') + '</title>';
html += '<style>';
html += 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; color: #1e293b; }';
html += 'h1 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 8px; }';
html += 'h2 { color: #334155; margin-top: 32px; }';
html += 'table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; font-size: 14px; }';
html += 'th { background: #7c3aed; color: white; padding: 8px 10px; text-align: left; }';
html += 'td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }';
html += 'tr:nth-child(even) { background: #f8fafc; }';
html += 'tr:hover { background: #ede9fe; }';
html += '.late { color: #b45309; font-style: italic; }';
html += '.summary { display: flex; gap: 20px; flex-wrap: wrap; margin: 16px 0; }';
html += '.stat-card { background: #f5f3ff; border-radius: 8px; padding: 12px 20px; min-width: 120px; }';
html += '.stat-card .val { font-size: 28px; font-weight: 700; color: #7c3aed; }';
html += '.stat-card .label { font-size: 12px; color: #64748b; }';
html += '.win { color: #16a34a; font-weight: 600; }';
html += '.loss { color: #dc2626; }';
html += '.params { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 16px; font-size: 13px; color: #64748b; margin: 8px 0 16px; }';
html += '.event-log { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 10px 16px; font-size: 13px; color: #92400e; margin: 8px 0 16px; }';
html += '.event-log div { margin: 2px 0; }';
html += '.event-log .time { font-weight: 600; color: #b45309; }';
html += '@media print { body { padding: 0; } h1 { font-size: 20px; } table { font-size: 12px; } .stat-card .val { font-size: 22px; } }';
html += '@page { margin: 15mm; }';
html += '</style></head><body>';

html += '<h1>Badmixton Flow — ' + t('title') + '</h1>';

// Params
html += '<div class="params">' + t('simulation') + ': ' + NUM_PLAYERS + ' ' + t('players').toLowerCase() + ', ' + NUM_COURTS + ' ' + t('courts').toLowerCase() + ', ' + NUM_ROUNDS + ' ' + t('rounds').toLowerCase() + ', 2 ' + t('lateArrivals');
html += ' (' + lateArrivals.map(function(la) { return la.name + ' ' + t('afterMin') + ' ' + la.afterMin + ' ' + t('min'); }).join(', ') + ')';
html += '</div>';

// Event log
if (events.length > 0) {
  html += '<div class="event-log">';
  events.forEach(function(e) {
    html += '<div><span class="time">[' + e.time + ' min]</span> ' + e.text + '</div>';
  });
  html += '</div>';
}

// Summary cards
html += '<div class="summary">';
html += '<div class="stat-card"><div class="val">' + players.length + '</div><div class="label">' + t('players') + '</div></div>';
html += '<div class="stat-card"><div class="val">' + finishedMatches.length + '</div><div class="label">' + t('matches') + '</div></div>';
html += '<div class="stat-card"><div class="val">' + NUM_COURTS + '</div><div class="label">' + t('courts') + '</div></div>';
html += '<div class="stat-card"><div class="val">' + batchNum + '</div><div class="label">' + t('rounds') + '</div></div>';
html += '</div>';

// Player leaderboard
html += '<h2>' + t('leaderboard') + '</h2>';
html += '<table><tr><th>#</th><th>' + t('player') + '</th><th>' + t('games') + '</th><th>W</th><th>L</th><th>Win%</th><th>Pts+</th><th>Pts-</th><th>Diff</th></tr>';
players.forEach(function(p, idx) {
  var rate = p.gamesPlayed ? Math.round(100 * p.wins / p.gamesPlayed) : 0;
  var diff = p.pointsScored - p.pointsConceded;
  var diffStr = diff > 0 ? '+' + diff : '' + diff;
  var lateNote = lateMap[p.name] !== undefined ? ' <span class="late">(' + t('afterMin') + ' ' + lateMap[p.name] + ' ' + t('min') + ')</span>' : '';
  html += '<tr>';
  html += '<td>' + (idx + 1) + '</td>';
  html += '<td>' + p.name + lateNote + '</td>';
  html += '<td>' + p.gamesPlayed + '</td>';
  html += '<td class="win">' + p.wins + '</td>';
  html += '<td class="loss">' + p.losses + '</td>';
  html += '<td>' + rate + '%</td>';
  html += '<td>' + p.pointsScored + '</td>';
  html += '<td>' + p.pointsConceded + '</td>';
  html += '<td>' + diffStr + '</td>';
  html += '</tr>';
});
html += '</table>';

// Match log
html += '<h2>' + t('matchLog') + '</h2>';
html += '<table><tr><th>' + t('batch') + '</th><th>' + t('court') + '</th><th>' + t('teamA') + '</th><th>' + t('score') + '</th><th>' + t('teamB') + '</th></tr>';
var prevBatch = 0;
matchLog.forEach(function(m) {
  var nameA = m.teamA.map(playerName).join(', ');
  var nameB = m.teamB.map(playerName).join(', ');
  var parts = m.score.split('-').map(Number);
  var aWon = parts[0] > parts[1];
  var scoreDisplay = aWon
    ? '<span class="win">' + parts[0] + '</span>-' + parts[1]
    : parts[0] + '-<span class="win">' + parts[1] + '</span>';
  var batchBorder = m.batch !== prevBatch && prevBatch !== 0 ? ' style="border-top:3px solid #cbd5e1"' : '';
  prevBatch = m.batch;
  html += '<tr' + batchBorder + '>';
  html += '<td>' + m.batch + '</td>';
  html += '<td>' + t('court') + ' ' + m.courtNum + '</td>';
  html += '<td' + (aWon ? ' class="win"' : '') + '>' + nameA + '</td>';
  html += '<td>' + scoreDisplay + '</td>';
  html += '<td' + (!aWon ? ' class="win"' : '') + '>' + nameB + '</td>';
  html += '</tr>';
});
html += '</table>';

// Pair stats
html += '<h2>' + t('pairStats') + '</h2>';
html += '<table><tr><th>' + t('pair') + '</th><th>' + t('played') + '</th><th>' + t('wins') + '</th><th>Win%</th></tr>';
pairs.forEach(function(p) {
  var rate = p.played ? Math.round(100 * p.wins / p.played) : 0;
  html += '<tr>';
  html += '<td>' + p.pair + '</td>';
  html += '<td>' + p.played + '</td>';
  html += '<td>' + p.wins + '</td>';
  html += '<td>' + rate + '%</td>';
  html += '</tr>';
});
html += '</table>';

// Games per player distribution
html += '<h2>' + t('distribution') + '</h2>';
html += '<table><tr><th>' + t('player') + '</th><th>' + t('games') + '</th><th>' + t('bar') + '</th></tr>';
var maxGames = Math.max.apply(null, players.map(function(p) { return p.gamesPlayed; }));
players.sort(function(a, b) { return b.gamesPlayed - a.gamesPlayed; });
players.forEach(function(p) {
  var pct = maxGames ? Math.round(100 * p.gamesPlayed / maxGames) : 0;
  var lateNote = lateMap[p.name] !== undefined ? ' *' : '';
  html += '<tr>';
  html += '<td>' + p.name + lateNote + '</td>';
  html += '<td>' + p.gamesPlayed + '</td>';
  html += '<td><div style="background:#7c3aed;height:14px;border-radius:3px;width:' + pct + '%;min-width:2px"></div></td>';
  html += '</tr>';
});
html += '</table>';

html += '<p style="color:#94a3b8;font-size:11px;margin-top:32px">Generated by Badmixton Flow shuffle simulation &middot; ' + new Date().toISOString().split('T')[0] + '</p>';
html += '</body></html>';

var outIdx = args.indexOf('--output');
var outFile = (outIdx !== -1 && args[outIdx + 1]) ? args[outIdx + 1] : 'simulation-shuffle-report.html';
var outPath = path.resolve(outFile);
fs.writeFileSync(outPath, html);

// Restore Date.now
Date.now = _realDateNow;

console.log('Shuffle simulation complete!');
console.log('  Players: ' + players.length + ' (' + NUM_ON_TIME + ' on time, 2 late)');
console.log('  Late:    ' + lateArrivals.map(function(la) { return la.name + ' (+' + la.afterMin + ' min)'; }).join(', '));
console.log('  Courts:  ' + NUM_COURTS);
console.log('  Matches: ' + finishedMatches.length);
console.log('  Rounds:  ' + batchNum);
console.log('  Pairs:   ' + pairs.length);
console.log('  Report:  ' + outPath);
