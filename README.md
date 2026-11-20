# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/vnazt/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/vnazt/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Legend** — an offline trophy guide and tracker for Grand Theft Auto VI on PlayStation 5. All 55 official trophies are here with their official names, descriptions and grades, and this edition is researched the way the game deserves: every trophy carries a guide in our own words, broken into numbered steps, and every claim in those steps cites a numbered entry in a source registry (PowerPyx's roadmap, walkthrough and 100% guide, OutputLag, KeenGamer, HappyGamer, The Games Wiki and more — each listed in the app's Sources view with what was read, when, and how completely, including the pages that turned out unfinished or impossible to find). Where the sources disagree — the position of the final mission, a time-sensitive race, the hidden trophies' triggers — the guide shows the dispute instead of hiding it, and flags what is still unconfirmed. The roadmap follows the game's real structure: five chapters with their missions in order, the late-popping chapter trophies, a 15-slot save discipline for a game with no mission replay, and the 100% checklist's partial targets. An At-risk view covers the points of no return and the game's one genuinely at-risk trophy (a Chapter 1 meditation, requirement still unconfirmed). Progress, counters for the counted trophies and the spoiler shield are saved in the browser's localStorage and can be exported to a file and imported back. The app is plain static files: it works with the network off and loads nothing beyond its own files.

**The v3 presentation** puts that evidence where a reader lands first. The app opens on a sunlit paper-ledger layout whose audit strip is counted live from the guide's own data — trophies, steps, citations, steps backed by two or more sources, disputes shown both ways — above a three-column tracker: a compact checklist with letter-grade dots and micro-flags, the open guide, and a rail naming the next trophies up and the sources behind the open guide, with claim counts for each. Every guide leads with its numbered steps, each step ending in named citation chips (a lone source is tagged "single source"), the official description sits in a quote box at the top, and the written summary is demoted to a closing "In short:" line. The Sources view pairs the registry with a full trophy × source matrix of all 239 citations, and the At-risk view shows the one at-risk trophy's arithmetic — 1 + 8 × 2 + 1 = 18 meditations — as a visual sum rather than a warning paragraph.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. To build the hand-in dossier instead, run `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=ws8tc7yd&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
