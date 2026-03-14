var { describe, it, beforeEach } = require('node:test');
var assert = require('node:assert');
var { loadApp } = require('./helpers');

var App = loadApp();

function createShuffleSession(playerCount) {
  App.Session.create('Test', 'shuffle');
  App.Session.initCourts([1, 2]);

  var ids = [];
  for (var i = 0; i < playerCount; i++) {
    var id = App.Players.add('P' + (i + 1));
    App.Players.markPresent(id);
    ids.push(id);
  }
  return ids;
}

describe('App.Shuffle', function() {
  beforeEach(function() {
    localStorage.clear();
  });

  describe('isShuffleMode', function() {
    it('should return true in shuffle mode', function() {
      App.Session.create('Test', 'shuffle');
      assert.strictEqual(App.Shuffle.isShuffleMode(), true);
    });

    it('should return false in queue mode', function() {
      App.Session.create('Test', 'queue');
      assert.strictEqual(App.Shuffle.isShuffleMode(), false);
    });

    it('should return false by default', function() {
      App.Session.create();
      assert.strictEqual(App.Shuffle.isShuffleMode(), false);
    });
  });

  describe('Session.create with mode', function() {
    it('should set mode to shuffle', function() {
      App.Session.create('Test', 'shuffle');
      assert.strictEqual(App.state.mode, 'shuffle');
      assert.deepStrictEqual(App.state.schedule, []);
    });

    it('should set mode to queue by default', function() {
      App.Session.create();
      assert.strictEqual(App.state.mode, 'queue');
    });

    it('should not add players to queue in shuffle mode', function() {
      App.Session.create('Test', 'shuffle');
      App.Session.initCourts([1]);
      var id = App.Players.add('Alice');
      App.Players.markPresent(id);
      assert.deepStrictEqual(App.state.waitingQueue, []);
      assert.strictEqual(App.state.players[id].present, true);
    });
  });

  describe('generate', function() {
    it('should generate games for 4 players', function() {
      createShuffleSession(4);
      var count = App.Shuffle.generate(2);
      assert.strictEqual(count, 2);
      assert.strictEqual(App.state.schedule.length, 2);
    });

    it('should create schedule entries with correct structure', function() {
      createShuffleSession(4);
      App.Shuffle.generate(1);
      var entry = App.state.schedule[0];
      assert.ok(entry.id.startsWith('sg_'));
      assert.ok(Array.isArray(entry.teamA));
      assert.ok(Array.isArray(entry.teamB));
      assert.strictEqual(entry.status, 'pending');
      assert.strictEqual(entry.courtId, null);
      assert.strictEqual(entry.matchId, null);
    });

    it('should use 2v2 format for 4 players', function() {
      createShuffleSession(4);
      App.Shuffle.generate(1);
      var entry = App.state.schedule[0];
      assert.strictEqual(entry.teamA.length, 2);
      assert.strictEqual(entry.teamB.length, 2);
    });

    it('should use 2v1 format for 3 players', function() {
      createShuffleSession(3);
      App.Shuffle.generate(1);
      var entry = App.state.schedule[0];
      var total = entry.teamA.length + entry.teamB.length;
      assert.strictEqual(total, 3);
    });

    it('should use 1v1 format for 2 players', function() {
      createShuffleSession(2);
      App.Shuffle.generate(1);
      var entry = App.state.schedule[0];
      assert.strictEqual(entry.teamA.length, 1);
      assert.strictEqual(entry.teamB.length, 1);
    });

    it('should not generate games with fewer than 2 players', function() {
      App.Session.create('Test', 'shuffle');
      App.Session.initCourts([1]);
      var id = App.Players.add('Solo');
      App.Players.markPresent(id);
      var count = App.Shuffle.generate(1);
      assert.strictEqual(count, 0);
      assert.strictEqual(App.state.schedule.length, 0);
    });

    it('should not duplicate players within a batch', function() {
      createShuffleSession(8);
      App.Shuffle.generate(2); // 2 courts worth = 1 batch
      var game1 = App.state.schedule[0];
      var game2 = App.state.schedule[1];
      var players1 = game1.teamA.concat(game1.teamB);
      var players2 = game2.teamA.concat(game2.teamB);
      var overlap = players1.filter(function(p) { return players2.indexOf(p) !== -1; });
      assert.strictEqual(overlap.length, 0);
    });

    it('should use all unique players in each entry', function() {
      createShuffleSession(6);
      App.Shuffle.generate(3);
      App.state.schedule.forEach(function(entry) {
        var all = entry.teamA.concat(entry.teamB);
        var unique = new Set(all);
        assert.strictEqual(unique.size, all.length, 'Players should be unique in game ' + entry.id);
      });
    });

    it('should avoid re-grouping same 4 players in consecutive games', function() {
      var ids = createShuffleSession(8);
      // Generate 2 batches (4 games) — with 8 players and diversification,
      // consecutive games across batches should not repeat the same group
      App.Shuffle.generate(4);
      for (var i = 0; i < App.state.schedule.length - 1; i++) {
        var g1 = App.state.schedule[i];
        var g2 = App.state.schedule[i + 1];
        var pids1 = g1.teamA.concat(g1.teamB);
        var pids2 = g2.teamA.concat(g2.teamB);
        var overlap = pids1.filter(function(p) { return pids2.indexOf(p) !== -1; });
        assert.ok(overlap.length < 3, 'Games ' + (i+1) + ' and ' + (i+2) + ' share ' + overlap.length + ' players (max 2)');
      }
    });
  });

  describe('continueShuffle', function() {
    it('should generate court-count games', function() {
      createShuffleSession(8);
      var count = App.Shuffle.continueShuffle();
      assert.strictEqual(count, 2); // 2 courts
    });
  });

  describe('reshuffle', function() {
    it('should remove pending/ready entries and regenerate', function() {
      createShuffleSession(6);
      App.Shuffle.generate(4);
      assert.strictEqual(App.state.schedule.length, 4);

      App.Shuffle.reshuffle();
      // Should have new entries (courtCount * 2 = 4)
      assert.strictEqual(App.state.schedule.length, 4);
      // All should be pending
      assert.ok(App.state.schedule.every(function(e) { return e.status === 'pending'; }));
    });

    it('should keep finished entries', function() {
      createShuffleSession(6);
      App.Shuffle.generate(2);
      App.state.schedule[0].status = 'finished';

      App.Shuffle.reshuffle();
      var finished = App.state.schedule.filter(function(e) { return e.status === 'finished'; });
      assert.strictEqual(finished.length, 1);
    });
  });

  describe('assignNextToCourt', function() {
    it('should assign first pending game to court', function() {
      createShuffleSession(4);
      App.Shuffle.generate(2);
      var entry = App.Shuffle.assignNextToCourt('c_1');
      assert.ok(entry);
      assert.strictEqual(entry.status, 'ready');
      assert.strictEqual(entry.courtId, 'c_1');
    });

    it('should not assign to occupied court', function() {
      createShuffleSession(4);
      App.Shuffle.generate(2);
      App.state.courts['c_1'].occupied = true;
      var entry = App.Shuffle.assignNextToCourt('c_1');
      assert.strictEqual(entry, null);
    });

    it('should return null when no pending games', function() {
      createShuffleSession(4);
      var entry = App.Shuffle.assignNextToCourt('c_1');
      assert.strictEqual(entry, null);
    });
  });

  describe('autoAssignAll', function() {
    it('should assign games to all free courts', function() {
      createShuffleSession(8);
      App.Shuffle.generate(4);
      var assigned = App.Shuffle.autoAssignAll();
      assert.strictEqual(assigned, 2); // 2 free courts

      var ready = App.state.schedule.filter(function(e) { return e.status === 'ready'; });
      assert.strictEqual(ready.length, 2);
    });

    it('should skip courts that already have ready games', function() {
      createShuffleSession(8);
      App.Shuffle.generate(4);
      App.Shuffle.autoAssignAll();
      // Try again — no new assignments
      var assigned = App.Shuffle.autoAssignAll();
      assert.strictEqual(assigned, 0);
    });
  });

  describe('arePlayersReady', function() {
    it('should return true when no players on court', function() {
      createShuffleSession(4);
      App.Shuffle.generate(1);
      var entry = App.state.schedule[0];
      assert.strictEqual(App.Shuffle.arePlayersReady(entry.id), true);
    });

    it('should return false when a player is on court', function() {
      var ids = createShuffleSession(6);
      App.Shuffle.generate(2);
      // Start one game manually
      var entry1 = App.state.schedule[0];
      App.Courts.startGame('c_1', entry1.teamA, entry1.teamB);

      // Check second game — some players might still be on court
      var entry2 = App.state.schedule[1];
      var all2 = entry2.teamA.concat(entry2.teamB);
      var anyOnCourt = all2.some(function(pid) { return App.Players.isOnCourt(pid); });
      if (anyOnCourt) {
        assert.strictEqual(App.Shuffle.arePlayersReady(entry2.id), false);
      }
    });
  });

  describe('getPending and getUpcoming', function() {
    it('should return pending and ready entries', function() {
      createShuffleSession(8);
      App.Shuffle.generate(4);
      App.Shuffle.assignNextToCourt('c_1');
      var pending = App.Shuffle.getPending();
      assert.strictEqual(pending.length, 4); // 1 ready + 3 pending
    });

    it('should return only pending entries for getUpcoming', function() {
      createShuffleSession(8);
      App.Shuffle.generate(4);
      App.Shuffle.assignNextToCourt('c_1');
      var upcoming = App.Shuffle.getUpcoming();
      assert.strictEqual(upcoming.length, 3); // only pending, not ready
      assert.ok(upcoming.every(function(e) { return e.status === 'pending'; }));
    });

    it('should respect limit', function() {
      createShuffleSession(8);
      App.Shuffle.generate(4);
      var upcoming = App.Shuffle.getUpcoming(2);
      assert.strictEqual(upcoming.length, 2);
    });
  });

  describe('removeGame', function() {
    it('should remove a pending game', function() {
      createShuffleSession(4);
      App.Shuffle.generate(2);
      var id = App.state.schedule[0].id;
      var result = App.Shuffle.removeGame(id);
      assert.strictEqual(result, true);
      assert.strictEqual(App.state.schedule.length, 1);
    });

    it('should not remove non-pending games', function() {
      createShuffleSession(4);
      App.Shuffle.generate(1);
      App.state.schedule[0].status = 'ready';
      var result = App.Shuffle.removeGame(App.state.schedule[0].id);
      assert.strictEqual(result, false);
      assert.strictEqual(App.state.schedule.length, 1);
    });
  });

  describe('swapPlayer', function() {
    it('should swap a player in a pending game', function() {
      var ids = createShuffleSession(6);
      App.Shuffle.generate(1);
      var entry = App.state.schedule[0];
      var oldPid = entry.teamA[0];
      var newPid = ids.find(function(id) {
        return entry.teamA.indexOf(id) === -1 && entry.teamB.indexOf(id) === -1;
      });

      var result = App.Shuffle.swapPlayer(entry.id, oldPid, newPid);
      assert.strictEqual(result, true);
      assert.ok(entry.teamA.indexOf(newPid) !== -1 || entry.teamB.indexOf(newPid) !== -1);
      assert.strictEqual(entry.teamA.indexOf(oldPid), -1);
    });

    it('should not swap in non-pending games', function() {
      var ids = createShuffleSession(4);
      App.Shuffle.generate(1);
      App.state.schedule[0].status = 'ready';
      var result = App.Shuffle.swapPlayer(App.state.schedule[0].id, ids[0], ids[3]);
      assert.strictEqual(result, false);
    });
  });

  describe('handlePlayerAbsent', function() {
    it('should downgrade 2v2 to smaller game when player leaves', function() {
      var ids = createShuffleSession(4);
      App.Shuffle.generate(1);
      var entry = App.state.schedule[0];
      assert.strictEqual(entry.teamA.length + entry.teamB.length, 4);

      App.Shuffle.handlePlayerAbsent(entry.teamA[0]);
      // Should now be 3 players total (2v1 or 1v1)
      var total = entry.teamA.length + entry.teamB.length;
      assert.ok(total <= 3, 'Should have 3 or fewer players after absence');
      assert.ok(total >= 2, 'Should have at least 2 players');
    });

    it('should remove game if not enough players remain', function() {
      createShuffleSession(2);
      App.Shuffle.generate(1);
      var entry = App.state.schedule[0];
      // Remove one of the only 2 players
      App.Shuffle.handlePlayerAbsent(entry.teamA[0]);
      // Also remove the other
      if (App.state.schedule.length > 0) {
        var remaining = App.state.schedule[0].teamA.concat(App.state.schedule[0].teamB);
        if (remaining.length < 2) {
          // Need to remove remaining too
          App.Shuffle.handlePlayerAbsent(remaining[0]);
        }
      }
      // Game with only 1 player should be removed
      var pendingWithPlayer = App.state.schedule.filter(function(e) {
        var all = e.teamA.concat(e.teamB);
        return all.length < 2 && (e.status === 'pending' || e.status === 'ready');
      });
      assert.strictEqual(pendingWithPlayer.length, 0);
    });
  });

  describe('getStats', function() {
    it('should count games by status', function() {
      createShuffleSession(8);
      App.Shuffle.generate(4);
      App.state.schedule[0].status = 'playing';
      App.state.schedule[1].status = 'finished';

      var stats = App.Shuffle.getStats();
      assert.strictEqual(stats.total, 4);
      assert.strictEqual(stats.playing, 1);
      assert.strictEqual(stats.finished, 1);
      assert.strictEqual(stats.pending, 2);
    });
  });

  describe('Court integration in shuffle mode', function() {
    it('should update schedule entry on finishGame', function() {
      var ids = createShuffleSession(4);
      App.Shuffle.generate(1);
      var entry = App.state.schedule[0];
      entry.status = 'ready';
      entry.courtId = 'c_1';
      App.Courts.startGame('c_1', entry.teamA, entry.teamB);

      assert.strictEqual(entry.status, 'playing');
      assert.ok(entry.matchId);

      App.Courts.finishGame('c_1', '21-15');
      assert.strictEqual(entry.status, 'finished');
    });

    it('should not add players to queue on finish in shuffle mode', function() {
      var ids = createShuffleSession(4);
      App.Shuffle.generate(1);
      var entry = App.state.schedule[0];
      entry.status = 'ready';
      entry.courtId = 'c_1';
      App.Courts.startGame('c_1', entry.teamA, entry.teamB);
      App.Courts.finishGame('c_1');

      assert.deepStrictEqual(App.state.waitingQueue, []);
    });

    it('should revert schedule entry on cancelGame', function() {
      var ids = createShuffleSession(4);
      App.Shuffle.generate(1);
      var entry = App.state.schedule[0];
      entry.status = 'ready';
      entry.courtId = 'c_1';
      App.Courts.startGame('c_1', entry.teamA, entry.teamB);

      App.Courts.cancelGame('c_1');
      assert.strictEqual(entry.status, 'pending');
      assert.strictEqual(entry.courtId, null);
      assert.strictEqual(entry.matchId, null);
    });

    it('should revert schedule entry on undoLast', function() {
      var ids = createShuffleSession(4);
      App.Shuffle.generate(1);
      var entry = App.state.schedule[0];
      entry.status = 'ready';
      entry.courtId = 'c_1';
      App.Courts.startGame('c_1', entry.teamA, entry.teamB);
      App.Courts.finishGame('c_1', '21-15');

      App.Matches.undoLast();
      assert.strictEqual(entry.status, 'ready');
      assert.strictEqual(entry.matchId, null);
    });
  });

  describe('Player integration in shuffle mode', function() {
    it('should call handlePlayerAbsent on markAbsent', function() {
      var ids = createShuffleSession(4);
      App.Shuffle.generate(1);
      var entry = App.state.schedule[0];
      var pid = entry.teamA[0];

      App.Players.markAbsent(pid);
      // Player should be absent
      assert.strictEqual(App.state.players[pid].present, false);
      // Schedule should be updated (downgraded or removed)
      if (App.state.schedule.length > 0) {
        var e = App.state.schedule[0];
        var all = e.teamA.concat(e.teamB);
        assert.ok(all.indexOf(pid) === -1, 'Absent player should not be in schedule');
      }
    });
  });

  describe('_ensureState migration', function() {
    it('should add mode and schedule to old state', function() {
      var state = App.Storage._ensureState({
        players: {},
        courts: {}
      });
      assert.strictEqual(state.mode, 'queue');
      assert.deepStrictEqual(state.schedule, []);
    });
  });
});
