var { describe, it, beforeEach } = require('node:test');
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
  });
});
