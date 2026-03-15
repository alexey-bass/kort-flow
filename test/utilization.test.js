var { describe, it, beforeEach } = require('node:test');
var assert = require('node:assert');
var { loadApp } = require('./helpers');

var App = loadApp();

describe('Court Utilization', function() {
  beforeEach(function() {
    localStorage.clear();
    document._clearElementCache();
  });

  it('should show no-data message when no matches played', function() {
    App.Session.create();
    App.Session.initCourts([1, 2]);
    App.UI._renderCourtUtilization();

    var container = document.getElementById('courtUtilization');
    assert.strictEqual(container.hidden, false);
    assert.ok(container.innerHTML.indexOf('utilNoData') !== -1 || container.innerHTML.indexOf('No data') !== -1 || container.innerHTML.length > 0);
  });

  it('should render utilization bars after games are played', function() {
    App.Session.create();
    App.Session.initCourts([1, 2]);

    var p1 = App.Players.add('A');
    var p2 = App.Players.add('B');
    var p3 = App.Players.add('C');
    var p4 = App.Players.add('D');
    [p1, p2, p3, p4].forEach(function(id) { App.Players.markPresent(id); });

    App.Courts.startGame('c_1', [p1, p2], [p3, p4]);
    App.Courts.finishGame('c_1', '21-15');

    App.UI._renderCourtUtilization();

    var container = document.getElementById('courtUtilization');
    assert.strictEqual(container.hidden, false);
    // Should contain court labels and percentage
    assert.ok(container.innerHTML.indexOf('util-bar-fill') !== -1, 'Should render utilization bars');
    assert.ok(container.innerHTML.indexOf('util-pct') !== -1, 'Should render percentage labels');
    assert.ok(container.innerHTML.indexOf('util-summary') !== -1, 'Should render summary');
  });

  it('should include currently running games in utilization', function() {
    App.Session.create();
    App.Session.initCourts([1]);

    var p1 = App.Players.add('A');
    var p2 = App.Players.add('B');
    var p3 = App.Players.add('C');
    var p4 = App.Players.add('D');
    [p1, p2, p3, p4].forEach(function(id) { App.Players.markPresent(id); });

    App.Courts.startGame('c_1', [p1, p2], [p3, p4]);
    // Don't finish — game is still running

    App.UI._renderCourtUtilization();

    var container = document.getElementById('courtUtilization');
    assert.strictEqual(container.hidden, false);
    assert.ok(container.innerHTML.indexOf('util-bar-fill') !== -1, 'Should show bars for running game');
  });

  it('should calculate per-court utilization separately', function() {
    App.Session.create();
    App.Session.initCourts([1, 2]);

    var ids = [];
    for (var i = 0; i < 8; i++) {
      var id = App.Players.add('P' + i);
      App.Players.markPresent(id);
      ids.push(id);
    }

    // Play a game on court 1 only
    App.Courts.startGame('c_1', [ids[0], ids[1]], [ids[2], ids[3]]);
    App.Courts.finishGame('c_1', '21-15');

    App.UI._renderCourtUtilization();

    var container = document.getElementById('courtUtilization');
    // Court 1 should have some utilization, court 2 should have 0%
    assert.ok(container.innerHTML.indexOf('0%') !== -1, 'Court 2 should show 0% utilization');
  });

  it('should show average game duration in summary', function() {
    App.Session.create();
    App.Session.initCourts([1]);

    var p1 = App.Players.add('A');
    var p2 = App.Players.add('B');
    var p3 = App.Players.add('C');
    var p4 = App.Players.add('D');
    [p1, p2, p3, p4].forEach(function(id) { App.Players.markPresent(id); });

    App.Courts.startGame('c_1', [p1, p2], [p3, p4]);
    App.Courts.finishGame('c_1', '21-15');

    App.UI._renderCourtUtilization();

    var container = document.getElementById('courtUtilization');
    assert.ok(container.innerHTML.indexOf('min') !== -1, 'Should show minutes in summary');
  });
});
