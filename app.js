/* ============================================================
   Badminton 2x2 — Queue Manager
   Main application logic
   ============================================================ */

// Global application object
var App = {};

// ============================================================
// I18N — Internationalization
// ============================================================
App.i18n = {
  currentLang: 'pl',
  STORAGE_KEY: 'badminton_lang',

  translations: {
    pl: {
      // Tabs
      tabBoard: 'Tablica',
      tabToday: 'Dzisiaj',
      tabPlayers: 'Gracze',
      tabQueue: 'Kolejka',
      tabCourts: 'Korty',
      tabHistory: 'Historia',

      // Queue label
      queue: 'Kolejka',

      // Dashboard stats
      statPresent: 'Obecni',
      statPlaying: 'Grają',
      statInQueue: 'W kolejce',
      statCourtsOccupied: 'Korty zajęte',
      statGamesPlayed: 'Rozegranych',

      // Session settings
      sessionSettings: 'Ustawienia sesji',
      sessionNameLabel: 'Nazwa sesji',
      dayFriday: 'Piątek',
      daySunday: 'Niedziela',
      sessionTraining: 'Trening',
      sessionOther: 'Inne',
      courtNumbersLabel: 'Numery kortów',
      applyCourts: 'Zastosuj korty',

      // Sync
      syncFirebase: 'Synchronizacja Firebase',
      roomIdLabel: 'ID pokoju',
      createRoom: 'Utwórz pokój',
      joinRoom: 'Dołącz',
      disconnect: 'Rozłącz',

      // Actions
      actions: 'Działania',
      newSession: 'Nowa sesja',
      resetDay: 'Resetuj dzień',
      exportJSON: 'Eksport JSON',
      importJSON: 'Import JSON',

      // Players
      addPlayer: 'Dodaj',
      playerNamePlaceholder: 'Imię gracza',
      arrived: 'Przyszedł',
      left: 'Wyszedł',
      toQueue: 'Do kolejki',
      fromQueue: 'Z kolejki',
      gamesN: ' gier',
      court: 'Kort ',
      queuePos: 'Kolejka #',
      absent: 'Nieobecny',
      presentStatus: 'Obecny',
      pairWith: 'Para z ',
      wishFulfilled: ' (spełnione)',
      addPlayersHint: 'Dodaj graczy',
      cantDeletePlaying: 'Nie można usunąć gracza podczas gry',
      playerOnCourt: 'Gracz jest na korcie',
      playerAdded: ' dodany',
      wishPlayWith: 'Chcę grać z...',

      // Queue
      inQueue: 'W kolejce',
      queueEmpty: 'Kolejka pusta',

      // Courts
      finish: 'Zakończ',
      cancel: 'Anuluj',
      courtFree: 'Kort wolny',
      suggestLineup: 'Zaproponuj skład',
      selectManually: 'Wybierz ręcznie',
      courtOccupied: 'Kort zajęty',
      playersDuplicate: 'Gracze nie mogą się powtarzać',
      alreadyOnCourt: ' już jest na innym korcie',
      gameStartedOn: 'Gra rozpoczęta na korcie ',
      noActiveGame: 'Brak aktywnej gry na korcie',
      gameFinishedOn: 'Gra na korcie ',
      gameFinishedSuffix: ' zakończona',
      gameCancelled: 'Gra anulowana, gracze wrócili do kolejki',

      // Board
      boardFinish: 'Zakończ',
      boardFree: 'Wolny',
      boardSuggest: 'Zaproponuj',

      // History
      allCourts: 'Wszystkie korty',
      allPlayers: 'Wszyscy gracze',
      undoLastMatch: 'Cofnij ostatni',
      noMatches: 'Brak meczów',
      noFinishedMatches: 'Brak zakończonych meczów',
      lastMatchUndone: 'Ostatni mecz cofnięty',

      // Suggest
      notEnoughPlayers: 'Za mało graczy w kolejce (min. 4, jest ',
      notEnoughPlayersSuffix: ')',
      selectedPlayers: 'Wybrani: ',
      firstInQueue: 'Pierwsi w kolejce',
      wantsPlayWith: 'chce grać z ',
      alreadyPaired: ' już w parze ',
      timesN: ' razy',
      wishLabel: 'Życzenie: ',

      // Suggest modal
      suggestionFor: 'Propozycja dla kortu ',
      teamSplit: 'Podział na zespoły:',
      startGame: 'Rozpocznij grę',
      cancelAction: 'Anuluj',

      // Player select modal
      selectPlayersFor: 'Wybór graczy — kort ',
      select4Players: 'Wybierz 4 graczy:',
      inQueueLabel: 'w kolejce',
      splitHeading: 'Podział:',
      already4Selected: 'Już wybrano 4 graczy',

      // Wish dialog
      wishFor: 'Życzenie: ',
      selectPartner: 'Wybierz partnera do gry:',
      noWish: 'Bez życzenia',
      closeBtn: 'Zamknij',
      wishSet: 'Życzenie ustawione',
      wishRemoved: 'Życzenie usunięte',

      // Confirm dialog
      yes: 'Tak',
      no: 'Nie',

      // Session actions
      confirmNewSession: 'Utworzyć nową sesję? Obecne dane zostaną zapisane.',
      newSessionCreated: 'Nowa sesja utworzona',
      confirmResetDay: 'Zresetować dane za dzisiaj?',
      dayReset: 'Dzień zresetowany',

      // Export/Import
      exportDone: 'Eksport zakończony',
      importDone: 'Import zakończony',
      invalidFile: 'Nieprawidłowy format pliku',
      fileReadError: 'Błąd odczytu pliku',

      // Courts settings
      enterCourtNumbers: 'Wprowadź numery kortów',
      maxCourts: 'Maksymalnie 5 kortów',
      courtsUpdated: 'Korty zaktualizowane: ',

      // Sync messages
      firebaseNotLoaded: 'Firebase SDK nie załadowane. Sprawdź połączenie.',
      configureFirebase: 'Skonfiguruj Firebase w app.js (sekcja App.Sync.init)',
      roomCreated: 'Pokój utworzony: ',
      enterRoomId: 'Wprowadź ID pokoju',
      connectedToRoom: 'Połączono z pokojem: ',
      disconnectedMsg: 'Rozłączono',
      syncDisconnected: 'Rozłączono z synchronizacją',

      // Confirm actions
      confirmCancelGame: 'Anulować grę? Gracze wrócą do kolejki.',
      confirmDeletePlayer: 'Usunąć gracza ',
      confirmDeleteSuffix: '?',
      confirmUndoMatch: 'Cofnąć ostatni zakończony mecz?',

      // Day names
      days: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota']
    },

    en: {
      // Tabs
      tabBoard: 'Board',
      tabToday: 'Today',
      tabPlayers: 'Players',
      tabQueue: 'Queue',
      tabCourts: 'Courts',
      tabHistory: 'History',

      // Queue label
      queue: 'Queue',

      // Dashboard stats
      statPresent: 'Present',
      statPlaying: 'Playing',
      statInQueue: 'In queue',
      statCourtsOccupied: 'Courts busy',
      statGamesPlayed: 'Games played',

      // Session settings
      sessionSettings: 'Session settings',
      sessionNameLabel: 'Session name',
      dayFriday: 'Friday',
      daySunday: 'Sunday',
      sessionTraining: 'Training',
      sessionOther: 'Other',
      courtNumbersLabel: 'Court numbers',
      applyCourts: 'Apply courts',

      // Sync
      syncFirebase: 'Firebase Sync',
      roomIdLabel: 'Room ID',
      createRoom: 'Create room',
      joinRoom: 'Join',
      disconnect: 'Disconnect',

      // Actions
      actions: 'Actions',
      newSession: 'New session',
      resetDay: 'Reset day',
      exportJSON: 'Export JSON',
      importJSON: 'Import JSON',

      // Players
      addPlayer: 'Add',
      playerNamePlaceholder: 'Player name',
      arrived: 'Arrived',
      left: 'Left',
      toQueue: 'To queue',
      fromQueue: 'From queue',
      gamesN: ' games',
      court: 'Court ',
      queuePos: 'Queue #',
      absent: 'Absent',
      presentStatus: 'Present',
      pairWith: 'Pair with ',
      wishFulfilled: ' (done)',
      addPlayersHint: 'Add players',
      cantDeletePlaying: 'Cannot delete player during game',
      playerOnCourt: 'Player is on court',
      playerAdded: ' added',
      wishPlayWith: 'Want to play with...',

      // Queue
      inQueue: 'In queue',
      queueEmpty: 'Queue empty',

      // Courts
      finish: 'Finish',
      cancel: 'Cancel',
      courtFree: 'Court free',
      suggestLineup: 'Suggest lineup',
      selectManually: 'Select manually',
      courtOccupied: 'Court occupied',
      playersDuplicate: 'Players must be unique',
      alreadyOnCourt: ' is already on another court',
      gameStartedOn: 'Game started on court ',
      noActiveGame: 'No active game on court',
      gameFinishedOn: 'Game on court ',
      gameFinishedSuffix: ' finished',
      gameCancelled: 'Game cancelled, players returned to queue',

      // Board
      boardFinish: 'Finish',
      boardFree: 'Free',
      boardSuggest: 'Suggest',

      // History
      allCourts: 'All courts',
      allPlayers: 'All players',
      undoLastMatch: 'Undo last',
      noMatches: 'No matches',
      noFinishedMatches: 'No finished matches',
      lastMatchUndone: 'Last match undone',

      // Suggest
      notEnoughPlayers: 'Not enough players in queue (need 4, have ',
      notEnoughPlayersSuffix: ')',
      selectedPlayers: 'Selected: ',
      firstInQueue: 'First in queue',
      wantsPlayWith: 'wants to play with ',
      alreadyPaired: ' already paired ',
      timesN: ' times',
      wishLabel: 'Wish: ',

      // Suggest modal
      suggestionFor: 'Suggestion for court ',
      teamSplit: 'Team split:',
      startGame: 'Start game',
      cancelAction: 'Cancel',

      // Player select modal
      selectPlayersFor: 'Select players — court ',
      select4Players: 'Select 4 players:',
      inQueueLabel: 'in queue',
      splitHeading: 'Split:',
      already4Selected: 'Already selected 4 players',

      // Wish dialog
      wishFor: 'Wish: ',
      selectPartner: 'Select partner:',
      noWish: 'No preference',
      closeBtn: 'Close',
      wishSet: 'Wish set',
      wishRemoved: 'Wish removed',

      // Confirm dialog
      yes: 'Yes',
      no: 'No',

      // Session actions
      confirmNewSession: 'Create new session? Current data will be saved.',
      newSessionCreated: 'New session created',
      confirmResetDay: 'Reset today\'s data?',
      dayReset: 'Day reset',

      // Export/Import
      exportDone: 'Export complete',
      importDone: 'Import complete',
      invalidFile: 'Invalid file format',
      fileReadError: 'File read error',

      // Courts settings
      enterCourtNumbers: 'Enter court numbers',
      maxCourts: 'Maximum 5 courts',
      courtsUpdated: 'Courts updated: ',

      // Sync messages
      firebaseNotLoaded: 'Firebase SDK not loaded. Check your connection.',
      configureFirebase: 'Configure Firebase in app.js (App.Sync.init section)',
      roomCreated: 'Room created: ',
      enterRoomId: 'Enter room ID',
      connectedToRoom: 'Connected to room: ',
      disconnectedMsg: 'Disconnected',
      syncDisconnected: 'Disconnected from sync',

      // Confirm actions
      confirmCancelGame: 'Cancel game? Players will return to queue.',
      confirmDeletePlayer: 'Delete player ',
      confirmDeleteSuffix: '?',
      confirmUndoMatch: 'Undo last finished match?',

      // Day names
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
  },

  // Get translation by key
  t: function(key) {
    var dict = this.translations[this.currentLang] || this.translations.pl;
    return dict[key] !== undefined ? dict[key] : key;
  },

  // Apply translations to DOM elements with data-i18n attributes
  apply: function() {
    var self = this;

    // data-i18n — set textContent
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      var val = self.t(key);
      if (val !== key) el.textContent = val;
    });

    // data-i18n-placeholder — set placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-placeholder');
      var val = self.t(key);
      if (val !== key) el.placeholder = val;
    });

    // data-i18n-opt — set option text
    document.querySelectorAll('[data-i18n-opt]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-opt');
      var val = self.t(key);
      if (val !== key) el.textContent = val;
    });
  },

  // Set language and re-render
  setLang: function(lang) {
    if (!this.translations[lang]) return;
    this.currentLang = lang;
    localStorage.setItem(this.STORAGE_KEY, lang);

    // Update active state on buttons
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    this.apply();

    // Re-render dynamic content
    if (App.state) {
      App.UI.renderAll();
    }
  },

  // Initialize: load saved language, bind switcher
  init: function() {
    var saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved && this.translations[saved]) {
      this.currentLang = saved;
    }

    // Set active button
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.lang === App.i18n.currentLang);
    });

    // Bind switcher clicks
    var switcher = document.getElementById('langSwitcher');
    if (switcher) {
      switcher.addEventListener('click', function(e) {
        var btn = e.target.closest('.lang-btn');
        if (!btn) return;
        App.i18n.setLang(btn.dataset.lang);
      });
    }

    this.apply();
  }
};

// Shortcut for translation
App.t = function(key) {
  return App.i18n.t(key);
};

// ============================================================
// UTILS — Helper functions
// ============================================================
App.Utils = {
  generateId: function(prefix) {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  },

  formatTime: function(ms) {
    if (!ms || ms <= 0) return '0:00';
    var totalSec = Math.floor(ms / 1000);
    var min = Math.floor(totalSec / 60);
    var sec = totalSec % 60;
    return min + ':' + (sec < 10 ? '0' : '') + sec;
  },

  formatDate: function(date) {
    var d = date instanceof Date ? date : new Date(date);
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var yyyy = d.getFullYear();
    return dd + '.' + mm + '.' + yyyy;
  },

  getDayName: function(date) {
    var days = App.t('days');
    var d = date instanceof Date ? date : new Date(date);
    return days[d.getDay()];
  },

  getISODate: function(date) {
    var d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  },

  formatTimestamp: function(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  }
};

// ============================================================
// STORAGE — localStorage + export/import
// ============================================================
App.Storage = {
  SESSION_PREFIX: 'badminton_session_',
  SETTINGS_KEY: 'badminton_settings',
  INDEX_KEY: 'badminton_sessions_index',

  save: function() {
    if (!App.state) return;
    App.state.lastModified = Date.now();
    var key = this.SESSION_PREFIX + App.state.date;
    try {
      localStorage.setItem(key, JSON.stringify(App.state));
      // Update session index
      var index = this.getIndex();
      if (index.indexOf(App.state.date) === -1) {
        index.unshift(App.state.date);
        localStorage.setItem(this.INDEX_KEY, JSON.stringify(index));
      }
    } catch (e) {
      console.error('Save error:', e);
    }
  },

  load: function(dateStr) {
    var key = this.SESSION_PREFIX + (dateStr || App.Utils.getISODate(new Date()));
    var data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Load error:', e);
      }
    }
    return null;
  },

  getIndex: function() {
    try {
      return JSON.parse(localStorage.getItem(this.INDEX_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  getSettings: function() {
    try {
      return JSON.parse(localStorage.getItem(this.SETTINGS_KEY)) || {};
    } catch (e) {
      return {};
    }
  },

  saveSettings: function(settings) {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  },

  exportJSON: function() {
    var blob = new Blob([JSON.stringify(App.state, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'badminton_' + App.state.date + '.json';
    a.click();
    URL.revokeObjectURL(url);
    App.UI.showToast(App.t('exportDone'));
  },

  importJSON: function(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        if (data.version && data.players && data.courts) {
          App.state = data;
          App.save();
          App.UI.renderAll();
          App.UI.showToast(App.t('importDone'));
        } else {
          App.UI.showToast(App.t('invalidFile'));
        }
      } catch (err) {
        App.UI.showToast(App.t('fileReadError'));
      }
    };
    reader.readAsText(file);
  }
};

// ============================================================
// SESSION — Session management
// ============================================================
App.Session = {
  create: function(dayName) {
    var today = new Date();
    var dateStr = App.Utils.getISODate(today);

    App.state = {
      version: 1,
      date: dateStr,
      dayName: dayName || App.Utils.getDayName(today),
      players: {},
      waitingQueue: [],
      courts: {},
      matches: {},
      settings: {
        courtNumbers: [1, 2, 3, 4],
        syncEnabled: false,
        syncRoomId: null
      },
      nextPlayerNumber: 1,
      lastModified: Date.now(),
      isAdmin: true // session creator is admin
    };

    App.save();
    return App.state;
  },

  resetToday: function() {
    // Reset day stats but keep players
    var players = App.state.players;
    Object.keys(players).forEach(function(id) {
      players[id].present = false;
      players[id].gamesPlayed = 0;
      players[id].lastGameEndTime = 0;
      players[id].queueEntryTime = 0;
      players[id].partnerHistory = {};
      players[id].opponentHistory = {};
      players[id].wishFulfilled = false;
      players[id].number = 0;
    });
    App.state.waitingQueue = [];
    App.state.matches = {};
    App.state.nextPlayerNumber = 1;

    // Reset courts
    Object.keys(App.state.courts).forEach(function(id) {
      App.state.courts[id].occupied = false;
      App.state.courts[id].currentMatch = null;
      App.state.courts[id].gameStartTime = null;
    });

    App.save();
    App.UI.renderAll();
    App.UI.showToast(App.t('dayReset'));
  },

  initCourts: function(numbers) {
    var newCourts = {};
    numbers.forEach(function(num) {
      var id = 'c_' + num;
      // Preserve existing court if it exists
      if (App.state.courts[id]) {
        newCourts[id] = App.state.courts[id];
        newCourts[id].displayNumber = num;
      } else {
        newCourts[id] = {
          id: id,
          displayNumber: num,
          active: true,
          occupied: false,
          currentMatch: null,
          gameStartTime: null
        };
      }
    });
    App.state.courts = newCourts;
    App.save();
  }
};

// ============================================================
// PLAYERS — Player management
// ============================================================
App.Players = {
  add: function(name) {
    if (!name || !name.trim()) return null;
    name = name.trim();

    var id = App.Utils.generateId('p');
    App.state.players[id] = {
      id: id,
      number: 0, // number assigned on mark present
      name: name,
      present: false,
      gamesPlayed: 0,
      lastGameEndTime: 0,
      queueEntryTime: 0,
      partnerHistory: {},
      opponentHistory: {},
      wishedPartner: null,
      wishFulfilled: false
    };

    App.save();
    return id;
  },

  remove: function(playerId) {
    // Remove from queue
    App.Queue.remove(playerId);
    // Cannot delete if on court
    if (this.isOnCourt(playerId)) {
      App.UI.showToast(App.t('cantDeletePlaying'));
      return false;
    }
    delete App.state.players[playerId];
    // Remove wishes targeting this player
    Object.values(App.state.players).forEach(function(p) {
      if (p.wishedPartner === playerId) {
        p.wishedPartner = null;
        p.wishFulfilled = false;
      }
    });
    App.save();
    return true;
  },

  markPresent: function(playerId) {
    var p = App.state.players[playerId];
    if (!p) return;
    if (p.present) return; // already marked

    p.present = true;
    p.number = App.state.nextPlayerNumber++;
    p.queueEntryTime = Date.now();

    // Add to end of queue
    App.Queue.add(playerId);
    App.save();
  },

  markAbsent: function(playerId) {
    var p = App.state.players[playerId];
    if (!p) return;
    if (this.isOnCourt(playerId)) {
      App.UI.showToast(App.t('playerOnCourt'));
      return;
    }
    p.present = false;
    App.Queue.remove(playerId);
    App.save();
  },

  setWish: function(playerId, partnerId) {
    var p = App.state.players[playerId];
    if (!p) return;
    p.wishedPartner = partnerId;
    p.wishFulfilled = false;
    App.save();
  },

  isOnCourt: function(playerId) {
    var matches = App.state.matches;
    return Object.values(matches).some(function(m) {
      return m.status === 'playing' &&
        (m.teamA.indexOf(playerId) !== -1 || m.teamB.indexOf(playerId) !== -1);
    });
  },

  getCourtId: function(playerId) {
    var matches = App.state.matches;
    var match = Object.values(matches).find(function(m) {
      return m.status === 'playing' &&
        (m.teamA.indexOf(playerId) !== -1 || m.teamB.indexOf(playerId) !== -1);
    });
    return match ? match.courtId : null;
  },

  getStatus: function(playerId) {
    var p = App.state.players[playerId];
    if (!p || !p.present) return 'absent';
    if (this.isOnCourt(playerId)) return 'playing';
    if (App.state.waitingQueue.indexOf(playerId) !== -1) return 'waiting';
    return 'present';
  },

  getPresent: function() {
    return Object.values(App.state.players).filter(function(p) { return p.present; });
  },

  getSorted: function() {
    return Object.values(App.state.players).sort(function(a, b) {
      // Present players first, then by number
      if (a.present !== b.present) return a.present ? -1 : 1;
      if (a.number && b.number) return a.number - b.number;
      return a.name.localeCompare(b.name);
    });
  }
};

// ============================================================
// QUEUE — Queue management
// ============================================================
App.Queue = {
  add: function(playerId) {
    if (App.state.waitingQueue.indexOf(playerId) !== -1) return; // already in queue
    if (App.Players.isOnCourt(playerId)) return; // on court
    App.state.waitingQueue.push(playerId);
    var p = App.state.players[playerId];
    if (p) p.queueEntryTime = Date.now();
  },

  remove: function(playerId) {
    var idx = App.state.waitingQueue.indexOf(playerId);
    if (idx !== -1) {
      App.state.waitingQueue.splice(idx, 1);
    }
  },

  move: function(playerId, newIndex) {
    this.remove(playerId);
    if (newIndex < 0) newIndex = 0;
    if (newIndex > App.state.waitingQueue.length) newIndex = App.state.waitingQueue.length;
    App.state.waitingQueue.splice(newIndex, 0, playerId);
    App.save();
  },

  moveToEnd: function(playerId) {
    this.remove(playerId);
    App.state.waitingQueue.push(playerId);
    App.save();
  },

  addMultipleToEnd: function(playerIds) {
    var self = this;
    playerIds.forEach(function(id) {
      self.remove(id); // remove if already present
    });
    playerIds.forEach(function(id) {
      App.state.waitingQueue.push(id);
      var p = App.state.players[id];
      if (p) p.queueEntryTime = Date.now();
    });
  },

  getPosition: function(playerId) {
    return App.state.waitingQueue.indexOf(playerId);
  }
};

// ============================================================
// COURTS — Court and game management
// ============================================================
App.Courts = {
  startGame: function(courtId, teamA, teamB) {
    var court = App.state.courts[courtId];
    if (!court) return null;
    if (court.occupied) {
      App.UI.showToast(App.t('courtOccupied'));
      return null;
    }

    // Check all 4 players are unique
    var allPlayers = teamA.concat(teamB);
    var unique = new Set(allPlayers);
    if (unique.size !== 4) {
      App.UI.showToast(App.t('playersDuplicate'));
      return null;
    }

    // Check none of them are already on court
    for (var i = 0; i < allPlayers.length; i++) {
      if (App.Players.isOnCourt(allPlayers[i])) {
        var pName = App.state.players[allPlayers[i]].name;
        App.UI.showToast(pName + App.t('alreadyOnCourt'));
        return null;
      }
    }

    // Remove all 4 from queue
    allPlayers.forEach(function(pid) {
      App.Queue.remove(pid);
    });

    // Create match
    var matchId = App.Utils.generateId('m');
    var now = Date.now();
    App.state.matches[matchId] = {
      id: matchId,
      startTime: now,
      endTime: null,
      courtId: courtId,
      teamA: teamA,
      teamB: teamB,
      score: null,
      status: 'playing'
    };

    court.occupied = true;
    court.currentMatch = matchId;
    court.gameStartTime = now;

    App.save();
    App.UI.showToast(App.t('gameStartedOn') + court.displayNumber);
    return matchId;
  },

  finishGame: function(courtId, score) {
    var court = App.state.courts[courtId];
    if (!court || !court.currentMatch) {
      App.UI.showToast(App.t('noActiveGame'));
      return;
    }

    var match = App.state.matches[court.currentMatch];
    if (!match || match.status !== 'playing') return;

    match.status = 'finished';
    match.endTime = Date.now();
    match.score = score || null;

    // Update player stats
    var allPlayers = match.teamA.concat(match.teamB);
    allPlayers.forEach(function(pid) {
      var p = App.state.players[pid];
      if (!p) return;
      p.gamesPlayed++;
      p.lastGameEndTime = match.endTime;
    });

    // Update partner and opponent history
    this._updatePairStats(match.teamA[0], match.teamA[1], 'partner');
    this._updatePairStats(match.teamB[0], match.teamB[1], 'partner');
    match.teamA.forEach(function(pa) {
      match.teamB.forEach(function(pb) {
        App.Courts._updatePairStats(pa, pb, 'opponent');
      });
    });

    // Check "play together" wishes
    this._checkWishes(match.teamA);
    this._checkWishes(match.teamB);

    // Free up the court
    court.occupied = false;
    court.currentMatch = null;
    court.gameStartTime = null;

    // Players go to end of queue
    App.Queue.addMultipleToEnd(allPlayers);

    App.save();
    App.UI.showToast(App.t('gameFinishedOn') + court.displayNumber + App.t('gameFinishedSuffix'));
  },

  cancelGame: function(courtId) {
    var court = App.state.courts[courtId];
    if (!court || !court.currentMatch) return;

    var match = App.state.matches[court.currentMatch];
    if (!match) return;

    match.status = 'cancelled';
    match.endTime = Date.now();

    // Return players to front of queue
    var allPlayers = match.teamA.concat(match.teamB);
    allPlayers.reverse().forEach(function(pid) {
      App.Queue.remove(pid);
      App.state.waitingQueue.unshift(pid);
    });

    court.occupied = false;
    court.currentMatch = null;
    court.gameStartTime = null;

    App.save();
    App.UI.showToast(App.t('gameCancelled'));
  },

  _updatePairStats: function(id1, id2, type) {
    var p1 = App.state.players[id1];
    var p2 = App.state.players[id2];
    if (!p1 || !p2) return;

    var history1 = type === 'partner' ? p1.partnerHistory : p1.opponentHistory;
    var history2 = type === 'partner' ? p2.partnerHistory : p2.opponentHistory;

    history1[id2] = (history1[id2] || 0) + 1;
    history2[id1] = (history2[id1] || 0) + 1;
  },

  _checkWishes: function(teamIds) {
    teamIds.forEach(function(pid) {
      var p = App.state.players[pid];
      if (!p) return;
      // If wished partner is on the same team
      if (p.wishedPartner && teamIds.indexOf(p.wishedPartner) !== -1) {
        p.wishFulfilled = true;
      }
    });
  },

  getAvailable: function() {
    return Object.values(App.state.courts).filter(function(c) {
      return c.active && !c.occupied;
    });
  },

  getGameDuration: function(courtId) {
    var court = App.state.courts[courtId];
    if (!court || !court.gameStartTime) return 0;
    return Date.now() - court.gameStartTime;
  }
};

// ============================================================
// MATCHES — Match history
// ============================================================
App.Matches = {
  getFinished: function() {
    return Object.values(App.state.matches)
      .filter(function(m) { return m.status === 'finished'; })
      .sort(function(a, b) { return b.endTime - a.endTime; });
  },

  getFiltered: function(courtFilter, playerFilter) {
    var matches = this.getFinished();
    if (courtFilter && courtFilter !== 'all') {
      matches = matches.filter(function(m) { return m.courtId === courtFilter; });
    }
    if (playerFilter && playerFilter !== 'all') {
      matches = matches.filter(function(m) {
        return m.teamA.indexOf(playerFilter) !== -1 || m.teamB.indexOf(playerFilter) !== -1;
      });
    }
    return matches;
  },

  undoLast: function() {
    var finished = this.getFinished();
    if (finished.length === 0) {
      App.UI.showToast(App.t('noFinishedMatches'));
      return;
    }

    var last = finished[0]; // most recent
    var allPlayers = last.teamA.concat(last.teamB);

    // Revert stats
    allPlayers.forEach(function(pid) {
      var p = App.state.players[pid];
      if (!p) return;
      if (p.gamesPlayed > 0) p.gamesPlayed--;
    });

    // Revert partner history
    this._undoPairStats(last.teamA[0], last.teamA[1], 'partner');
    this._undoPairStats(last.teamB[0], last.teamB[1], 'partner');
    last.teamA.forEach(function(pa) {
      last.teamB.forEach(function(pb) {
        App.Matches._undoPairStats(pa, pb, 'opponent');
      });
    });

    // Delete match
    delete App.state.matches[last.id];

    // Remove players from queue (they were added at end on finish)
    allPlayers.forEach(function(pid) {
      App.Queue.remove(pid);
    });

    // Return to front of queue
    allPlayers.reverse().forEach(function(pid) {
      App.state.waitingQueue.unshift(pid);
    });

    App.save();
    App.UI.renderAll();
    App.UI.showToast(App.t('lastMatchUndone'));
  },

  _undoPairStats: function(id1, id2, type) {
    var p1 = App.state.players[id1];
    var p2 = App.state.players[id2];
    if (!p1 || !p2) return;

    var h1 = type === 'partner' ? p1.partnerHistory : p1.opponentHistory;
    var h2 = type === 'partner' ? p2.partnerHistory : p2.opponentHistory;

    if (h1[id2]) { h1[id2]--; if (h1[id2] <= 0) delete h1[id2]; }
    if (h2[id1]) { h2[id1]--; if (h2[id1] <= 0) delete h2[id1]; }
  }
};

// ============================================================
// SUGGEST — Lineup suggestion algorithm
// ============================================================
App.Suggest = {
  forCourt: function(courtId) {
    var queue = App.state.waitingQueue;
    var players = App.state.players;

    // Only present players from queue
    var candidates = queue
      .map(function(id) { return players[id]; })
      .filter(function(p) { return p && p.present; });

    if (candidates.length < 4) {
      return {
        players: null,
        explanation: App.t('notEnoughPlayers') + candidates.length + App.t('notEnoughPlayersSuffix')
      };
    }

    // Step 1: score each candidate
    var avgGames = this._averageGames();
    var scored = candidates.map(function(player, queueIndex) {
      var score = 0;
      var reasons = [];

      // Queue position is the main factor
      score += queueIndex * 100;

      // Penalty for games above average
      var gamesDiff = player.gamesPlayed - avgGames;
      if (gamesDiff > 0) {
        score += gamesDiff * 50;
      }

      // Bonus for unfulfilled wish
      if (player.wishedPartner && !player.wishFulfilled) {
        var partner = players[player.wishedPartner];
        if (partner && partner.present) {
          score -= 80;
          reasons.push(App.t('wantsPlayWith') + partner.name);
        }
      }

      return { player: player, score: score, reasons: reasons, queueIndex: queueIndex };
    });

    // Sort by score
    scored.sort(function(a, b) { return a.score - b.score; });

    // Step 2: pick top 4, try to include wished partner
    var selected = scored.slice(0, 4);

    for (var i = 0; i < Math.min(4, selected.length); i++) {
      var sel = selected[i];
      var wishId = sel.player.wishedPartner;
      if (wishId && !sel.player.wishFulfilled) {
        var alreadyIn = selected.some(function(s) { return s.player.id === wishId; });
        if (!alreadyIn) {
          var wishCandidate = scored.find(function(s) {
            return s.player.id === wishId && selected.indexOf(s) === -1;
          });
          if (wishCandidate && wishCandidate.queueIndex < candidates.length * 0.75) {
            selected[3] = wishCandidate;
            selected.sort(function(a, b) { return a.score - b.score; });
          }
        }
      }
    }

    var fourPlayers = selected.map(function(s) { return s.player; });

    // Step 3: best team split
    var split = this.splitTeams(fourPlayers);

    // Step 4: explanation
    var explanation = this._buildExplanation(selected, split, fourPlayers);

    return {
      players: fourPlayers.map(function(p) { return p.id; }),
      teamA: split.teamA,
      teamB: split.teamB,
      explanation: explanation,
      allSplits: split.allSplits
    };
  },

  // Split 4 players into 2 teams, choosing the best option
  splitTeams: function(fourPlayers) {
    var ids = fourPlayers.map(function(p) { return p.id; });
    var a = ids[0], b = ids[1], c = ids[2], d = ids[3];

    // 3 possible splits
    var splits = [
      { teamA: [a, b], teamB: [c, d] },
      { teamA: [a, c], teamB: [b, d] },
      { teamA: [a, d], teamB: [b, c] }
    ];

    var self = this;
    var scoredSplits = splits.map(function(split) {
      var penalty = 0;
      var reasons = [];

      // Penalty for pair repeats
      [split.teamA, split.teamB].forEach(function(team) {
        var count = self._pairCount(team[0], team[1]);
        if (count > 0) {
          penalty += count * 30;
          var n0 = App.state.players[team[0]].name;
          var n1 = App.state.players[team[1]].name;
          reasons.push(n0 + ' + ' + n1 + App.t('alreadyPaired') + count + App.t('timesN'));
        }
      });

      // Penalty for opponent repeats
      split.teamA.forEach(function(pa) {
        split.teamB.forEach(function(pb) {
          var count = self._opponentCount(pa, pb);
          if (count > 1) {
            penalty += (count - 1) * 15;
          }
        });
      });

      // Bonus for "play together" wish
      [split.teamA, split.teamB].forEach(function(team) {
        var p0 = App.state.players[team[0]];
        var p1 = App.state.players[team[1]];
        if ((p0.wishedPartner === p1.id && !p0.wishFulfilled) ||
            (p1.wishedPartner === p0.id && !p1.wishFulfilled)) {
          penalty -= 100;
          reasons.push(App.t('wishLabel') + p0.name + ' + ' + p1.name);
        }
      });

      return {
        teamA: split.teamA,
        teamB: split.teamB,
        penalty: penalty,
        reasons: reasons,
        label: self._splitLabel(split)
      };
    });

    scoredSplits.sort(function(a, b) { return a.penalty - b.penalty; });

    return {
      teamA: scoredSplits[0].teamA,
      teamB: scoredSplits[0].teamB,
      reasons: scoredSplits[0].reasons,
      allSplits: scoredSplits
    };
  },

  _splitLabel: function(split) {
    var nameA = split.teamA.map(function(id) { return App.state.players[id].name; }).join(' + ');
    var nameB = split.teamB.map(function(id) { return App.state.players[id].name; }).join(' + ');
    return nameA + '  vs  ' + nameB;
  },

  _pairCount: function(id1, id2) {
    var p = App.state.players[id1];
    return p ? (p.partnerHistory[id2] || 0) : 0;
  },

  _opponentCount: function(id1, id2) {
    var p = App.state.players[id1];
    return p ? (p.opponentHistory[id2] || 0) : 0;
  },

  _averageGames: function() {
    var present = App.Players.getPresent();
    if (present.length === 0) return 0;
    var total = present.reduce(function(s, p) { return s + p.gamesPlayed; }, 0);
    return total / present.length;
  },

  _buildExplanation: function(selected, split, fourPlayers) {
    var lines = [];
    var names = fourPlayers.map(function(p) { return p.number + ' ' + p.name; });
    lines.push(App.t('selectedPlayers') + names.join(', '));

    // Reason for selection
    var allInQueueOrder = selected.every(function(s, i) {
      return i === 0 || s.queueIndex >= selected[i-1].queueIndex;
    });
    if (allInQueueOrder && selected[0].queueIndex === 0) {
      lines.push(App.t('firstInQueue'));
    }

    // Wishes
    selected.forEach(function(s) {
      if (s.reasons.length > 0) {
        lines.push(s.player.name + ': ' + s.reasons.join(', '));
      }
    });

    // Split reasons
    if (split.reasons && split.reasons.length > 0) {
      split.reasons.forEach(function(r) { lines.push(r); });
    }

    return lines.join('\n');
  }
};

// ============================================================
// SYNC — Firebase Realtime Database
// ============================================================
App.Sync = {
  db: null,
  ref: null,
  connected: false,
  _listener: null,
  _pushing: false,

  init: function(roomId, asAdmin) {
    // Firebase config — REPLACE WITH YOUR OWN
    var firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      databaseURL: "YOUR_DATABASE_URL",
      projectId: "YOUR_PROJECT_ID"
    };

    // Check if Firebase SDK is loaded
    if (typeof firebase === 'undefined' || !firebase.database) {
      App.UI.showToast(App.t('firebaseNotLoaded'));
      return false;
    }

    // Initialize Firebase (if not already)
    if (!firebase.apps.length) {
      // Check config is filled in
      if (firebaseConfig.apiKey === 'YOUR_API_KEY') {
        App.UI.showToast(App.t('configureFirebase'));
        return false;
      }
      firebase.initializeApp(firebaseConfig);
    }

    this.db = firebase.database();
    this.ref = this.db.ref('sessions/' + roomId);

    App.state.settings.syncEnabled = true;
    App.state.settings.syncRoomId = roomId;
    App.state.isAdmin = !!asAdmin;

    var self = this;

    // Listen for changes
    this._listener = this.ref.on('value', function(snapshot) {
      if (self._pushing) return; // ignore own changes

      var remote = snapshot.val();
      if (remote && remote.lastModified > App.state.lastModified) {
        self._merge(remote);
        App.UI.renderAll();
      }
    });

    this.connected = true;
    this._updateStatus('connected');

    // If admin — push current state
    if (asAdmin) {
      this.push();
    }

    App.save();
    return true;
  },

  push: function() {
    if (!this.ref || !this.connected) return;
    this._pushing = true;
    var self = this;
    this.ref.set(App.state).then(function() {
      self._pushing = false;
    }).catch(function(err) {
      self._pushing = false;
      console.error('Sync push error:', err);
    });
  },

  _merge: function(remote) {
    // Preserve local data that should not be overwritten
    var localIsAdmin = App.state.isAdmin;
    App.state = remote;
    App.state.isAdmin = localIsAdmin;
    App.Storage.save();
  },

  disconnect: function() {
    if (this._listener && this.ref) {
      this.ref.off('value', this._listener);
    }
    this.connected = false;
    this._listener = null;
    App.state.settings.syncEnabled = false;
    App.state.settings.syncRoomId = null;
    App.save();
    this._updateStatus('disconnected');
  },

  _updateStatus: function(status) {
    var el = document.getElementById('syncStatus');
    var indicator = document.getElementById('syncIndicator');
    var btnDisconnect = document.getElementById('btnDisconnect');

    if (status === 'connected') {
      el.textContent = App.t('connectedToRoom') + App.state.settings.syncRoomId;
      el.className = 'sync-status connected';
      indicator.hidden = false;
      indicator.className = 'sync-indicator';
      btnDisconnect.hidden = false;
    } else {
      el.textContent = App.t('disconnectedMsg');
      el.className = 'sync-status';
      indicator.hidden = true;
      btnDisconnect.hidden = true;
    }
  }
};

// ============================================================
// SAVE — Wrapper for save + sync
// ============================================================
App.save = function() {
  App.Storage.save();
  if (App.state.settings.syncEnabled && App.Sync.connected) {
    App.Sync.push();
  }
};

// ============================================================
// UI — Interface rendering
// ============================================================
App.UI = {
  currentTab: 'board',
  timerInterval: null,

  init: function() {
    this._bindTabs();
    this._bindDashboard();
    this._bindPlayers();
    this._bindCourts();
    this._bindHistory();
    this._bindSync();
    this._bindModeToggle();
    this.startTimers();
  },

  // --- Tabs ---
  _bindTabs: function() {
    var self = this;
    document.getElementById('tabNav').addEventListener('click', function(e) {
      var tab = e.target.closest('.tab');
      if (!tab) return;
      self.showTab(tab.dataset.tab);
    });
  },

  showTab: function(tabName) {
    this.currentTab = tabName;

    // Active tab
    document.querySelectorAll('.tab').forEach(function(t) {
      t.classList.toggle('active', t.dataset.tab === tabName);
    });

    // Active panel
    document.querySelectorAll('.panel').forEach(function(p) {
      p.classList.toggle('active', p.id === 'panel-' + tabName);
    });

    // Render current tab
    this.renderCurrentTab();
  },

  renderCurrentTab: function() {
    switch (this.currentTab) {
      case 'board': this.renderBoard(); break;
      case 'dashboard': this.renderDashboard(); break;
      case 'players': this.renderPlayers(); break;
      case 'queue': this.renderQueue(); break;
      case 'courts': this.renderCourts(); break;
      case 'history': this.renderHistory(); break;
    }
  },

  renderAll: function() {
    this.renderSessionDate();
    this.renderCurrentTab();
  },

  renderSessionDate: function() {
    var el = document.getElementById('sessionDate');
    if (App.state) {
      el.textContent = App.Utils.formatDate(App.state.date) + ', ' + App.state.dayName;
    }
  },

  // --- Dashboard ---
  _bindDashboard: function() {
    var self = this;
    document.getElementById('btnNewSession').addEventListener('click', function() {
      self.showConfirm(App.t('confirmNewSession'), function() {
        App.Session.create();
        App.Session.initCourts([1, 2, 3, 4]);
        App.UI.renderAll();
        App.UI.showToast(App.t('newSessionCreated'));
      });
    });

    document.getElementById('btnResetToday').addEventListener('click', function() {
      self.showConfirm(App.t('confirmResetDay'), function() {
        App.Session.resetToday();
      });
    });

    document.getElementById('btnExport').addEventListener('click', function() {
      App.Storage.exportJSON();
    });

    document.getElementById('btnImport').addEventListener('click', function() {
      document.getElementById('importFile').click();
    });

    document.getElementById('importFile').addEventListener('change', function(e) {
      if (e.target.files.length) {
        App.Storage.importJSON(e.target.files[0]);
        e.target.value = '';
      }
    });

    document.getElementById('btnApplyCourts').addEventListener('click', function() {
      var input = document.getElementById('courtNumbers').value;
      var numbers = input.split(',').map(function(s) { return parseInt(s.trim()); }).filter(function(n) { return !isNaN(n) && n > 0; });
      if (numbers.length === 0) {
        App.UI.showToast(App.t('enterCourtNumbers'));
        return;
      }
      if (numbers.length > 5) {
        App.UI.showToast(App.t('maxCourts'));
        return;
      }
      App.Session.initCourts(numbers);
      App.save();
      App.UI.renderAll();
      App.UI.showToast(App.t('courtsUpdated') + numbers.join(', '));
    });
  },

  renderDashboard: function() {
    var present = App.Players.getPresent();
    var playing = present.filter(function(p) { return App.Players.isOnCourt(p.id); });
    var waiting = App.state.waitingQueue.length;
    var activeCourts = Object.values(App.state.courts).filter(function(c) { return c.active; });
    var occupiedCourts = activeCourts.filter(function(c) { return c.occupied; });
    var totalGames = App.Matches.getFinished().length;

    document.getElementById('statsGrid').innerHTML =
      '<div class="stat-card"><div class="stat-value">' + present.length + '</div><div class="stat-label">' + App.t('statPresent') + '</div></div>' +
      '<div class="stat-card"><div class="stat-value">' + playing.length + '</div><div class="stat-label">' + App.t('statPlaying') + '</div></div>' +
      '<div class="stat-card"><div class="stat-value">' + waiting + '</div><div class="stat-label">' + App.t('statInQueue') + '</div></div>' +
      '<div class="stat-card"><div class="stat-value">' + occupiedCourts.length + '/' + activeCourts.length + '</div><div class="stat-label">' + App.t('statCourtsOccupied') + '</div></div>' +
      '<div class="stat-card"><div class="stat-value">' + totalGames + '</div><div class="stat-label">' + App.t('statGamesPlayed') + '</div></div>';

    // Update court numbers in input
    var courtNums = Object.values(App.state.courts).map(function(c) { return c.displayNumber; });
    document.getElementById('courtNumbers').value = courtNums.join(',');
  },

  // --- Players ---
  _bindPlayers: function() {
    var self = this;

    document.getElementById('btnAddPlayer').addEventListener('click', function() {
      self._addPlayerFromInput();
    });

    document.getElementById('playerNameInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        self._addPlayerFromInput();
      }
    });

    // Event delegation for buttons in the list
    document.getElementById('playerList').addEventListener('click', function(e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var row = btn.closest('[data-id]');
      if (!row) return;
      var playerId = row.dataset.id;
      var action = btn.dataset.action;

      switch (action) {
        case 'mark-present':
          App.Players.markPresent(playerId);
          App.save();
          self.renderPlayers();
          self.renderQueue();
          break;
        case 'mark-absent':
          App.Players.markAbsent(playerId);
          App.save();
          self.renderPlayers();
          self.renderQueue();
          break;
        case 'add-to-queue':
          App.Queue.add(playerId);
          App.save();
          self.renderPlayers();
          self.renderQueue();
          break;
        case 'remove-from-queue':
          App.Queue.remove(playerId);
          App.save();
          self.renderPlayers();
          self.renderQueue();
          break;
        case 'set-wish':
          self._showWishDialog(playerId);
          break;
        case 'delete':
          self.showConfirm(App.t('confirmDeletePlayer') + App.state.players[playerId].name + App.t('confirmDeleteSuffix'), function() {
            App.Players.remove(playerId);
            App.save();
            self.renderPlayers();
            self.renderQueue();
          });
          break;
      }
    });
  },

  _addPlayerFromInput: function() {
    var input = document.getElementById('playerNameInput');
    var name = input.value.trim();
    if (!name) return;
    var id = App.Players.add(name);
    if (id) {
      input.value = '';
      input.focus();
      this.renderPlayers();
      App.UI.showToast(name + App.t('playerAdded'));
    }
  },

  renderPlayers: function() {
    var players = App.Players.getSorted();
    var html = '';

    players.forEach(function(p) {
      var status = App.Players.getStatus(p.id);
      var statusClass = 'status-' + (status === 'present' ? 'waiting' : status);
      var statusBadge = '';
      var queuePos = App.Queue.getPosition(p.id);

      switch (status) {
        case 'playing':
          var courtId = App.Players.getCourtId(p.id);
          var courtObj = courtId ? App.state.courts[courtId] : null;
          statusBadge = '<span class="player-status-badge playing">' + App.t('court') + (courtObj ? courtObj.displayNumber : '?') + '</span>';
          break;
        case 'waiting':
          statusBadge = '<span class="player-status-badge waiting">' + App.t('queuePos') + (queuePos + 1) + '</span>';
          break;
        case 'absent':
          statusBadge = '<span class="player-status-badge absent">' + App.t('absent') + '</span>';
          break;
        default:
          statusBadge = '<span class="player-status-badge absent">' + App.t('presentStatus') + '</span>';
      }

      var wishText = '';
      if (p.wishedPartner) {
        var wp = App.state.players[p.wishedPartner];
        if (wp) {
          wishText = '<div class="player-wish">' +
            (p.wishFulfilled ? '&#10003; ' : '&#9829; ') +
            App.t('pairWith') + wp.name +
            (p.wishFulfilled ? App.t('wishFulfilled') : '') +
            '</div>';
        }
      }

      html += '<div class="player-row ' + statusClass + '" data-id="' + p.id + '">' +
        '<span class="player-number">' + (p.number || '-') + '</span>' +
        '<div class="player-info">' +
          '<span class="player-name">' + App.UI._esc(p.name) + '</span>' +
          wishText +
        '</div>' +
        '<span class="player-games">' + p.gamesPlayed + App.t('gamesN') + '</span>' +
        statusBadge +
        '<div class="player-actions">';

      if (!p.present) {
        html += '<button class="btn btn-success btn-xs" data-action="mark-present">' + App.t('arrived') + '</button>';
      } else {
        if (status !== 'playing') {
          html += '<button class="btn btn-secondary btn-xs" data-action="mark-absent">' + App.t('left') + '</button>';
        }
        if (status !== 'playing' && queuePos === -1) {
          html += '<button class="btn btn-warning btn-xs" data-action="add-to-queue">' + App.t('toQueue') + '</button>';
        }
        if (queuePos !== -1) {
          html += '<button class="btn btn-secondary btn-xs" data-action="remove-from-queue">' + App.t('fromQueue') + '</button>';
        }
      }

      html += '<button class="btn btn-secondary btn-xs" data-action="set-wish" title="' + App.t('wishPlayWith') + '">&#9829;</button>';
      if (status !== 'playing') {
        html += '<button class="btn btn-danger btn-xs" data-action="delete" title="' + App.t('deletePlayer') + '">&#10005;</button>';
      }

      html += '</div></div>';
    });

    if (players.length === 0) {
      html = '<div style="text-align:center; color:var(--text-secondary); padding:20px;">' + App.t('addPlayersHint') + '</div>';
    }

    document.getElementById('playerList').innerHTML = html;
  },

  _showWishDialog: function(playerId) {
    var player = App.state.players[playerId];
    if (!player) return;

    var present = App.Players.getPresent().filter(function(p) { return p.id !== playerId; });
    var html = '<h3>' + App.t('wishFor') + App.UI._esc(player.name) + '</h3>';
    html += '<p style="color:var(--text-secondary); font-size:13px; margin-bottom:12px;">' + App.t('selectPartner') + '</p>';
    html += '<div class="modal-player-list">';

    // "No preference" option
    html += '<div class="modal-player-item' + (!player.wishedPartner ? ' selected' : '') + '" data-wish-id="">' +
      '<span>' + App.t('noWish') + '</span></div>';

    present.forEach(function(p) {
      var selected = player.wishedPartner === p.id ? ' selected' : '';
      html += '<div class="modal-player-item' + selected + '" data-wish-id="' + p.id + '">' +
        '<span style="font-weight:700; color:var(--primary); margin-right:6px;">' + (p.number || '-') + '</span>' +
        '<span>' + App.UI._esc(p.name) + '</span></div>';
    });

    html += '</div>';
    html += '<div class="btn-row"><button class="btn btn-secondary" onclick="App.UI.hideModal()">' + App.t('closeBtn') + '</button></div>';

    this.showModal(html);

    // Selection handler
    document.getElementById('modalContent').addEventListener('click', function(e) {
      var item = e.target.closest('.modal-player-item');
      if (!item) return;
      var wishId = item.dataset.wishId;
      App.Players.setWish(playerId, wishId || null);
      App.save();
      App.UI.hideModal();
      App.UI.renderPlayers();
      App.UI.showToast(wishId ? App.t('wishSet') : App.t('wishRemoved'));
    });
  },

  // --- Queue ---
  renderQueue: function() {
    var queue = App.state.waitingQueue;
    var html = '';

    document.getElementById('queueCount').textContent = queue.length;

    queue.forEach(function(pid, idx) {
      var p = App.state.players[pid];
      if (!p) return;

      html += '<div class="queue-item" draggable="true" data-id="' + pid + '" data-index="' + idx + '">' +
        '<span class="drag-handle">&#9776;</span>' +
        '<span class="queue-pos">' + (idx + 1) + '</span>' +
        '<span class="queue-number">#' + (p.number || '?') + '</span>' +
        '<span class="queue-name">' + App.UI._esc(p.name) + '</span>' +
        '<span class="queue-wait">' + p.gamesPlayed + App.t('gamesN') + '</span>' +
        '<button class="btn btn-secondary btn-xs" data-action="queue-to-end" data-pid="' + pid + '">&darr;</button>' +
        '<button class="btn btn-danger btn-xs" data-action="queue-remove" data-pid="' + pid + '">&#10005;</button>' +
        '</div>';
    });

    if (queue.length === 0) {
      html = '<div style="text-align:center; color:var(--text-secondary); padding:20px;">' + App.t('queueEmpty') + '</div>';
    }

    var queueList = document.getElementById('queueList');
    queueList.innerHTML = html;

    // Bind drag-and-drop and buttons
    App.DnD.init(queueList);
    this._bindQueueActions(queueList);
  },

  _bindQueueActions: function(container) {
    var self = this;
    container.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var pid = btn.dataset.pid;
      if (!pid) return;

      switch (btn.dataset.action) {
        case 'queue-to-end':
          App.Queue.moveToEnd(pid);
          self.renderQueue();
          break;
        case 'queue-remove':
          App.Queue.remove(pid);
          App.save();
          self.renderQueue();
          self.renderPlayers();
          break;
      }
    });
  },

  // --- Courts (management) ---
  _bindCourts: function() {
    var self = this;

    document.getElementById('courtsGrid').addEventListener('click', function(e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var card = btn.closest('[data-court-id]');
      if (!card) return;
      var courtId = card.dataset.courtId;

      switch (btn.dataset.action) {
        case 'suggest':
          self._suggestForCourt(courtId);
          break;
        case 'select-players':
          self._showPlayerSelectForCourt(courtId);
          break;
        case 'finish':
          App.Courts.finishGame(courtId);
          App.UI.renderAll();
          break;
        case 'cancel':
          self.showConfirm(App.t('confirmCancelGame'), function() {
            App.Courts.cancelGame(courtId);
            App.UI.renderAll();
          });
          break;
      }
    });
  },

  renderCourts: function() {
    var courts = Object.values(App.state.courts).sort(function(a, b) {
      return a.displayNumber - b.displayNumber;
    });

    var html = '';
    courts.forEach(function(court) {
      var match = court.currentMatch ? App.state.matches[court.currentMatch] : null;
      var isOccupied = court.occupied && match && match.status === 'playing';

      html += '<div class="court-card ' + (isOccupied ? 'occupied' : 'free') + '" data-court-id="' + court.id + '">';
      html += '<div class="court-header">';
      html += '<h3>' + App.t('court') + court.displayNumber + '</h3>';

      if (isOccupied) {
        html += '<span class="court-timer" data-start="' + court.gameStartTime + '">' +
          App.Utils.formatTime(Date.now() - court.gameStartTime) + '</span>';
      }
      html += '</div>';

      if (isOccupied) {
        html += App.UI._renderTeams(match);
        html += '<div class="court-actions">';
        html += '<button class="btn btn-success" data-action="finish">' + App.t('finish') + '</button>';
        html += '<button class="btn btn-danger btn-sm" data-action="cancel">' + App.t('cancel') + '</button>';
        html += '</div>';

        // Hints
        html += App.UI._renderCourtHints(match);
      } else {
        html += '<div class="court-empty">' + App.t('courtFree') + '</div>';
        html += '<div class="court-actions">';
        html += '<button class="btn btn-primary" data-action="suggest">' + App.t('suggestLineup') + '</button>';
        html += '<button class="btn btn-secondary" data-action="select-players">' + App.t('selectManually') + '</button>';
        html += '</div>';
      }

      html += '</div>';
    });

    document.getElementById('courtsGrid').innerHTML = html;
  },

  _renderTeams: function(match) {
    var html = '<div class="court-teams">';
    html += '<div class="team team-a">';
    match.teamA.forEach(function(pid) {
      var p = App.state.players[pid];
      html += '<span><strong>#' + (p ? p.number : '?') + '</strong> ' + (p ? App.UI._esc(p.name) : '?') + '</span>';
    });
    html += '</div>';
    html += '<div class="vs">vs</div>';
    html += '<div class="team team-b">';
    match.teamB.forEach(function(pid) {
      var p = App.state.players[pid];
      html += '<span><strong>#' + (p ? p.number : '?') + '</strong> ' + (p ? App.UI._esc(p.name) : '?') + '</span>';
    });
    html += '</div></div>';
    return html;
  },

  _renderCourtHints: function(match) {
    var hints = [];

    // Check pair repeats
    [match.teamA, match.teamB].forEach(function(team) {
      var count = App.Suggest._pairCount(team[0], team[1]);
      if (count > 1) {
        var n0 = App.state.players[team[0]];
        var n1 = App.state.players[team[1]];
        hints.push({ type: 'warn', text: (n0 ? n0.name : '?') + ' + ' + (n1 ? n1.name : '?') + App.t('alreadyPaired') + count + App.t('timesN') });
      }
    });

    // Check wishes
    [match.teamA, match.teamB].forEach(function(team) {
      var p0 = App.state.players[team[0]];
      var p1 = App.state.players[team[1]];
      if (p0 && p1) {
        if ((p0.wishedPartner === p1.id) || (p1.wishedPartner === p0.id)) {
          hints.push({ type: 'good', text: App.t('wishLabel') + p0.name + ' + ' + p1.name });
        }
      }
    });

    if (hints.length === 0) return '';
    var html = '<div class="court-hints">';
    hints.forEach(function(h) {
      html += '<div class="hint-' + h.type + '">' + h.text + '</div>';
    });
    html += '</div>';
    return html;
  },

  _suggestForCourt: function(courtId) {
    var result = App.Suggest.forCourt(courtId);

    if (!result.players) {
      App.UI.showToast(result.explanation);
      return;
    }

    // Show suggestion modal
    var html = '<h3>' + App.t('suggestionFor') + App.state.courts[courtId].displayNumber + '</h3>';
    html += '<div class="suggestion-block">';
    html += '<div class="suggestion-explanation">' + App.UI._esc(result.explanation) + '</div>';
    html += '</div>';

    // Split options
    html += '<h4 style="margin-top:14px;">' + App.t('teamSplit') + '</h4>';
    html += '<div class="team-split-options">';

    var selectedSplit = { teamA: result.teamA, teamB: result.teamB };

    result.allSplits.forEach(function(split, idx) {
      var isSelected = idx === 0;
      html += '<div class="team-split-option' + (isSelected ? ' selected' : '') + '" data-split-idx="' + idx + '">';
      html += '<strong>' + split.label + '</strong>';
      if (split.reasons.length > 0) {
        html += '<div style="font-size:11px; color:var(--text-secondary);">' + split.reasons.join('; ') + '</div>';
      }
      html += '</div>';
    });

    html += '</div>';
    html += '<div class="btn-row">';
    html += '<button class="btn btn-success" id="btnConfirmSuggest">' + App.t('startGame') + '</button>';
    html += '<button class="btn btn-secondary" onclick="App.UI.hideModal()">' + App.t('cancelAction') + '</button>';
    html += '</div>';

    this.showModal(html);

    // Split selection
    document.getElementById('modalContent').addEventListener('click', function(e) {
      var option = e.target.closest('.team-split-option');
      if (option) {
        document.querySelectorAll('.team-split-option').forEach(function(o) { o.classList.remove('selected'); });
        option.classList.add('selected');
        var idx = parseInt(option.dataset.splitIdx);
        selectedSplit = result.allSplits[idx];
      }
    });

    // Confirm
    document.getElementById('btnConfirmSuggest').addEventListener('click', function() {
      App.Courts.startGame(courtId, selectedSplit.teamA, selectedSplit.teamB);
      App.UI.hideModal();
      App.UI.renderAll();
    });
  },

  _showPlayerSelectForCourt: function(courtId) {
    var queue = App.state.waitingQueue;
    var allPresent = App.Players.getPresent().filter(function(p) {
      return !App.Players.isOnCourt(p.id);
    });

    var selectedIds = [];

    var html = '<h3>' + App.t('selectPlayersFor') + App.state.courts[courtId].displayNumber + '</h3>';
    html += '<p style="color:var(--text-secondary); font-size:13px; margin-bottom:10px;">' + App.t('select4Players') + '</p>';
    html += '<div class="player-select-grid" id="playerSelectGrid">';

    allPresent.forEach(function(p) {
      var inQueue = queue.indexOf(p.id) !== -1;
      html += '<div class="player-select-item" data-pid="' + p.id + '">' +
        '<span class="ps-number">#' + (p.number || '?') + '</span> ' +
        App.UI._esc(p.name) +
        (inQueue ? '<div style="font-size:10px; color:var(--text-secondary);">' + App.t('inQueueLabel') + '</div>' : '') +
        '</div>';
    });

    html += '</div>';
    html += '<div id="selectedTeamsPreview" style="margin-top:12px;"></div>';
    html += '<div class="btn-row">';
    html += '<button class="btn btn-success" id="btnStartManual" disabled>' + App.t('startGame') + '</button>';
    html += '<button class="btn btn-secondary" onclick="App.UI.hideModal()">' + App.t('cancelAction') + '</button>';
    html += '</div>';

    this.showModal(html);

    var grid = document.getElementById('playerSelectGrid');
    var btnStart = document.getElementById('btnStartManual');
    var preview = document.getElementById('selectedTeamsPreview');
    var chosenSplit = null;

    grid.addEventListener('click', function(e) {
      var item = e.target.closest('.player-select-item');
      if (!item) return;
      var pid = item.dataset.pid;

      var idx = selectedIds.indexOf(pid);
      if (idx !== -1) {
        selectedIds.splice(idx, 1);
        item.classList.remove('selected');
      } else {
        if (selectedIds.length >= 4) {
          App.UI.showToast(App.t('already4Selected'));
          return;
        }
        selectedIds.push(pid);
        item.classList.add('selected');
      }

      btnStart.disabled = selectedIds.length !== 4;

      // Show split options when 4 selected
      if (selectedIds.length === 4) {
        var fourPlayers = selectedIds.map(function(id) { return App.state.players[id]; });
        var split = App.Suggest.splitTeams(fourPlayers);
        chosenSplit = { teamA: split.teamA, teamB: split.teamB };

        var phtml = '<h4>' + App.t('splitHeading') + '</h4><div class="team-split-options">';
        split.allSplits.forEach(function(s, i) {
          phtml += '<div class="team-split-option' + (i === 0 ? ' selected' : '') + '" data-sidx="' + i + '">' +
            '<strong>' + s.label + '</strong>';
          if (s.reasons.length > 0) {
            phtml += '<div style="font-size:11px; color:var(--text-secondary);">' + s.reasons.join('; ') + '</div>';
          }
          phtml += '</div>';
        });
        phtml += '</div>';
        preview.innerHTML = phtml;

        // Split selection handler
        preview.addEventListener('click', function(e2) {
          var opt = e2.target.closest('.team-split-option');
          if (!opt) return;
          preview.querySelectorAll('.team-split-option').forEach(function(o) { o.classList.remove('selected'); });
          opt.classList.add('selected');
          var sidx = parseInt(opt.dataset.sidx);
          chosenSplit = split.allSplits[sidx];
        });
      } else {
        preview.innerHTML = '';
        chosenSplit = null;
      }
    });

    btnStart.addEventListener('click', function() {
      if (!chosenSplit) return;
      App.Courts.startGame(courtId, chosenSplit.teamA, chosenSplit.teamB);
      App.UI.hideModal();
      App.UI.renderAll();
    });
  },

  // --- Board ---
  renderBoard: function() {
    var courts = Object.values(App.state.courts).sort(function(a, b) {
      return a.displayNumber - b.displayNumber;
    });

    // Courts
    var html = '';
    courts.forEach(function(court) {
      var match = court.currentMatch ? App.state.matches[court.currentMatch] : null;
      var isOccupied = court.occupied && match && match.status === 'playing';

      html += '<div class="board-court-card ' + (isOccupied ? 'occupied' : 'free') + '" data-court-id="' + court.id + '">';
      html += '<div class="board-court-header">';
      html += '<h3>' + App.t('court') + court.displayNumber + '</h3>';
      if (isOccupied) {
        html += '<span class="board-court-timer" data-start="' + court.gameStartTime + '">' +
          App.Utils.formatTime(Date.now() - court.gameStartTime) + '</span>';
      }
      html += '</div>';

      if (isOccupied) {
        html += '<div class="board-court-teams">';
        html += '<div class="board-team board-team-a">';
        match.teamA.forEach(function(pid) {
          var p = App.state.players[pid];
          html += '<span><span class="board-player-num">#' + (p ? p.number : '?') + '</span> ' + (p ? App.UI._esc(p.name) : '?') + '</span>';
        });
        html += '</div>';
        html += '<div class="board-vs">vs</div>';
        html += '<div class="board-team board-team-b">';
        match.teamB.forEach(function(pid) {
          var p = App.state.players[pid];
          html += '<span><span class="board-player-num">#' + (p ? p.number : '?') + '</span> ' + (p ? App.UI._esc(p.name) : '?') + '</span>';
        });
        html += '</div></div>';

        html += '<div class="board-court-actions">';
        html += '<button class="btn btn-success" data-action="board-finish" data-court="' + court.id + '">' + App.t('boardFinish') + '</button>';
        html += '</div>';
      } else {
        html += '<div class="court-empty">' + App.t('boardFree') + '</div>';
        html += '<div class="board-court-actions">';
        html += '<button class="btn btn-primary" data-action="board-suggest" data-court="' + court.id + '">' + App.t('boardSuggest') + '</button>';
        html += '</div>';
      }

      html += '</div>';
    });

    document.getElementById('boardCourts').innerHTML = html;

    // Queue
    var queue = App.state.waitingQueue;
    document.getElementById('boardQueueCount').textContent = queue.length;

    var qhtml = '';
    queue.forEach(function(pid, idx) {
      var p = App.state.players[pid];
      if (!p) return;
      qhtml += '<div class="board-queue-item">' +
        '<span class="bq-pos">' + (idx + 1) + '.</span>' +
        '<span class="bq-number">#' + (p.number || '?') + '</span>' +
        '<span class="bq-name">' + App.UI._esc(p.name) + '</span>' +
        '</div>';
    });

    if (queue.length === 0) {
      qhtml = '<div style="text-align:center; color:var(--text-secondary); padding:12px;">' + App.t('queueEmpty') + '</div>';
    }

    document.getElementById('boardQueueList').innerHTML = qhtml;

    // Bind board action buttons
    this._bindBoardActions();
  },

  _bindBoardActions: function() {
    var self = this;
    document.getElementById('boardCourts').addEventListener('click', function(e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var courtId = btn.dataset.court;

      switch (btn.dataset.action) {
        case 'board-finish':
          App.Courts.finishGame(courtId);
          App.UI.renderAll();
          break;
        case 'board-suggest':
          self._suggestForCourt(courtId);
          break;
      }
    });
  },

  // --- History ---
  _bindHistory: function() {
    var self = this;

    document.getElementById('historyCourtFilter').addEventListener('change', function() {
      self.renderHistory();
    });

    document.getElementById('historyPlayerFilter').addEventListener('change', function() {
      self.renderHistory();
    });

    document.getElementById('btnUndoLastMatch').addEventListener('click', function() {
      self.showConfirm(App.t('confirmUndoMatch'), function() {
        App.Matches.undoLast();
      });
    });
  },

  renderHistory: function() {
    // Update filters
    var courtSelect = document.getElementById('historyCourtFilter');
    var playerSelect = document.getElementById('historyPlayerFilter');

    // Save current values
    var currentCourt = courtSelect.value;
    var currentPlayer = playerSelect.value;

    // Update court options
    courtSelect.innerHTML = '<option value="all">' + App.t('allCourts') + '</option>';
    Object.values(App.state.courts).forEach(function(c) {
      courtSelect.innerHTML += '<option value="' + c.id + '"' +
        (currentCourt === c.id ? ' selected' : '') +
        '>' + App.t('court') + c.displayNumber + '</option>';
    });

    // Update player options
    playerSelect.innerHTML = '<option value="all">' + App.t('allPlayers') + '</option>';
    App.Players.getSorted().forEach(function(p) {
      playerSelect.innerHTML += '<option value="' + p.id + '"' +
        (currentPlayer === p.id ? ' selected' : '') +
        '>' + (p.number || '-') + '. ' + p.name + '</option>';
    });

    var matches = App.Matches.getFiltered(courtSelect.value, playerSelect.value);
    var html = '';

    matches.forEach(function(m) {
      var courtObj = App.state.courts[m.courtId];
      var teamANames = m.teamA.map(function(id) {
        var p = App.state.players[id];
        return p ? ('#' + p.number + ' ' + p.name) : '?';
      });
      var teamBNames = m.teamB.map(function(id) {
        var p = App.state.players[id];
        return p ? ('#' + p.number + ' ' + p.name) : '?';
      });

      html += '<div class="history-item">';
      html += '<div class="history-item-header">';
      html += '<span>' + App.t('court') + (courtObj ? courtObj.displayNumber : '?') + '</span>';
      html += '<span>' + App.Utils.formatTimestamp(m.startTime) + ' — ' + App.Utils.formatTimestamp(m.endTime) + '</span>';
      html += '</div>';
      html += '<div class="history-item-teams">';
      html += teamANames.join(' + ') + '  <strong>vs</strong>  ' + teamBNames.join(' + ');
      if (m.score) html += '  <span style="color:var(--primary);">' + m.score + '</span>';
      html += '</div></div>';
    });

    if (matches.length === 0) {
      html = '<div style="text-align:center; color:var(--text-secondary); padding:20px;">' + App.t('noMatches') + '</div>';
    }

    document.getElementById('historyList').innerHTML = html;
  },

  // --- Sync ---
  _bindSync: function() {
    document.getElementById('btnCreateRoom').addEventListener('click', function() {
      var roomId = document.getElementById('roomIdInput').value.trim();
      if (!roomId) {
        roomId = 'bad-' + App.state.date;
        document.getElementById('roomIdInput').value = roomId;
      }
      var ok = App.Sync.init(roomId, true);
      if (ok) {
        App.UI.showToast(App.t('roomCreated') + roomId);
      }
    });

    document.getElementById('btnJoinRoom').addEventListener('click', function() {
      var roomId = document.getElementById('roomIdInput').value.trim();
      if (!roomId) {
        App.UI.showToast(App.t('enterRoomId'));
        return;
      }
      var ok = App.Sync.init(roomId, false);
      if (ok) {
        App.UI.showToast(App.t('connectedToRoom') + roomId);
      }
    });

    document.getElementById('btnDisconnect').addEventListener('click', function() {
      App.Sync.disconnect();
      App.UI.showToast(App.t('syncDisconnected'));
    });
  },

  // --- Mode toggle ---
  _bindModeToggle: function() {
    var self = this;
    document.getElementById('btnToggleMode').addEventListener('click', function() {
      var nav = document.getElementById('tabNav');
      nav.classList.toggle('player-mode');
      var isPlayerMode = nav.classList.contains('player-mode');
      document.getElementById('modeIcon').innerHTML = isPlayerMode ? '&#9776;' : '&#9881;';

      // In player mode show only Board and Players
      if (isPlayerMode) {
        self.showTab('board');
      }
    });
  },

  // --- Timers ---
  startTimers: function() {
    this.timerInterval = setInterval(function() {
      // Update court timers
      document.querySelectorAll('.court-timer, .board-court-timer').forEach(function(el) {
        var start = parseInt(el.dataset.start);
        if (start) {
          el.textContent = App.Utils.formatTime(Date.now() - start);
        }
      });
    }, 1000);
  },

  // --- Modal ---
  showModal: function(html) {
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modalOverlay').hidden = false;
  },

  hideModal: function() {
    document.getElementById('modalOverlay').hidden = true;
    document.getElementById('modalContent').innerHTML = '';
  },

  showConfirm: function(message, onConfirm) {
    var html = '<p style="margin-bottom:16px;">' + message + '</p>';
    html += '<div class="btn-row">';
    html += '<button class="btn btn-danger" id="btnConfirmYes">' + App.t('yes') + '</button>';
    html += '<button class="btn btn-secondary" id="btnConfirmNo">' + App.t('no') + '</button>';
    html += '</div>';

    this.showModal(html);

    document.getElementById('btnConfirmYes').addEventListener('click', function() {
      App.UI.hideModal();
      onConfirm();
    });

    document.getElementById('btnConfirmNo').addEventListener('click', function() {
      App.UI.hideModal();
    });
  },

  // --- Toasts ---
  showToast: function(message) {
    var container = document.getElementById('toastContainer');
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function() {
      toast.remove();
    }, 3000);
  },

  // --- Utilities ---
  _esc: function(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

// ============================================================
// DND — Drag and Drop for queue
// ============================================================
App.DnD = {
  draggedId: null,

  init: function(container) {
    var self = this;

    container.addEventListener('dragstart', function(e) {
      var item = e.target.closest('.queue-item');
      if (!item) return;
      self.draggedId = item.dataset.id;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.dataset.id);
    });

    container.addEventListener('dragend', function(e) {
      var item = e.target.closest('.queue-item');
      if (item) item.classList.remove('dragging');
      container.querySelectorAll('.drag-over').forEach(function(el) {
        el.classList.remove('drag-over');
      });
      self.draggedId = null;
    });

    container.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      var item = e.target.closest('.queue-item');
      if (item && item.dataset.id !== self.draggedId) {
        container.querySelectorAll('.drag-over').forEach(function(el) {
          el.classList.remove('drag-over');
        });
        item.classList.add('drag-over');
      }
    });

    container.addEventListener('drop', function(e) {
      e.preventDefault();
      container.querySelectorAll('.drag-over').forEach(function(el) {
        el.classList.remove('drag-over');
      });

      var targetItem = e.target.closest('.queue-item');
      if (!targetItem || !self.draggedId) return;

      var targetId = targetItem.dataset.id;
      if (targetId === self.draggedId) return;

      var targetIndex = parseInt(targetItem.dataset.index);
      App.Queue.move(self.draggedId, targetIndex);
      App.UI.renderQueue();
    });

    // Touch support for mobile
    this._initTouch(container);
  },

  _initTouch: function(container) {
    var self = this;
    var dragItem = null;
    var startY = 0;
    var clone = null;

    container.addEventListener('touchstart', function(e) {
      var handle = e.target.closest('.drag-handle');
      if (!handle) return;
      var item = handle.closest('.queue-item');
      if (!item) return;

      dragItem = item;
      self.draggedId = item.dataset.id;
      startY = e.touches[0].clientY;

      // Create visual clone
      clone = item.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.zIndex = '1000';
      clone.style.opacity = '0.8';
      clone.style.width = item.offsetWidth + 'px';
      clone.style.pointerEvents = 'none';
      clone.style.left = item.getBoundingClientRect().left + 'px';
      clone.style.top = item.getBoundingClientRect().top + 'px';
      document.body.appendChild(clone);

      item.classList.add('dragging');
    }, { passive: true });

    container.addEventListener('touchmove', function(e) {
      if (!dragItem || !clone) return;
      e.preventDefault();

      var touch = e.touches[0];
      clone.style.top = touch.clientY - 20 + 'px';

      // Find element under finger
      clone.style.display = 'none';
      var elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      clone.style.display = '';

      container.querySelectorAll('.drag-over').forEach(function(el) {
        el.classList.remove('drag-over');
      });

      if (elementBelow) {
        var targetItem = elementBelow.closest('.queue-item');
        if (targetItem && targetItem !== dragItem) {
          targetItem.classList.add('drag-over');
        }
      }
    }, { passive: false });

    container.addEventListener('touchend', function(e) {
      if (!dragItem) return;

      if (clone) {
        clone.remove();
        clone = null;
      }

      dragItem.classList.remove('dragging');
      container.querySelectorAll('.drag-over').forEach(function(el) {
        el.classList.remove('drag-over');
      });

      // Find drop target
      var touch = e.changedTouches[0];
      var elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      if (elementBelow) {
        var targetItem = elementBelow.closest('.queue-item');
        if (targetItem && targetItem !== dragItem) {
          var targetIndex = parseInt(targetItem.dataset.index);
          App.Queue.move(self.draggedId, targetIndex);
          App.UI.renderQueue();
        }
      }

      dragItem = null;
      self.draggedId = null;
    });
  }
};

// ============================================================
// INIT — Application startup
// ============================================================
App.init = function() {
  // Initialize i18n first
  App.i18n.init();

  var today = App.Utils.getISODate(new Date());

  // Try to load today's session
  var saved = App.Storage.load(today);
  if (saved) {
    App.state = saved;
  } else {
    // Create new session
    App.Session.create();
    App.Session.initCourts([1, 2, 3, 4]);
  }

  // Initialize UI
  App.UI.init();
  App.UI.renderAll();

  // If sync was active — show room ID (user clicks to reconnect)
  if (App.state.settings.syncEnabled && App.state.settings.syncRoomId) {
    document.getElementById('roomIdInput').value = App.state.settings.syncRoomId;
  }

  // Close modal on overlay click
  document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
      App.UI.hideModal();
    }
  });
};

// Start on DOM ready
document.addEventListener('DOMContentLoaded', App.init);
