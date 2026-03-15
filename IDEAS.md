# Feature Ideas

Inspired by similar apps: Qcourt, ShuttleFlow, QSENPAI, PickleQ, PB Play, Doubles Matchmaker, RoundRobinly, Shuttle-queue.

## Fee Splitting

Auto-calculate per-player cost: (court rental + shuttlecocks) / players. Every coach does this manually now. Qcourt has two modes: "regular" (split court + shuttlecock fees separately) and "American" (combined equal split). Could weight by games played for fairness.

## Skill Rating (TrueSkill/ELO)

Rate individual players even in doubles with changing partners. Doubles Matchmaker uses TrueSkill for this. Could enable a "balanced teams" toggle in the suggestion algorithm — form teams where combined skill is roughly equal. Skill levels could be simple (A/B/C) or computed from win/loss history.

## Double-Queue Mode (Winners vs Losers)

Two separate queues: winners go to Winners Queue, losers to Non-Winners Queue. A "Next-Up" indicator alternates between queues. Over time, similarly-skilled players cluster in the same queue, producing closer matches. Could be a 3rd mode alongside "queue" and "shuffle". Documented by PK Shiu for pickleball.

## King of the Court Mode

Winners stay on court, losers go to queue end. Very popular in casual play. Shuttle-queue implements this: pairs play 2 consecutive games only if they win the first; losing pairs go to bottom; winning pairs that win 2 consecutive get rotated off. Could be a variant of queue mode or a 4th mode.

## Estimated Wait Time

We already track `totalWaitTime` and `waitCount` per player. Surface a prediction on the Board tab: "~12 min" next to each queued player. Calculate from average game duration and queue position.

## Exhaustive Partner Rotation

PB Play guarantees every player partners with every other player before any combination repeats. Stricter than our current "minimize repeats" approach. RoundRobinly uses the Whist Cyclic algorithm: each player partners with each other once and opposes each other twice. Could be an option in shuffle mode: "strict rotation" vs "smart shuffle".

## Court Utilization Metrics

Track how much time courts are active vs idle. Show percentage on the Session stats tab. QSENPAI emphasizes this as a key metric for venue managers.

## Self-Service Check-In

Let players check themselves in via QR code or PIN, reducing coach workload. The coach's tablet shows a QR code; players scan with their phone to join the queue. Some apps (PickleQ, badminton_queuing_system) do this.

## Balanced Draw with Constraints

Doubles Matchmaker has a "Mixed" mode ensuring gender-balanced teams and a "Balanced" mode using skill ratings. Could add gender tag to players and a "mixed doubles" toggle that ensures each team has one male + one female.
