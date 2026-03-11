var { describe, it, beforeEach } = require('node:test');
var assert = require('node:assert');
var { loadApp } = require('./helpers');

var App = loadApp();

describe('App.Storage', function() {
  beforeEach(function() {
    localStorage.clear();
  });

  describe('save and load', function() {
    it('should save and load session state', function() {
      App.Session.create();
      App.Storage.save();

      var loaded = App.Storage.load(App.state.date);
      assert.ok(loaded);
      assert.strictEqual(loaded.date, App.state.date);
      assert.deepStrictEqual(loaded.players, {});
    });

    it('should return null for non-existent date', function() {
      var loaded = App.Storage.load('2020-01-01');
      assert.strictEqual(loaded, null);
    });
  });

  describe('_ensureState', function() {
    it('should return null for invalid input', function() {
      assert.strictEqual(App.Storage._ensureState(null), null);
      assert.strictEqual(App.Storage._ensureState('string'), null);
    });

    it('should fill missing fields', function() {
      var state = App.Storage._ensureState({ players: { p1: { name: 'Test' } } });
      assert.ok(Array.isArray(state.waitingQueue));
      assert.ok(typeof state.courts === 'object');
      assert.ok(typeof state.matches === 'object');
      assert.ok(typeof state.settings === 'object');
      assert.strictEqual(state.nextPlayerNumber, 1);
      assert.strictEqual(state.isAdmin, true);
    });

    it('should migrate player fields', function() {
      var state = App.Storage._ensureState({
        players: { p1: { name: 'Test' } },
        courts: {}
      });
      var p = state.players.p1;
      assert.deepStrictEqual(p.partnerHistory, {});
      assert.deepStrictEqual(p.opponentHistory, {});
      assert.strictEqual(p.wins, 0);
      assert.strictEqual(p.losses, 0);
      assert.strictEqual(p.pointsScored, 0);
      assert.strictEqual(p.pointsConceded, 0);
      assert.strictEqual(p.totalWaitTime, 0);
      assert.strictEqual(p.waitCount, 0);
    });

    it('should not overwrite existing fields', function() {
      var state = App.Storage._ensureState({
        players: {},
        waitingQueue: ['a', 'b'],
        courts: { c1: {} },
        matches: {},
        settings: { courtNumbers: [1, 2] },
        nextPlayerNumber: 5,
        date: '2026-01-01'
      });
      assert.deepStrictEqual(state.waitingQueue, ['a', 'b']);
      assert.strictEqual(state.nextPlayerNumber, 5);
      assert.strictEqual(state.date, '2026-01-01');
    });
  });

  describe('_keySuffix', function() {
    it('should return date when sync is disabled', function() {
      App.Session.create();
      assert.strictEqual(App.Storage._keySuffix(), App.state.date);
    });

    it('should return syncSessionId when sync is enabled', function() {
      App.Session.create();
      App.state.settings.syncEnabled = true;
      App.state.settings.syncSessionId = 'badminton-2026-03-11-a3x9k';
      assert.strictEqual(App.Storage._keySuffix(), 'badminton-2026-03-11-a3x9k');
    });
  });

  describe('sync-aware save and load', function() {
    it('should save under sync key when sync is enabled', function() {
      App.Session.create();
      App.state.settings.syncEnabled = true;
      App.state.settings.syncSessionId = 'test-session-abc';
      App.Storage.save();

      var loaded = App.Storage.load('test-session-abc');
      assert.ok(loaded);
      assert.strictEqual(loaded.settings.syncSessionId, 'test-session-abc');
    });

    it('should save sync session under sync key, not date key', function() {
      App.Session.create();
      localStorage.clear(); // clear the date-keyed save from create()
      App.state.settings.syncEnabled = true;
      App.state.settings.syncSessionId = 'test-session-xyz';
      App.Storage.save();

      // Should be found by sync ID
      assert.ok(App.Storage.load('test-session-xyz'));
      // Should not be found by date
      assert.strictEqual(App.Storage.load(App.state.date), null);
    });

    it('should store last key suffix', function() {
      App.Session.create();
      App.state.settings.syncEnabled = true;
      App.state.settings.syncSessionId = 'my-session';
      App.Storage.save();

      assert.strictEqual(localStorage.getItem(App.Storage.LAST_KEY), 'my-session');
    });

    it('should track sync session in index', function() {
      App.Session.create();
      App.state.settings.syncEnabled = true;
      App.state.settings.syncSessionId = 'indexed-session';
      App.Storage.save();

      var index = App.Storage.getIndex();
      assert.ok(index.includes('indexed-session'));
    });
  });

  describe('getIndex', function() {
    it('should return empty array when no index exists', function() {
      assert.deepStrictEqual(App.Storage.getIndex(), []);
    });

    it('should track saved sessions in index', function() {
      App.Session.create();
      App.Storage.save();
      var index = App.Storage.getIndex();
      assert.ok(index.includes(App.state.date));
    });
  });
});
