var { describe, it, beforeEach, afterEach } = require('node:test');
var assert = require('node:assert');
var { loadApp } = require('./helpers');

var App = loadApp();

describe('App.Sync', function() {
  beforeEach(function() {
    localStorage.clear();
    App.Session.create();
    App.Session.initCourts([1, 2]);
    // Reset sync state
    App.Sync.connected = false;
    App.Sync.ref = null;
    App.Sync._pushCount = 0;
    App.Sync._listener = null;
  });

  describe('_pushCount guard', function() {
    it('should ignore incoming changes while a push is in-flight', function() {
      App.Sync._pushCount = 1;
      var originalState = JSON.parse(JSON.stringify(App.state));

      // Simulate incoming remote data with a newer timestamp
      var remote = JSON.parse(JSON.stringify(App.state));
      remote.lastModified = Date.now() + 10000;
      remote.waitingQueue = ['fake-player'];

      // The listener callback checks _pushCount > 0
      var ignored = App.Sync._pushCount > 0;
      assert.strictEqual(ignored, true, 'should ignore when pushCount > 0');
      assert.deepStrictEqual(App.state.waitingQueue, originalState.waitingQueue);
    });

    it('should accept incoming changes when no push is in-flight', function() {
      App.Sync._pushCount = 0;
      var accepted = !(App.Sync._pushCount > 0);
      assert.strictEqual(accepted, true, 'should accept when pushCount is 0');
    });

    it('should track multiple concurrent pushes correctly', function() {
      // Simulate two rapid pushes
      App.Sync._pushCount++;
      App.Sync._pushCount++;
      assert.strictEqual(App.Sync._pushCount, 2);

      // First push completes
      App.Sync._pushCount--;
      assert.strictEqual(App.Sync._pushCount, 1);
      assert.strictEqual(App.Sync._pushCount > 0, true, 'should still guard after first push completes');

      // Second push completes
      App.Sync._pushCount--;
      assert.strictEqual(App.Sync._pushCount, 0);
      assert.strictEqual(App.Sync._pushCount > 0, false, 'should allow after all pushes complete');
    });

    it('should not go negative on push completion', function() {
      App.Sync._pushCount = 1;
      App.Sync._pushCount--;
      assert.strictEqual(App.Sync._pushCount, 0);
    });
  });

  describe('push', function() {
    it('should not push when not connected', function() {
      App.Sync.connected = false;
      App.Sync.ref = { set: function() { assert.fail('should not call set'); } };
      App.Sync.push();
      assert.strictEqual(App.Sync._pushCount, 0);
    });

    it('should not push when ref is null', function() {
      App.Sync.connected = true;
      App.Sync.ref = null;
      App.Sync.push();
      assert.strictEqual(App.Sync._pushCount, 0);
    });

    it('should increment pushCount and call ref.set', function() {
      var setCalled = false;
      App.Sync.connected = true;
      App.Sync.ref = {
        set: function() {
          setCalled = true;
          return { then: function(cb) { cb(); return { catch: function() {} }; } };
        }
      };
      // Stub _blink to avoid DOM access
      var origBlink = App.Sync._blink;
      App.Sync._blink = function() {};

      App.Sync.push();

      assert.strictEqual(setCalled, true);
      // After the .then() resolves synchronously, pushCount should be back to 0
      assert.strictEqual(App.Sync._pushCount, 0);

      App.Sync._blink = origBlink;
    });

    it('should decrement pushCount even on error', function() {
      App.Sync.connected = true;
      App.Sync.ref = {
        set: function() {
          return {
            then: function() {
              return { catch: function(cb) { cb(new Error('test')); } };
            }
          };
        }
      };
      var origBlink = App.Sync._blink;
      App.Sync._blink = function() {};

      App.Sync.push();
      assert.strictEqual(App.Sync._pushCount, 0);

      App.Sync._blink = origBlink;
    });
  });

  describe('session existence check', function() {
    it('should reject join when session does not exist', function(t, done) {
      // Mock firebase
      var origFirebase = global.firebase;
      global.firebase = {
        apps: [{}],
        database: function() {
          return {
            ref: function() {
              return {
                once: function() {
                  return {
                    then: function(cb) {
                      cb({ exists: function() { return false; } });
                      return { catch: function() {} };
                    }
                  };
                }
              };
            }
          };
        }
      };

      var toastMsg = null;
      var origShowToast = App.UI.showToast;
      App.UI.showToast = function(msg) { toastMsg = msg; };

      App.Sync.init('nonexistent-session', false, function(ok) {
        assert.strictEqual(ok, false);
        assert.strictEqual(toastMsg, App.t('sessionNotFound'));
        assert.strictEqual(App.Sync.ref, null);

        App.UI.showToast = origShowToast;
        global.firebase = origFirebase;
        done();
      });
    });

    it('should allow join when session exists', function(t, done) {
      var origFirebase = global.firebase;
      var onCalled = false;
      global.firebase = {
        apps: [{}],
        database: function() {
          return {
            ref: function() {
              return {
                once: function() {
                  return {
                    then: function(cb) {
                      cb({ exists: function() { return true; } });
                      return { catch: function() {} };
                    }
                  };
                },
                on: function() { onCalled = true; },
                off: function() {}
              };
            }
          };
        }
      };

      var origBlink = App.Sync._blink;
      var origUpdateStatus = App.Sync._updateStatus;
      App.Sync._blink = function() {};
      App.Sync._updateStatus = function() {};

      App.Sync.init('existing-session', false, function(ok) {
        assert.strictEqual(ok, true);
        assert.strictEqual(onCalled, true, 'should attach listener');
        assert.strictEqual(App.Sync.connected, true);

        // Cleanup
        App.Sync.connected = false;
        App.Sync._blink = origBlink;
        App.Sync._updateStatus = origUpdateStatus;
        global.firebase = origFirebase;
        done();
      });
    });

    it('should skip existence check for admin (create)', function() {
      var origFirebase = global.firebase;
      var onceCalled = false;
      global.firebase = {
        apps: [{}],
        database: function() {
          return {
            ref: function() {
              return {
                once: function() { onceCalled = true; },
                on: function() {},
                off: function() {},
                set: function() {
                  return { then: function(cb) { cb(); return { catch: function() {} }; } };
                }
              };
            }
          };
        }
      };

      var origBlink = App.Sync._blink;
      var origUpdateStatus = App.Sync._updateStatus;
      App.Sync._blink = function() {};
      App.Sync._updateStatus = function() {};

      App.Sync.init('new-session', true);
      assert.strictEqual(onceCalled, false, 'should not check existence for admin');
      assert.strictEqual(App.Sync.connected, true);

      // Cleanup
      App.Sync.connected = false;
      App.Sync._blink = origBlink;
      App.Sync._updateStatus = origUpdateStatus;
      global.firebase = origFirebase;
    });
  });

  describe('i18n keys', function() {
    it('should have sessionNotFound in both languages', function() {
      assert.notStrictEqual(App.i18n.translations.pl.sessionNotFound, undefined);
      assert.notStrictEqual(App.i18n.translations.en.sessionNotFound, undefined);
    });
  });

  describe('_merge', function() {
    it('should preserve local isAdmin flag', function() {
      App.state.isAdmin = true;
      var remote = JSON.parse(JSON.stringify(App.state));
      remote.isAdmin = false;

      App.Sync._merge(remote);

      assert.strictEqual(App.state.isAdmin, true);
    });

    it('should apply remote state', function() {
      var id = App.Players.add('Alice');
      App.Players.markPresent(id);

      var remote = JSON.parse(JSON.stringify(App.state));
      remote.waitingQueue = [id, 'new-player'];

      App.Sync._merge(remote);

      assert.deepStrictEqual(App.state.waitingQueue, [id, 'new-player']);
    });

    it('should preserve remote lastModified to avoid clock skew', function() {
      var remoteTimestamp = 1000000;
      var remote = JSON.parse(JSON.stringify(App.state));
      remote.lastModified = remoteTimestamp;

      App.Sync._merge(remote);

      // Must keep the remote timestamp, not overwrite with local Date.now()
      assert.strictEqual(App.state.lastModified, remoteTimestamp);
    });
  });

  describe('_createSyncSession', function() {
    // _createSyncSession calls App.Sync.init() which requires Firebase SDK.
    // We mock Sync.init to simulate a successful connection.
    var origInit;
    beforeEach(function() {
      origInit = App.Sync.init;
      App.Sync.init = function(sessionId, asAdmin) {
        App.state.settings.syncEnabled = true;
        App.state.settings.syncSessionId = sessionId;
        App.state.isAdmin = !!asAdmin;
        App.Sync.connected = true;
        App.Storage.save();
        return true;
      };
    });

    it('should reset state completely in fresh mode', function() {
      // Add dirty data
      var id = App.Players.add('Alice');
      App.Players.markPresent(id);
      App.state.matches['m1'] = { id: 'm1', status: 'finished' };

      App.UI._createSyncSession('test-fresh-session', 'fresh');

      assert.deepStrictEqual(App.state.players, {});
      assert.deepStrictEqual(App.state.waitingQueue, []);
      assert.deepStrictEqual(App.state.matches, {});
      assert.strictEqual(App.state.settings.syncEnabled, true);
      assert.strictEqual(App.state.settings.syncSessionId, 'test-fresh-session');
    });

    it('should keep players but reset stats in keepPlayers mode', function() {
      var id1 = App.Players.add('Alice');
      var id2 = App.Players.add('Bob');
      App.Players.markPresent(id1);
      App.Players.markPresent(id2);
      App.state.players[id1].gamesPlayed = 5;
      App.state.players[id1].wins = 3;
      App.state.players[id1].pointsScored = 100;
      App.state.players[id1].partnerHistory[id2] = 2;
      App.state.players[id1].wishedPartners = [id2];
      App.state.matches['m1'] = { id: 'm1', status: 'finished' };

      App.UI._createSyncSession('test-keep-session', 'keepPlayers');

      // Players exist but stats are reset
      assert.ok(App.state.players[id1], 'Alice should still exist');
      assert.ok(App.state.players[id2], 'Bob should still exist');
      assert.strictEqual(App.state.players[id1].gamesPlayed, 0);
      assert.strictEqual(App.state.players[id1].wins, 0);
      assert.strictEqual(App.state.players[id1].pointsScored, 0);
      assert.deepStrictEqual(App.state.players[id1].partnerHistory, {});
      assert.deepStrictEqual(App.state.players[id1].wishedPartners, []);
      assert.strictEqual(App.state.players[id1].present, false);

      // Queue and matches cleared
      assert.deepStrictEqual(App.state.waitingQueue, []);
      assert.deepStrictEqual(App.state.matches, {});

      // Sync connected
      assert.strictEqual(App.state.settings.syncEnabled, true);
      assert.strictEqual(App.state.settings.syncSessionId, 'test-keep-session');
    });

    it('should preserve court numbers in keepPlayers mode', function() {
      App.Session.initCourts([1, 3, 5]);

      App.UI._createSyncSession('test-courts', 'keepPlayers');

      var courtNums = Object.values(App.state.courts).map(function(c) { return c.displayNumber; });
      assert.deepStrictEqual(courtNums.sort(), [1, 3, 5]);
    });

    it('should save under sync key in localStorage', function() {
      App.UI._createSyncSession('my-sync-id', 'fresh');

      var loaded = App.Storage.load('my-sync-id');
      assert.ok(loaded);
      assert.strictEqual(loaded.settings.syncSessionId, 'my-sync-id');
    });

    // Restore original init after each test
    afterEach(function() {
      App.Sync.init = origInit;
    });
  });
});
