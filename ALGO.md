# How the Algorithm Works

Badmixton Flow has two modes. Both use scoring to pick fair games.

---

## Queue Mode (default)

Coach taps "Suggest" on a free court. The algorithm picks players and splits teams.

### Step 1: Score each player in the queue

Every player in the queue gets a score. **Lower score = picked first.**

| Factor | Weight | Example |
|--------|--------|---------|
| Queue position | +100 per position | 1st in queue = 0, 3rd = 200 |
| Games above average | +50 per extra game | Average is 3, player has 5 → +100 |
| Unfulfilled wish | -80 per wish | Player wants to play with someone → -80 |

**Example:** 8 players in queue, average 2 games each.

| Player | Queue pos | Games | Wish | Score |
|--------|-----------|-------|------|-------|
| Anna | 1st | 2 | — | 0 |
| Bob | 2nd | 2 | — | 100 |
| Cleo | 3rd | 4 | — | 300 |
| Dan | 4th | 1 | — | 300 |
| Eva | 5th | 2 | wants Anna | 320 |

Anna (0), Bob (100), Dan (300), Cleo (300) get picked. Eva's wish bonus (-80) wasn't enough to beat queue position.

But if Eva wished for Bob and was 3rd in queue:
- Eva: 200 (position) + 0 (games) - 80 (wish) = **120** → she'd get picked.

### Step 2: Wish pull-in

If a picked player has an unfulfilled wish and the wished partner is in the top 75% of the queue, the algorithm swaps the 4th pick for the wished partner.

### Step 3: Diversify

Checks the last 10 finished matches. If 3+ of the 4 picked players were in the same recent match, swaps the lowest-priority overlapping player with someone who wasn't in that match.

**Why:** Prevents the same group from playing together repeatedly.

### Step 4: Split into teams

With 4 players, there are 3 possible team splits. Each split gets a penalty score. **Lowest penalty wins.**

| Factor | Penalty | Example |
|--------|---------|---------|
| Partner repeat | +30 per time paired before | Anna+Bob paired 2x before → +60 |
| Opponent repeat | +15 per time beyond 1st | Anna vs Cleo 3x before → +30 |
| Wish fulfilled | -100 | Anna wished for Bob, they're on same team → -100 |

**Example:** Players Anna, Bob, Cleo, Dan. Anna+Bob have played together twice.

| Split | Partner penalty | Opponent penalty | Wish | Total |
|-------|----------------|-----------------|------|-------|
| Anna+Bob vs Cleo+Dan | +60 | 0 | 0 | **60** |
| Anna+Cleo vs Bob+Dan | 0 | 0 | 0 | **0** ← wins |
| Anna+Dan vs Bob+Cleo | 0 | 0 | 0 | **0** |

The algorithm picks Anna+Cleo vs Bob+Dan (or Anna+Dan vs Bob+Cleo — tie broken by order).

### Game formats

- **4+ players available** → 2v2
- **3 players** → 2v1 (3 possible splits, each player takes a turn solo)
- **2 players** → 1v1

---

## Shuffle Mode

Coach adds players, then taps "Shuffle games" to generate a batch of games at once.

### How generation works

1. Collect all present players
2. Build **virtual history** — starts from real stats (games played, partner/opponent history), then layers on all already-scheduled games. This way game #8 "knows about" games #1–7.
3. Generate games in a loop:

### Scoring (same idea as queue mode, but no queue positions)

| Factor | Weight | Example |
|--------|--------|---------|
| Virtual games above average | +50 per extra game | Avg 3, player has 5 → +100 |
| Unfulfilled wish | -80 per wish | Player wants to play with someone → -80 |

Lower score = picked first. This ensures everyone plays roughly the same number of games.

### Batch constraint

Games are generated in **batches** of `courtCount` (e.g. 4 courts = batches of 4 games). Within a batch, **each player can only appear once**. This models reality: one batch fills all courts, next batch fills them again after those games finish.

**Example:** 12 players, 3 courts → batch of 3 games → 12 slots but some players sit out. Next batch: everyone available again.

### Diversification

After picking 4 players for a game, the algorithm runs two diversification passes.

#### Pass 1: Group overlap (3+ players from the same game)

Checks all previous schedule entries and last 10 finished matches. If **3+ of the 4** picked players were in the same earlier game, swaps the lowest-priority overlapping player with someone else.

**Example:** Game #1 was Anna+Bob vs Cleo+Dan. When generating game #5, the algorithm picks Anna, Bob, Cleo, Eva. That's 3 from game #1 (Anna, Bob, Cleo) → swap Cleo with the next best candidate.

#### Pass 2: Partner pair repeat

Checks all pairs among the 4 picked players against their virtual partner history. If two players have **already been partners** (on the same team) in any previous or scheduled game, swaps the worse-scoring of the pair with a replacement who hasn't partnered with **any** of the remaining players.

**Why "any remaining":** A naive approach that only checks the replacement against the kept partner can cascade — fixing one pair creates another. By checking against all 3 remaining players, each swap is clean and doesn't introduce new conflicts.

**Why this matters:** Without this check, two players can end up as partners repeatedly even though the team-split step penalizes it. That's because the split step only chooses among 3 possible splits — if all 3 have penalties, the pair repeats anyway.

**Example of the problem (17 players, 4 courts):**

With 17 players and 4 courts, each round uses 16 players — almost everyone plays every round. Suppose Aleksy and Renata both have low game counts (Renata arrived late). The scorer picks both for game #12, and the split pairs them. Two rounds later, both still have relatively fewer games → picked again for game #18, split pairs them again.

The 3+ group overlap check doesn't help here — only 2 of 4 players overlap, not 3. The split penalty of +100 isn't enough if the other 2 possible splits have even higher penalties (e.g. those players also have repeat histories).

**How the pair check fixes it:**

| Step | Game #12 | Game #18 (without pair check) | Game #18 (with pair check) |
|------|----------|-------------------------------|----------------------------|
| Picked | Aleksy, Renata, Bob, Cleo | Aleksy, Renata, Dan, Eva | Aleksy, **Filip**, Dan, Eva |
| vPartner[Aleksy][Renata] | 0 → OK | 1 → **repeat detected!** | Renata swapped for Filip (vPartner=0 for all remaining) |

The replacement candidate must not have a partner history with any of the remaining 3 players. If no clean replacement exists (very tight player pool), the pair stays — the algorithm does its best but doesn't force suboptimal games.

### Team splitting (stronger penalties)

Same logic as queue mode but with **higher penalties** to avoid repeats across many pre-planned games:

| Factor | Penalty | Queue mode comparison |
|--------|---------|---------------------|
| Partner repeat | +100 per time | Queue: +30 |
| Opponent repeat | +30 per time beyond 1st | Queue: +15 |
| Wish fulfilled | -100 | Same |

**Why higher?** In queue mode, the coach sees one suggestion at a time and can customize. In shuffle mode, 20+ games are generated at once — stronger penalties prevent the algorithm from drifting into repetitive pairings.

### Virtual history updates

After each generated game, the algorithm updates its virtual counters:
- Player's virtual game count +1
- Partner history +1 for teammates
- Opponent history +1 for opposing players

So game #10 has full context of games #1–9, even though none have been played yet.

---

## Quick reference: all weights

| Factor | Queue mode | Shuffle mode | Where used |
|--------|-----------|-------------|------------|
| Queue position | +100/pos | — | Player selection |
| Games above avg | +50/game | +50/game | Player selection |
| Wish (selection) | -80 | -80 | Player selection |
| Partner repeat (split) | +30/time | +100/time | Team splitting |
| Opponent repeat (split) | +15/time (>1) | +30/time (>1) | Team splitting |
| Wish (split) | -100 | -100 | Team splitting |
| Diversify: group overlap | 3+ overlap | 3+ overlap | Post-selection swap |
| Diversify: partner pair | — | vPartner > 0 | Post-selection swap (shuffle only) |

---

## Edge cases

| Situation | What happens |
|-----------|-------------|
| < 2 players | No game generated, toast message shown |
| 3 players available | 2v1 format (one player plays solo) |
| 2 players available | 1v1 format |
| Player marked absent mid-schedule | Affected games downgraded (2v2→2v1→1v1) or removed |
| All possible splits have partner repeats | Least-repeated split wins |
| Wish already fulfilled | No bonus (wish is checked off after first fulfillment) |
| Wish partner not available | Wish ignored for this round |
| Same 4 players keep getting picked | Diversification swaps one out after each occurrence |

---

## Quality criteria

The algorithm is validated by running 10 shuffle-mode simulations (17 players, 4 courts, 10 rounds, 2 late arrivals) and checking these criteria. All must pass for every run.

| Criterion | Threshold | Why |
|-----------|-----------|-----|
| **No partner pair repeats** | 0 repeated pairs | Two players should never be on the same team twice |
| **No frequent opponents** | No pair facing each other 3+ times | Opponent variety keeps games interesting |
| **No group regrouping** | No exact same 4 players in 2 games | Every game should feel like a new matchup |
| **Fair games distribution** | Max − Min ≤ 3 games | Everyone plays roughly the same number of games |
| **Late player fairness** | Late player games ≥ avg − 2 | Arriving late shouldn't mean sitting out too much |

Run `npm run simulation:validate` to check all criteria across 10 simulations.

### Why these numbers?

- **Partner pairs:** With 17 players there are C(17,2) = 136 possible pairs. A 10-round session produces ~28 matches × 2 partner pairs = ~56 slots. That's only 41% of possible pairs — plenty of room to avoid repeats.
- **Opponent threshold at 3:** With 4 players per game, each match creates 4 opponent pairs. At 28 matches = 112 opponent slots, facing someone twice is expected, but 3+ means the algorithm is clustering.
- **Games spread ≤ 3:** Mathematically, 28 matches × 4 players ÷ 17 = 6.6 avg. A spread of 2-3 is expected (some players sit out one more round); more than 3 means unfair scheduling.
- **Late fairness:** A player arriving 10 min late (missing ~1 round) should lose at most 1-2 games vs the average.
