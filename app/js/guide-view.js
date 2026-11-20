// Leonida Legend — guide view.
// Renders the checklist with its filters and search, the cited guide for
// the selected trophy, the five-stage roadmap and the missable watch-outs.
// Data is the official list in data/trophies.json, loaded exactly the way
// the starter loaded it: one relative fetch, nothing else from the network.

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
  const STAGES = [
    {
      n: 1,
      title: 'Stage 1 — Story, in order',
      blurb:
        'Play the campaign in order: every chapter, named mission and the finale lives here. Actions Speak Louder starts here too — its 500 choices accumulate from the very first conversation, so engage with optional choices from the start.',
    },
    {
      n: 2,
      title: 'Stage 2 — Missable watch-outs',
      blurb:
        'Four trophies whose own descriptions tie them to one-time moments: a scripted airport visit, an opening-hours cocktail, a showroom set-piece and a unique hunt for Bret. Clear each one the moment its window opens.',
    },
    {
      n: 3,
      title: 'Stage 3 — Collectibles & counts',
      blurb:
        'The long counts and collections: stunts, shooting-range golds, races, card sets, meditation spots, areas, vehicles, garages and more. Work them region by region while the story travels, and keep the counters honest.',
    },
    {
      n: 4,
      title: 'Stage 4 — Activities & clean-up',
      blurb:
        'Everything left: the stranger-strand finales, partner set-pieces, robberies, one-off activities and the 100% completion gold. This is the mop-up stage — finish it and only the platinum remains.',
    },
    {
      n: 5,
      title: 'Stage 5 — The Platinum',
      blurb:
        'Vice Got a Price! is awarded automatically when the other 54 trophies are earned. There is nothing to do in this stage but watch it pop.',
    },
  ];

  let trophies = [];
  let activeFilter = 'all';
  let activeView = 'guide';
  let selectedId = null;
  let query = '';

  const listEl = document.getElementById('trophy-list');
  const detailEl = document.getElementById('detail');
  const chipsEl = document.getElementById('filter-chips');
  const roadmapEl = document.getElementById('roadmap');
  const missableEl = document.getElementById('missable-list');

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
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
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
    const shown = trophy.count >= 10000 ? `$${value.toLocaleString('en-US')} / $${trophy.count.toLocaleString('en-US')}` : `${value} / ${trophy.count}`;
    return `<span class="row-count">${shown}</span>`;
  }

  function renderList() {
    const visible = visibleTrophies();
    if (visible.length === 0) {
      listEl.innerHTML =
        activeFilter === 'online'
          ? `<div class="empty-state"><strong>No online trophies.</strong> The official PlayStation 5 list's 55 trophies are all earned offline — the “partner” in the partner trophies is the in-game co-protagonist, not an online player. Switch the filter to keep hunting.</div>`
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
              <span class="stage-tag">Stage ${t.stage}</span>
              ${t.missable ? '<span class="missable-badge">MISSABLE</span>' : ''}
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

  function sourcesHtml(trophy) {
    return `<h3>Sources</h3><ul class="sources">${trophy.sources
      .map(
        (s) =>
          `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`,
      )
      .join('')}</ul>`;
  }

  function counterHtml(trophy) {
    if (!trophy.count) return '';
    const value = LeonidaTracker.getCount(trophy.name);
    const pct = Math.min(100, Math.round((value / trophy.count) * 100));
    const shown =
      trophy.count >= 10000
        ? `$${value.toLocaleString('en-US')}`
        : String(value);
    const total =
      trophy.count >= 10000
        ? `$${trophy.count.toLocaleString('en-US')}`
        : String(trophy.count);
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
        <span class="stage-tag">Roadmap stage ${trophy.stage}</span>
        ${trophy.missable ? '<span class="missable-badge">MISSABLE</span>' : ''}
      </div>
      <h2>${esc(displayName(trophy))}</h2>
      <p class="official-desc">“${esc(displayDesc(trophy))}” — official description</p>
      ${trophy.missable ? `<div class="missable-banner"><strong>Missable — read before you play on</strong>${esc(trophy.missableNote)}</div>` : ''}
      <h3>The guide — in our words</h3>
      <p class="guide-text">${esc(trophy.guide)}</p>
      ${counterHtml(trophy)}
      ${sourcesHtml(trophy)}
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
  }

  /* ---------- roadmap ---------- */

  function renderRoadmap() {
    roadmapEl.innerHTML = STAGES.map((stage, index) => {
      const inStage = trophies.filter((t) => t.stage === stage.n);
      const done = inStage.filter((t) => LeonidaTracker.isEarned(t.name)).length;
      const pct = inStage.length ? Math.round((done / inStage.length) * 100) : 0;
      const chips = inStage
        .map((t) => {
          const earned = LeonidaTracker.isEarned(t.name);
          const label = isMasked(t) ? 'Hidden story trophy' : t.name;
          return `<button type="button" class="stage-chip${earned ? ' done' : ''}" data-open="${t.id}"><span class="grade-dot ${t.grade}"></span>${esc(label)}${t.missable ? '<span class="mini-miss">MISSABLE</span>' : ''}${earned ? ' ✓' : ''}</button>`;
        })
        .join('');
      return `${index > 0 ? '<div class="stage-link"></div>' : ''}<article class="stage-card">
        <div class="stage-head"><h2>${stage.title}</h2><span class="stage-progress">${done}/${inStage.length} earned</span></div>
        <p class="stage-blurb">${stage.blurb}</p>
        <div class="stage-bar"><div class="stage-fill" style="width:${pct}%"></div></div>
        <div class="stage-trophies">${chips}</div>
      </article>`;
    }).join('');
    roadmapEl.querySelectorAll('[data-open]').forEach((chip) => {
      chip.addEventListener('click', () => {
        setView('guide');
        setFilter('all');
        selectTrophy(Number(chip.dataset.open));
      });
    });
  }

  /* ---------- missables ---------- */

  function renderMissables() {
    const missables = trophies.filter((t) => t.missable);
    missableEl.innerHTML = missables
      .map(
        (t) => `<article class="missable-card">
          <span class="missable-badge">MISSABLE</span>
          <h2>${esc(t.name)}</h2>
          <p class="official-desc">“${esc(t.description)}” — official description</p>
          <p class="why"><strong>Why it can be missed:</strong> ${esc(t.missableNote)}</p>
          <p>${esc(t.guide)}</p>
          <button type="button" class="open-guide-btn" data-open="${t.id}">Open the full guide</button>
        </article>`,
      )
      .join('');
    missableEl.querySelectorAll('[data-open]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setView('guide');
        setFilter('missable');
        selectTrophy(Number(btn.dataset.open));
      });
    });
  }

  /* ---------- view + selection control ---------- */

  function renderAll() {
    renderHeader();
    renderChips();
    renderList();
    renderDetail();
    renderRoadmap();
    renderMissables();
  }

  function setView(name) {
    activeView = name;
    document.querySelectorAll('.view-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.view === name);
    });
    document.getElementById('view-guide').hidden = name !== 'guide';
    document.getElementById('view-roadmap').hidden = name !== 'roadmap';
    document.getElementById('view-missables').hidden = name !== 'missables';
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
    const response = await fetch('data/trophies.json');
    const doc = await response.json();
    trophies = doc.trophies;
    selectedId = 11; // DWNFALL — a story trophy whose cited guide opens the show
    wireControls();
    renderAll();
  }

  // A small public handle so the guide can be driven (and screenshotted)
  // view by view without simulating mouse work.
  window.LeonidaGuide = { selectTrophy, setView, setFilter, renderAll };

  loadGuideData();
})();
