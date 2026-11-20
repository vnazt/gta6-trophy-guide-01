// A working gta6-trophy-guide-01 entry (Node 22, standard library only): the guide is this directory's app/ folder,
// plain static files a browser opens at app/index.html (ES modules, CSS, no build step), offline: it loads nothing
// over the network, and its trophy list and guides are app/data/trophies.json. The program hands it in: it copies app/
// and screenshots/ from beside this file to /output and writes /output/dossier.json, the summary the judge reads (your
// screenshots, the first load's files and bytes, and your source), with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// Leonida Legend: a full guide and tracker for the 55 trophies — every trophy carries a guide in our own words,
// numbered steps whose claims cite a numbered source registry (app/data/sources.json, rendered in the app's
// Sources view), tips, and dispute panels where the sources disagree; a chapter-by-chapter roadmap to the
// platinum built on the game's real mission structure; an at-risk & points-of-no-return view; filters, a spoiler
// shield, counters for the counted trophies, and progress saved in the browser with export and import. This
// program is only the plumbing that hands it in; the guide itself lives in app/.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly rather than hand in an empty guide if the app tree is not beside this file.
if (!existsSync(join(here, 'app', 'index.html')) || !existsSync(join(here, 'app', 'data', 'trophies.json'))) {
  throw new Error('Leonida Legend: app/index.html and app/data/trophies.json must sit beside main.ts.');
}

// The guide's citations are its evidence, so validate them before handing in: the registry must sit beside the
// trophy list, and every citation number used by a step or a dispute panel must resolve to a registry entry.
// A dangling citation would hand the judge a claim with no source behind it.
const registryPath = join(here, 'app', 'data', 'sources.json');
if (!existsSync(registryPath)) {
  throw new Error('Leonida Legend: app/data/sources.json (the citation registry) must sit beside trophies.json.');
}
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const registered = new Set((registry.sources ?? []).map((s) => s.n));
const trophyDoc = JSON.parse(readFileSync(join(here, 'app', 'data', 'trophies.json'), 'utf8'));
for (const trophy of trophyDoc.trophies ?? []) {
  const cited = [
    ...(trophy.steps ?? []).flatMap((step) => step.s ?? []),
    ...(trophy.disputes ?? []).flatMap((dispute) => dispute.s ?? []),
  ];
  for (const n of cited) {
    if (!registered.has(n)) {
      throw new Error(`Leonida Legend: trophy ${trophy.id} cites source [${n}], which is not in sources.json.`);
    }
  }
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

// Say what was handed in, so a local run doubles as a sanity check on the entry's size.
console.log(`Leonida Legend handed in: dossier.json is ${statSync(join(out, 'dossier.json')).size} bytes; app/ and screenshots/ copied to ${out}.`);
