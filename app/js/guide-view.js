// Leonida Legend — guide view (v2).
// Renders the checklist with its filters and search, the per-trophy guide
// with numbered steps whose every claim carries a citation chip into the
// source registry (data/sources.json), the chapter-by-chapter roadmap, the
// at-risk & points-of-no-return view, and the registry itself. Data is the
// official list in data/trophies.json plus the registry in
// data/sources.json — two relative fetches, nothing else from the network.

(function () {
  const KIND_LABELS = {
    story: 'Story',
    collectibles: 'Collectibles',
    activities: 'Activities',
    online: 'Online',
    misc: 'Free roam',
  };
  const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
  const FILTERS = [
    ['all', 'All'],
    ['story', 'Story'],
    ['missable', 'Missable'],
    ['collectibles', 'Collectibles'],
    ['activities', 'Activities'],
    ['online', 'Online'],
    ['earned', 'Earned'],
    ['remaining', 'Remaining'],
  ];

  /* ---------- roadmap data: the real structure of the game ---------- */

  const ROADMAP_RULES = [
    'Difficulty 4/10 · roughly 200 hours to the platinum · one playthrough is enough.',
    'Saves: 15 manual slots + 1 autosave. Keep one save at the start AND the end of each chapter (10 saves), rotate the remaining five for free-roam clean-up, and keep one untouched save from just before the final mission.',
    'There is no mission replay. What a chapter gate closes stays closed — the At-risk view lists every gate and what it takes.',
    'Cheats disable trophies AND saving while they are active. If you experiment, do it on a throwaway save.',
    'Free-roam continues after the story, and everything on the 100% checklist remains accessible there.',
    'Reading the map: main missions are a pink icon with black letters, optional missions a black icon with pink letters, side tasks purple. An hourglass means time-sensitive — those expire, but none of them carries a trophy.',
  ];
  const ROADMAP_RULE_CITES = [[2, 13], [2, 13, 15], [2, 15], [2, 14], [2, 14], [2, 3]];

  const CHAPTERS = [
    {
      n: 1,
      title: "Chapter 1 — The Keys & Jason's house",
      missions:
        'Gone Fishing · Gear Up · Lab Fees · Just a Scratch · Unwanted Attention · Pipework · Hey Arnold! · Island Dreams · Feng Shui · Coming Home · Clean Up After Donnie · Buck Me · Down to Earth · Deposit Cash Into BuckMe · Save for the Future · Day Release · Clear Skies · Building a Life · Swamped · Don Gone · Donnie’s Lost Drugs · Recalibration · Tourist Trap · Home Sweet Home · Discharge Time',
      optional:
        'Plus 12 optional missions riding along — Shirley’s two errands, Lucia’s pre-release errands, Find the Lost Drugs among them. Several die at Tourist Trap (see the At-risk view); none carries a trophy.',
      blurb:
        'The long opening chapter. Two things to do before it ends: Lucia’s balcony meditation after Down to Earth (the game’s one at-risk trophy — see its guide), and at least $5,000 moved into Family Savings before Tourist Trap. Kenton’s strand starts here (Island Dreams) and Cal’s fishing challenge unlocks after Feng Shui.',
      pops: 'Just Like Paradise pops after Gone Fishing. Paradise Lost does NOT pop in this chapter — it waits for What’s in the Bag? in Chapter 2.',
      trophyIds: [2, 3],
      cites: [3],
    },
    {
      n: 2,
      title: 'Chapter 2 — The Starlet Motel & the move south',
      missions:
        'What’s in the Bag? · Take Care of Jason · Overnight Charges · Just Moved In · Girl’s Trip · Moses · New Look · How Do I Look? · Painkiller Supplier · Ambulance Chaser · Behind on Payments · Slam Dunk · Daily Driver · Breakfast Run · Coffee Break · Prepare for Vice City · Afternoon Delight · Checking Out',
      optional:
        'Plus Kyle’s farm quests, Billy’s Thrillbillies, Hit Avery Pawn, Hit Kingpin Bowling and Bret’s Veteran Hunted among the optionals.',
      blurb:
        'Coffee Break is the hinge of the whole game: from then on Jason and Lucia can free-roam, train and meditate together, and half the systems in this guide open up. The chapter ends at Checking Out, which demands every other main mission done and $15,000 in hand — and closes the Starlet Motel for good.',
      pops: 'Trust pops during Breakfast Run. T**s Ass Drug Money waits for Welcome to Vice City in Chapter 3.',
      trophyIds: [4, 8],
      cites: [3],
    },
    {
      n: 3,
      title: 'Chapter 3 — Vice City & the Cartel Heist',
      missions:
        'Welcome to Vice City · Dealer’s Choice · Dubious Provenance · Mami Knows Best · Here, Kitty Kitty · Send Money to Lorena · Encrypted Hard Drive · Boobie Time · Meet the Heders · Yasmani’s Jewelry Jobs · Car Service · Send More Money to Lorena · Top Billing · First Impressions · Crosstown Traffic · Credit Check · Clonin’ Keys, Makin’ GS · Ride Or Die · Raul’s Next Job · the Cartel Heist chain (Scope Out the Bank · Security Expert · Caught Slipping · Heist Planning · Company Property · Safe Word · The Missing Link · Hidden Charges) · Cooties · Bricked Up · South Leonida Real Estate · The Cartel Heist',
      optional:
        'Plus Yago’s races (Race Against Yago is the disputed one — do it on sight), the starts of Andy’s and Tyrone’s strands, Mall Rats and Brother To Brother.',
      blurb:
        'Credit Check is the economy’s hinge: Bank Jobs, Payday Loans and the Dye Pack Jammer all unlock there. The chapter itself is built around a single job — the Sinfrontera National Bank.',
      pops: 'Break the Bank pops during The Cartel Heist. Vice City, Baby! waits for Ocean Beach AND Another Life in Chapter 4.',
      trophyIds: [5, 9],
      cites: [3],
    },
    {
      n: 4,
      title: 'Chapter 4 — The VCIA Takedown',
      missions:
        'Ocean Beach · Another Life · Pool Day · Company Cars · Lawyer Up · Heavy Lifting · Party Hard · Pay Abe’s Fee · Photo/Shoot · the VCIA Takedown chain (Making Gainz · Blood Sweat and Gear · Too Much Baggage · Watch It · Amateur Hour · Call Nate · Cash Injections · Dirty Work · Nate Will Be in Touch) · Adventures in Babysitting · Rafa’s Kidnapping · Fresh Evidence · Child’s Play · Power Play · Close Surveillance · Delivery Method · Team Building · Fully Catered · Heist Plans in Place · Headliners · VCIA Takedown · Tie Up Loose Ends · Call Valentina Back · Sunset · Starting From Zero',
      optional:
        'One optional matters more than the rest: That’s Where The Money Is… unlocks the large bank vaults — do it early in the chapter.',
      blurb:
        'The longest chapter of the game. Three story trophies hide inside it — Child’s Play, Headliners and the Takedown itself — and its optional vault mission quietly unlocks two more trophies’ worth of content (Maximum Withdrawal and A Classic Blitz Play).',
      pops: 'Family Matters, DWNFALL and Hi-Jacked pop during their missions. Top Of The World, Ma pops after Starting From Zero — and where the final-mission trophy sits after that is disputed; see its dispute panel.',
      trophyIds: [6, 7, 10, 11, 12],
      cites: [3],
    },
    {
      n: 5,
      title: 'Chapter 5 — The endgame',
      missions:
        'Bird in the Hand · Taking Liberties · Doggie Bag · VC Baby · Operation Savage Glory · Honest Abe · Unfinished Business · Pay Abe’s Fee · Protective Custody · The End of the Road',
      optional: '',
      blurb:
        'Ten missions, and nothing in this chapter is missable. When it ends, the game hands you back the open world with side missions, robberies and collectibles still available.',
      pops: 'Snow Storm pops during Operation Savage Glory, midway through the chapter.',
      trophyIds: [13],
      cites: [3],
    },
  ];

  const CHECKLIST_PARTIALS = [
    'Story & Tasks: 100 optional tasks (200–300+ exist; vehicle deliveries for Moses and Randy count, and every meditation counts), 39/39 Gang Operations, 22/22 Bank Jobs, 7/7 Payday Loan Jobs, 34/35 Smash ’N’ Grabs, 50/91 Stick Ups, $100,000 each of narcotics and jewelry fenced, $250,000 of marked bills, 8/8 Vaults Hit, $200,000 of vehicles fenced.',
    'Exploration & Activities: 5/7 Kenton Sets, 15/18 Collectible Card Sets, 100 WAiNK locations, 33/33 Underwater Discoveries, 30/34 Magazines, Books & Comics, 15/18 Meditation Spots, 100/125 Cocaine Flamingos, 70/79 Discovered Styles, 30/40 Unique Races Won, 42/42 Shooting Range Gold Medals, 42/42 Drone Time Trials, 300/397 Stunts, 70/80 Challenges, 15/15 Bret’s Target Decks.',
    'Discovery: 200/277 base model vehicles scanned (the 280 fixed-location “Standout Vehicles” do not count), 50/66 standard-issue weapons, 100/255 animals studied.',
    'All-or-nothing: only Robberies, Underwater Discoveries, Shooting Ranges, Drone Races and Bret’s Quests must be done in full — everything else is a partial target.',
  ];

  /* ---------- at-risk & points of no return (static cards) ---------- */

  const PONR_CARDS = [
    {
      badge: 'Point of no return',
      tone: 'danger',
      title: 'Tourist Trap — end of Chapter 1',
      cites: [15],
      body: [
        'Starting Tourist Trap (its opening objective is “Take Up Mattia’s Offer”) locks you into a three-mission run — Tourist Trap, Home Sweet Home, Discharge Time — straight into Chapter 2 with no free-roam between, and Jason is then unplayable for a long stretch.',
        'Lost when Chapter 1 ends: Jason’s house (for the rest of the game), all wallet cash, floor-stash money, the BuckMe balance, every personal vehicle including Ultimate Edition ones and their upgrades, and Jason’s fitness levels (temporary — he starts Chapter 2 bedridden and lowered).',
        'Kept: Family Savings investments made through BuckMe (up to $5,000 survive), the relationship level with Lucia, and unique weapons, which can never be lost.',
        'Before you start it: move at least $5,000 into Family Savings, sell held narcotics to Donnie (his Drop-Off pays more than Brian’s and closes around Clear Skies), and finish any Chapter 1 errands you care about.',
      ],
    },
    {
      badge: 'Point of no return',
      tone: 'danger',
      title: 'Checking Out — end of Chapter 2',
      cites: [15],
      body: [
        'Checking Out only starts once every other Chapter 2 main mission is finished and you hold at least $15,000 — and starting it removes the Starlet Motel as a home for good.',
        'Homes close chapter by chapter: Jason’s house after Chapter 1, the Starlet Motel after Chapter 2, the Vice City apartment after Chapter 3. The two collectible cards inside the motel both have duplicate copies elsewhere, so no card set can be blocked by this gate.',
      ],
    },
    {
      badge: 'Disputed',
      tone: 'dispute',
      title: 'Race Against Yago — Chapter 3',
      cites: [3, 12, 14, 15],
      body: [
        'The one other trophy-adjacent argument in the sources. The walkthrough marks this Yago quest time-sensitive and missable, and the Yago strand counts toward Strangers & Freaks; two guides warn that missing the race could cost that trophy.',
        'The Games Wiki lists the same race as time-limited but states it is “not needed for trophies or 100%”, and says the exact cut-off has not been established.',
        'Our advice, and every guide’s: do it the moment it appears. First place pays $3,800 and the detour costs minutes.',
      ],
    },
    {
      badge: 'Also time-sensitive',
      tone: 'warn',
      title: 'Smaller windows — no trophies attached',
      cites: [3, 14, 15],
      body: [
        'Shirley’s two errands (Get Shirley’s Rum, Steal the Scooter), Ring the Bell! at the start of Swamped, Find the Lost Drugs, and Lucia’s pre-release errands all die during Chapter 1. They pay in money, clothes and relationship rating — never in trophies or checklist progress.',
        'Hourglass optional missions expire shortly after appearing, and some other optionals vanish after the next few story missions; again, none affects a trophy. In Chapter 4, This Is a Free Call From… (picking up Shayna, Lucia-only) is also time-sensitive with an unestablished cut-off — its strand does not count for trophies either.',
        'Two fences close for good: Donnie (around the end of Swamped / start of Clear Skies — the exact point is itself unconfirmed) and Brian (after Chapter 1). Neither has quests; new fences replace them.',
      ],
    },
    {
      badge: 'Confirmed safe',
      tone: 'safe',
      title: 'What the gates cannot take',
      cites: [2, 4, 14, 15],
      body: [
        'Everything on the 100% checklist — nothing it requires is missable, and the checklist needs only 15 of 18 meditations.',
        'Kenton’s questline pauses after Chapter 1 and returns in Chapters 2–3; all seven shipwrecks stay available. Every Strangers & Freaks strand, and every strand finale, stays open in post-story free-roam.',
        'Let’s Go Bowling’s three valuables can be gathered across multiple visits (the operation respawns), gang operations respawn if a key valuable was missed, and the home video games return in Chapter 3 after a dark Chapter 2.',
      ],
    },
  ];

  /* ---------- state ---------- */

  let trophies = [];
  let registry = new Map();
  let activeFilter = 'all';
  let selectedId = null;
  let query = '';

  const listEl = document.getElementById('trophy-list');
  const detailEl = document.getElementById('detail');
  const chipsEl = document.getElementById('filter-chips');
  const roadmapEl = document.getElementById('roadmap');
  const missableEl = document.getElementById('missable-list');
  const sourcesEl = document.getElementById('sources-list');

  function esc(text) {
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function byId(id) {
    return trophies.find((t) => t.id === id);
  }

  function isMasked(trophy) {
    return (
      LeonidaTracker.getSpoiler() &&
      trophy.kind === 'story' &&
      !LeonidaTracker.isEarned(trophy.name)
    );
  }

  function displayName(trophy) {
    return isMasked(trophy) ? 'Hidden story trophy' : trophy.name;
  }

  function displayDesc(trophy) {
    return isMasked(trophy)
      ? 'Spoiler shield is on: this story trophy reveals itself once you earn it.'
      : trophy.description;
  }

  function matchesFilter(trophy) {
    switch (activeFilter) {
      case 'all':
        return true;
      case 'missable':
        return !!trophy.missable;
      case 'earned':
        return LeonidaTracker.isEarned(trophy.name);
      case 'remaining':
        return !LeonidaTracker.isEarned(trophy.name);
      default:
        return trophy.kind === activeFilter;
    }
  }

  function matchesQuery(trophy) {
    if (!query) return true;
    const stepsText = (trophy.steps || []).map((s) => s.t).join(' ');
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${stepsText}`.toLowerCase();
    return haystack.includes(query);
  }

  function visibleTrophies() {
    return trophies.filter((t) => matchesFilter(t) && matchesQuery(t));
  }

  function filterCount(key) {
    if (key === 'all') return trophies.length;
    return trophies.filter((t) =>
      key === 'missable'
        ? !!t.missable
        : key === 'earned'
          ? LeonidaTracker.isEarned(t.name)
          : key === 'remaining'
            ? !LeonidaTracker.isEarned(t.name)
            : t.kind === key,
    ).length;
  }

  /* ---------- citations ---------- */

  function citeHtml(ids) {
    if (!ids || ids.length === 0) return '';
    return `<span class="cites">${ids
      .map((n) => {
        const src = registry.get(n);
        const label = src ? `${src.short} — ${src.title}` : `Source ${n}`;
        return `<button type="button" class="cite" data-source="${n}" title="${esc(label)}">[${n}]</button>`;
      })
      .join('')}</span>`;
  }

  function citedIds(trophy) {
    const set = new Set();
    (trophy.steps || []).forEach((s) => (s.s || []).forEach((n) => set.add(n)));
    (trophy.disputes || []).forEach((d) => (d.s || []).forEach((n) => set.add(n)));
    return [...set].sort((a, b) => a - b);
  }

  function wireCites(root) {
    root.querySelectorAll('.cite').forEach((chip) => {
      chip.addEventListener('click', () => {
        setView('sources');
        const card = document.getElementById(`source-${chip.dataset.source}`);
        if (card) {
          card.scrollIntoView({ block: 'center' });
          card.classList.add('flash');
          setTimeout(() => card.classList.remove('flash'), 1600);
        }
      });
    });
  }

  /* ---------- header ---------- */

  function renderHeader() {
    const total = trophies.length || 55;
    const earned = LeonidaTracker.earnedCount();
    document.getElementById('earned-count').textContent = String(earned);
    document.getElementById('percent').textContent = `${Math.round((earned / total) * 100)}%`;
    document.getElementById('progress-fill').style.width = `${(earned / total) * 100}%`;
    document.getElementById('grade-counts').innerHTML = GRADE_ORDER.map((grade) => {
      const inGrade = trophies.filter((t) => t.grade === grade);
      const done = inGrade.filter((t) => LeonidaTracker.isEarned(t.name)).length;
      const label = grade[0].toUpperCase() + grade.slice(1);
      return `<span class="grade-count" style="color: var(--${grade})">${label} ${done}/${inGrade.length}</span>`;
    }).join('');
    const toggle = document.getElementById('spoiler-toggle');
    toggle.textContent = `Spoiler shield: ${LeonidaTracker.getSpoiler() ? 'ON' : 'OFF'}`;
    toggle.classList.toggle('on', LeonidaTracker.getSpoiler());
  }

  /* ---------- filter chips ---------- */

  function renderChips() {
    chipsEl.innerHTML = FILTERS.map(
      ([key, label]) =>
        `<button type="button" class="chip${key === activeFilter ? ' active' : ''}" data-filter="${key}">${label} <span class="chip-count">${filterCount(key)}</span></button>`,
    ).join('');
    chipsEl.querySelectorAll('.chip').forEach((chip) => {
      chip.addEventListener('click', () => setFilter(chip.dataset.filter));
    });
  }

  /* ---------- trophy list ---------- */

  function counterText(trophy) {
    if (!trophy.count) return '';
    const value = LeonidaTracker.getCount(trophy.name);
    const shown =
      trophy.count >= 10000
        ? `$${value.toLocaleString('en-US')} / $${trophy.count.toLocaleString('en-US')}`
        : `${value} / ${trophy.count}${trophy.unit ? ` ${esc(trophy.unit)}` : ''}`;
    return `<span class="row-count">${shown}</span>`;
  }

  function renderList() {
    const visible = visibleTrophies();
    if (visible.length === 0) {
      listEl.innerHTML =
        activeFilter === 'online'
          ? `<div class="empty-state"><strong>No online trophies.</strong> The official PlayStation 5 list's 55 trophies are all earned offline — the “partner” in the partner trophies is the in-game co-protagonist, not an online player. Switch the filter to keep hunting.</div>`
          : activeFilter === 'missable'
            ? `<div class="empty-state"><strong>Only one trophy is at risk.</strong> Positive Mental Attitude is the single missable-flagged trophy in this guide — and even its requirement is unconfirmed. See the At-risk view for the full picture.</div>`
            : `<div class="empty-state"><strong>Nothing matches.</strong> Try a different filter or clear the search box.</div>`;
      return;
    }
    listEl.innerHTML = visible
      .map((t) => {
        const earned = LeonidaTracker.isEarned(t.name);
        return `<button type="button" class="trophy-row${earned ? ' earned' : ''}${t.id === selectedId ? ' selected' : ''}" data-id="${t.id}">
          <input type="checkbox" data-earn="${t.id}" ${earned ? 'checked' : ''} aria-label="Mark ${esc(displayName(t))} as earned">
          <span class="row-main">
            <span class="row-name">${esc(displayName(t))}</span>
            <span class="row-desc" style="display:block">${esc(displayDesc(t))}</span>
            <span class="row-meta">
              <span class="grade-badge ${t.grade}">${t.grade}</span>
              <span class="kind-tag">${KIND_LABELS[t.kind]}</span>
              ${t.chapterLabel ? `<span class="stage-tag">${esc(t.chapterLabel)}</span>` : ''}
              ${t.missable ? '<span class="missable-badge">AT RISK</span>' : ''}
              ${t.unconfirmed ? '<span class="unconfirmed-badge">UNCONFIRMED</span>' : ''}
              ${counterText(t)}
            </span>
          </span>
        </button>`;
      })
      .join('');
    listEl.querySelectorAll('.trophy-row').forEach((row) => {
      row.addEventListener('click', (event) => {
        if (event.target.matches('input[type="checkbox"]')) return;
        selectTrophy(Number(row.dataset.id));
      });
    });
    listEl.querySelectorAll('input[data-earn]').forEach((box) => {
      box.addEventListener('click', (event) => event.stopPropagation());
      box.addEventListener('change', () => {
        const trophy = byId(Number(box.dataset.earn));
        LeonidaTracker.setEarned(trophy.name, box.checked);
        renderAll();
      });
    });
  }

  /* ---------- detail panel ---------- */

  function stepsHtml(trophy) {
    if (!trophy.steps || trophy.steps.length === 0) return '';
    const items = trophy.steps
      .map(
        (s) =>
          `<li class="step-item"><span class="step-text">${esc(s.t)}</span>${citeHtml(s.s)}</li>`,
      )
      .join('');
    return `<h3>Steps</h3><ol class="steps">${items}</ol>`;
  }

  function tipsHtml(trophy) {
    if (!trophy.tips || trophy.tips.length === 0) return '';
    return `<h3>Time-savers</h3><ul class="tips">${trophy.tips
      .map((tip) => `<li>${esc(tip)}</li>`)
      .join('')}</ul>`;
  }

  function disputesHtml(trophy) {
    if (!trophy.disputes || trophy.disputes.length === 0) return '';
    return trophy.disputes
      .map(
        (d) => `<div class="dispute-box">
          <strong class="dispute-topic">Sources disagree — ${esc(d.topic)}</strong>
          <p><span class="side-label">One side:</span> ${esc(d.a)}</p>
          <p><span class="side-label">The other:</span> ${esc(d.b)}</p>
          <div class="dispute-cites">${citeHtml(d.s)}</div>
        </div>`,
      )
      .join('');
  }

  function citedSourcesHtml(trophy) {
    const ids = citedIds(trophy);
    if (ids.length === 0) return '';
    const items = ids
      .map((n) => {
        const src = registry.get(n);
        if (!src) return '';
        const title = src.url
          ? `<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.title)}</a>`
          : esc(src.title);
        return `<li><span class="cite-static">[${n}]</span> <strong>${esc(src.short)}</strong> — ${title}</li>`;
      })
      .join('');
    return `<h3>Cited in this guide</h3><ul class="sources cited-list">${items}</ul>`;
  }

  function counterHtml(trophy) {
    if (!trophy.count) return '';
    const value = LeonidaTracker.getCount(trophy.name);
    const pct = Math.min(100, Math.round((value / trophy.count) * 100));
    const shown =
      trophy.count >= 10000 ? `$${value.toLocaleString('en-US')}` : String(value);
    const total =
      trophy.count >= 10000
        ? `$${trophy.count.toLocaleString('en-US')}`
        : `${trophy.count}${trophy.unit ? ` ${esc(trophy.unit)}` : ''}`;
    return `<h3>Your count</h3><div class="counter-box">
        <button type="button" class="counter-btn" data-bump="-1" aria-label="Decrease count">−</button>
        <span class="counter-value">${shown}</span>
        <span class="counter-total">/ ${total}</span>
        <span class="counter-bar"><span class="counter-fill" style="display:block;width:${pct}%"></span></span>
        <button type="button" class="counter-btn" data-bump="1" aria-label="Increase count">+</button>
      </div>`;
  }

  function renderDetail() {
    const trophy = byId(selectedId) || trophies[0];
    if (!trophy) {
      detailEl.innerHTML = '';
      return;
    }
    selectedId = trophy.id;
    const earned = LeonidaTracker.isEarned(trophy.name);
    detailEl.innerHTML = `<article class="detail-card">
      <div class="row-meta">
        <span class="grade-badge ${trophy.grade}">${trophy.grade}</span>
        <span class="kind-tag">${KIND_LABELS[trophy.kind]}</span>
        ${trophy.chapterLabel ? `<span class="stage-tag">${esc(trophy.chapterLabel)}</span>` : ''}
        ${trophy.missable ? '<span class="missable-badge">AT RISK — UNCONFIRMED</span>' : ''}
        ${trophy.unconfirmed ? '<span class="unconfirmed-badge">UNCONFIRMED</span>' : ''}
      </div>
      <h2>${esc(displayName(trophy))}</h2>
      <p class="official-desc">“${esc(displayDesc(trophy))}” — official description</p>
      ${trophy.mission ? `<p class="mission-line"><strong>${esc(trophy.mission)}</strong>${trophy.popsNote ? ` · ${esc(trophy.popsNote)}` : ''}</p>` : ''}
      ${trophy.missable ? `<div class="missable-banner"><strong>At risk — read before you play on</strong>${esc(trophy.missableNote)}</div>` : ''}
      <h3>The guide — in our words</h3>
      <p class="guide-text">${esc(trophy.guide)}</p>
      ${stepsHtml(trophy)}
      ${tipsHtml(trophy)}
      ${disputesHtml(trophy)}
      ${trophy.unconfirmed ? `<div class="unconfirmed-box"><strong>Still unconfirmed</strong>${esc(trophy.unconfirmed)}</div>` : ''}
      ${counterHtml(trophy)}
      ${citedSourcesHtml(trophy)}
      <button type="button" class="earn-btn${earned ? ' earned' : ''}" id="detail-earn">${earned ? '✓ Earned — tap to undo' : 'Mark as earned'}</button>
    </article>`;
    detailEl.querySelector('#detail-earn').addEventListener('click', () => {
      LeonidaTracker.toggleEarned(trophy.name);
      renderAll();
    });
    detailEl.querySelectorAll('[data-bump]').forEach((btn) => {
      btn.addEventListener('click', () => {
        LeonidaTracker.bumpCount(trophy.name, trophy.count, Number(btn.dataset.bump));
        renderAll();
      });
    });
    wireCites(detailEl);
  }

  /* ---------- roadmap ---------- */

  function trophyChips(ids) {
    return ids
      .map((id) => {
        const t = byId(id);
        if (!t) return '';
        const earned = LeonidaTracker.isEarned(t.name);
        const label = isMasked(t) ? 'Hidden story trophy' : t.name;
        return `<button type="button" class="stage-chip${earned ? ' done' : ''}" data-open="${t.id}"><span class="grade-dot ${t.grade}"></span>${esc(label)}${t.missable ? '<span class="mini-miss">AT RISK</span>' : ''}${earned ? ' ✓' : ''}</button>`;
      })
      .join('');
  }

  function stageCard({ title, blurb, extra, ids, linkBefore }) {
    const inCard = ids.map(byId).filter(Boolean);
    const done = inCard.filter((t) => LeonidaTracker.isEarned(t.name)).length;
    const pct = inCard.length ? Math.round((done / inCard.length) * 100) : 0;
    return `${linkBefore ? '<div class="stage-link"></div>' : ''}<article class="stage-card">
      <div class="stage-head"><h2>${title}</h2><span class="stage-progress">${done}/${inCard.length} earned</span></div>
      ${blurb ? `<p class="stage-blurb">${blurb}</p>` : ''}
      ${extra || ''}
      <div class="stage-bar"><div class="stage-fill" style="width:${pct}%"></div></div>
      <div class="stage-trophies">${trophyChips(ids)}</div>
    </article>`;
  }

  function renderRoadmap() {
    const rulesExtra = `<ul class="rules-list">${ROADMAP_RULES.map(
      (rule, i) => `<li>${esc(rule)} ${citeHtml(ROADMAP_RULE_CITES[i])}</li>`,
    ).join('')}</ul>`;
    let html = stageCard({
      title: 'Step 1 — The story (60–80 hours)',
      blurb:
        'Play the campaign in order and scan vehicles and animals as you meet them. The five chapter cards below are the spine of the run; the rules above them are the discipline that makes one playthrough enough.',
      extra: rulesExtra,
      ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      linkBefore: false,
    });
    CHAPTERS.forEach((ch) => {
      const extra = `<p class="mission-list">${esc(ch.missions)}</p>${
        ch.optional ? `<p class="stage-blurb">${esc(ch.optional)}</p>` : ''
      }<p class="pops-line">${esc(ch.pops)} ${citeHtml(ch.cites)}</p>`;
      html += stageCard({
        title: ch.title,
        blurb: ch.blurb,
        extra,
        ids: ch.trophyIds,
        linkBefore: true,
      });
    });
    const checklistExtra = `<ul class="rules-list">${CHECKLIST_PARTIALS.map(
      (line) => `<li>${esc(line)}</li>`,
    ).join('')}</ul>`;
    html += stageCard({
      title: 'Step 2 — 100% checklist & challenges (about 100 hours)',
      blurb:
        'After the story, the checklist at Progress > Stats > 100% Completion becomes visible and counts everything you already did. It represents roughly 60% of true completion:',
      extra: checklistExtra,
      ids: [14, 15, 17, 18, 19, 28, 30, 31, 32, 35, 40, 42, 43, 54, 55],
      linkBefore: true,
    });
    html += stageCard({
      title: 'Step 3 — Strangers, finales & clean-up (about 10 hours)',
      blurb:
        'Everything left: the stranger-strand finales and their own trophies, the partner set-pieces, robberies, one-off activities and the hidden five — each with its steps and citations in the guide.',
      extra: '',
      ids: [16, 20, 21, 22, 23, 24, 25, 26, 27, 29, 33, 34, 36, 37, 38, 39, 41, 44, 45, 46, 47, 49, 50, 51, 52, 53],
      linkBefore: true,
    });
    html += stageCard({
      title: 'The Platinum — Vice Got a Price!',
      blurb:
        'Awarded automatically when the other 54 trophies are earned. Nothing to do here but watch it pop.',
      extra: '',
      ids: [1],
      linkBefore: true,
    });
    roadmapEl.innerHTML = html;
    roadmapEl.querySelectorAll('[data-open]').forEach((chip) => {
      chip.addEventListener('click', () => {
        setView('guide');
        setFilter('all');
        selectTrophy(Number(chip.dataset.open));
      });
    });
    wireCites(roadmapEl);
  }

  /* ---------- at-risk & points of no return ---------- */

  function renderMissables() {
    const pma = byId(28);
    let html = '';
    if (pma) {
      html += `<article class="missable-card">
        <span class="missable-badge">AT RISK — UNCONFIRMED</span>
        <h2>${esc(pma.name)}</h2>
        <p class="official-desc">“${esc(pma.description)}” — official description</p>
        <p class="why"><strong>The one trophy to protect:</strong> ${esc(pma.missableNote)}</p>
        <p>${esc(pma.guide)}</p>
        <button type="button" class="open-guide-btn" data-open="${pma.id}">Open the full guide — steps &amp; citations</button>
      </article>`;
    }
    html += PONR_CARDS.map(
      (card) => `<article class="missable-card tone-${card.tone}">
        <span class="missable-badge tone-${card.tone}">${esc(card.badge)}</span>
        <h2>${esc(card.title)}</h2>
        ${card.body.map((p) => `<p>${esc(p)}</p>`).join('')}
        <div class="dispute-cites">${citeHtml(card.cites)}</div>
      </article>`,
    ).join('');
    missableEl.innerHTML = html;
    missableEl.querySelectorAll('[data-open]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setView('guide');
        setFilter('missable');
        selectTrophy(Number(btn.dataset.open));
      });
    });
    wireCites(missableEl);
  }

  /* ---------- sources registry ---------- */

  function renderSources() {
    const entries = [...registry.values()].sort((a, b) => a.n - b.n);
    sourcesEl.innerHTML =
      entries
        .map(
          (src) => `<article class="source-card" id="source-${src.n}">
          <div class="source-num">[${src.n}]</div>
          <div class="source-body">
            <h2>${esc(src.short)}</h2>
            <p class="source-title">${
              src.url
                ? `<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.title)}</a>`
                : esc(src.title)
            }</p>
            <p class="source-meta">${esc(src.host)} · ${esc(src.kind)} · read ${esc(src.read)}</p>
            <p class="source-note">${esc(src.note)}</p>
          </div>
        </article>`,
        )
        .join('') +
      `<p class="sources-footnote">Anything not in this registry — pages that refused us, pages seen only as search-result snippets — was used, at most, as a lead. It is never cited as evidence in the guides.</p>`;
  }

  /* ---------- view + selection control ---------- */

  function renderAll() {
    renderHeader();
    renderChips();
    renderList();
    renderDetail();
    renderRoadmap();
    renderMissables();
    renderSources();
  }

  function setView(name) {
    document.querySelectorAll('.view-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.view === name);
    });
    document.getElementById('view-guide').hidden = name !== 'guide';
    document.getElementById('view-roadmap').hidden = name !== 'roadmap';
    document.getElementById('view-missables').hidden = name !== 'missables';
    document.getElementById('view-sources').hidden = name !== 'sources';
  }

  function setFilter(name) {
    activeFilter = name;
    renderChips();
    renderList();
  }

  function selectTrophy(id) {
    selectedId = id;
    renderList();
    renderDetail();
  }

  function wireControls() {
    document.querySelectorAll('.view-tab').forEach((tab) => {
      tab.addEventListener('click', () => setView(tab.dataset.view));
    });
    document.getElementById('search').addEventListener('input', (event) => {
      query = event.target.value.trim().toLowerCase();
      renderList();
    });
    document.getElementById('spoiler-toggle').addEventListener('click', () => {
      LeonidaTracker.setSpoiler(!LeonidaTracker.getSpoiler());
      renderAll();
    });
    document.getElementById('export-btn').addEventListener('click', () => {
      LeonidaTracker.exportProgress();
    });
    document.getElementById('import-file').addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        await LeonidaTracker.importProgress(file);
        renderAll();
      } catch (err) {
        /* an unreadable file simply leaves the tracker untouched */
      }
      event.target.value = '';
    });
  }

  async function loadGuideData() {
    const [trophyResponse, sourcesResponse] = await Promise.all([
      fetch('data/trophies.json'),
      fetch('data/sources.json'),
    ]);
    const doc = await trophyResponse.json();
    const registryDoc = await sourcesResponse.json();
    trophies = doc.trophies;
    registry = new Map((registryDoc.sources || []).map((s) => [s.n, s]));
    selectedId = 28; // Positive Mental Attitude — the at-risk trophy whose cited steps open the show
    wireControls();
    renderAll();
  }

  // A small public handle so the guide can be driven (and screenshotted)
  // view by view without simulating mouse work.
  window.LeonidaGuide = { selectTrophy, setView, setFilter, renderAll };

  loadGuideData();
})();
