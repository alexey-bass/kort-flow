var { describe, it, beforeEach } = require('node:test');
var assert = require('node:assert');
var { loadApp } = require('./helpers');

var App = loadApp();

describe('_computePlayerStats', function() {
  beforeEach(function() {
    App.Session.create();
  });

  function addPlayer(name) {
    return App.Players.add(name);
  }

  function addMatch(teamA, teamB, score) {
    var id = App.Utils.generateId('m-');
    App.state.matches[id] = {
      id: id,
      teamA: teamA,
      teamB: teamB,
      score: score || null,
      status: 'finished',
      startTime: Date.now() - 600000,
      endTime: Date.now()
    };
    // Update gamesPlayed
    teamA.concat(teamB).forEach(function(pid) {
      if (App.state.players[pid]) App.state.players[pid].gamesPlayed++;
    });
    return id;
  }

  it('should return null for nonexistent player', function() {
    var result = App.UI._computePlayerStats('nonexistent');
    assert.strictEqual(result, null);
  });

  it('should return empty stats for player with no matches', function() {
    var p1 = addPlayer('Alice');
    var result = App.UI._computePlayerStats(p1);
    assert.strictEqual(result.favoritePartner, null);
    assert.strictEqual(result.mostCommonOpp, null);
    assert.strictEqual(result.bestPair, null);
    assert.deepStrictEqual(result.h2h, {});
  });

  it('should find favorite partner (most games together)', function() {
    var p1 = addPlayer('Alice');
    var p2 = addPlayer('Bob');
    var p3 = addPlayer('Carol');
    var p4 = addPlayer('Dave');

    addMatch([p1, p2], [p3, p4], '21-15');
    addMatch([p1, p2], [p3, p4], '21-18');
    addMatch([p1, p3], [p2, p4], '15-21');

    var result = App.UI._computePlayerStats(p1);
    assert.strictEqual(result.favoritePartner, p2);
    assert.strictEqual(result.favoritePartnerGames, 2);
  });

  it('should find most common opponent', function() {
    var p1 = addPlayer('Alice');
    var p2 = addPlayer('Bob');
    var p3 = addPlayer('Carol');
    var p4 = addPlayer('Dave');

    addMatch([p1, p2], [p3, p4], '21-15');
    addMatch([p1, p2], [p3, p4], '21-18');
    addMatch([p1, p3], [p2, p4], '15-21');

    var result = App.UI._computePlayerStats(p1);
    // p4 is opponent in all 3 matches, p3 only in 2 (3rd match p3 is partner)
    assert.strictEqual(result.mostCommonOpp, p4);
    assert.strictEqual(result.mostCommonOppGames, 3);
  });

  it('should compute head-to-head records', function() {
    var p1 = addPlayer('Alice');
    var p2 = addPlayer('Bob');
    var p3 = addPlayer('Carol');
    var p4 = addPlayer('Dave');

    addMatch([p1, p2], [p3, p4], '21-15'); // p1 wins vs p3,p4
    addMatch([p1, p2], [p3, p4], '10-21'); // p1 loses vs p3,p4

    var result = App.UI._computePlayerStats(p1);
    assert.strictEqual(result.h2h[p3].wins, 1);
    assert.strictEqual(result.h2h[p3].losses, 1);
    assert.strictEqual(result.h2h[p3].games, 2);
    assert.strictEqual(result.h2h[p4].wins, 1);
    assert.strictEqual(result.h2h[p4].losses, 1);
  });

  it('should find best pair with min 2 games', function() {
    var p1 = addPlayer('Alice');
    var p2 = addPlayer('Bob');
    var p3 = addPlayer('Carol');
    var p4 = addPlayer('Dave');

    // p1+p2: 2 games, 2 wins = 100%
    addMatch([p1, p2], [p3, p4], '21-15');
    addMatch([p1, p2], [p3, p4], '21-18');
    // p1+p3: 1 game, 1 win = 100% but only 1 game
    addMatch([p1, p3], [p2, p4], '21-10');

    var result = App.UI._computePlayerStats(p1);
    assert.strictEqual(result.bestPair, p2);
    assert.strictEqual(result.bestPairRate, 1);
  });

  it('should not count wins/losses for matches without score', function() {
    var p1 = addPlayer('Alice');
    var p2 = addPlayer('Bob');
    var p3 = addPlayer('Carol');
    var p4 = addPlayer('Dave');

    addMatch([p1, p2], [p3, p4], null); // no score
    addMatch([p1, p2], [p3, p4], null);

    var result = App.UI._computePlayerStats(p1);
    assert.strictEqual(result.h2h[p3].games, 2);
    assert.strictEqual(result.h2h[p3].wins, 0);
    assert.strictEqual(result.h2h[p3].losses, 0);
    // bestPair should be null (0 wins = 0% rate)
    assert.strictEqual(result.bestPair, null);
  });

  it('should compute partner stats from both team positions', function() {
    var p1 = addPlayer('Alice');
    var p2 = addPlayer('Bob');
    var p3 = addPlayer('Carol');
    var p4 = addPlayer('Dave');

    // p1 on teamA
    addMatch([p1, p2], [p3, p4], '21-15');
    // p1 on teamB
    addMatch([p3, p4], [p1, p2], '15-21');

    var result = App.UI._computePlayerStats(p1);
    assert.strictEqual(result.pairStats[p2].games, 2);
    assert.strictEqual(result.pairStats[p2].wins, 2); // won both
  });

  it('should have translations for player stats in both languages', function() {
    var keys = ['psGamesPlayed', 'psWinRate', 'psPoints', 'psAvgWait',
      'psFavoritePartner', 'psMostCommonOpponent', 'psBestPair',
      'psBestPairRate', 'psHeadToHead', 'psOpponent', 'psPlayed',
      'psRecord', 'psTimesPlayed'];

    keys.forEach(function(key) {
      App.i18n.currentLang = 'pl';
      assert.ok(App.t(key) !== key, 'Missing PL translation for ' + key);
      App.i18n.currentLang = 'en';
      assert.ok(App.t(key) !== key, 'Missing EN translation for ' + key);
    });
  });
});
