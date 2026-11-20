// Leonida Legend — tracker state.
// Earned trophies, per-trophy counters and the spoiler shield live in
// localStorage and nowhere else: nothing is sent anywhere, and progress
// can be exported to a JSON file and imported back on another browser.

(function () {
  const STORAGE_KEY = 'leonida-legend-tracker-v1';

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          earned: new Set(Array.isArray(parsed.earned) ? parsed.earned : []),
          counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
          spoiler: !!parsed.spoiler,
        };
      }
    } catch (err) {
      /* a corrupted save falls back to a fresh tracker */
    }
    return { earned: new Set(), counts: {}, spoiler: false };
  }

  const state = loadState();

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ earned: [...state.earned], counts: state.counts, spoiler: state.spoiler }),
    );
  }

  function isEarned(name) {
    return state.earned.has(name);
  }

  function setEarned(name, on) {
    if (on) state.earned.add(name);
    else state.earned.delete(name);
    saveState();
  }

  function toggleEarned(name) {
    setEarned(name, !state.earned.has(name));
    return state.earned.has(name);
  }

  function earnedCount() {
    return state.earned.size;
  }

  function getCount(name) {
    return state.counts[name] || 0;
  }

  // Counter step scales with the target: dollars move in thousands,
  // big totals in tens, everything else one at a time.
  function countStep(total) {
    if (total >= 10000) return 1000;
    if (total >= 100) return 10;
    return 1;
  }

  function setCount(name, value, total) {
    const clamped = Math.max(0, Math.min(total, Math.round(value) || 0));
    state.counts[name] = clamped;
    if (clamped >= total) state.earned.add(name);
    saveState();
    return clamped;
  }

  function bumpCount(name, total, direction) {
    return setCount(name, getCount(name) + direction * countStep(total), total);
  }

  function getSpoiler() {
    return state.spoiler;
  }

  function setSpoiler(on) {
    state.spoiler = !!on;
    saveState();
  }

  function exportProgress() {
    const payload = JSON.stringify(
      { app: 'leonida-legend', earned: [...state.earned], counts: state.counts, spoiler: state.spoiler },
      null,
      2,
    );
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    link.download = 'leonida-legend-progress.json';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function importProgress(file) {
    const parsed = JSON.parse(await file.text());
    if (!parsed || !Array.isArray(parsed.earned)) throw new Error('Not a Leonida Legend progress file.');
    state.earned = new Set(parsed.earned.filter((n) => typeof n === 'string'));
    state.counts =
      parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {};
    state.spoiler = !!parsed.spoiler;
    saveState();
  }

  window.LeonidaTracker = {
    isEarned,
    setEarned,
    toggleEarned,
    earnedCount,
    getCount,
    setCount,
    bumpCount,
    countStep,
    getSpoiler,
    setSpoiler,
    exportProgress,
    importProgress,
  };
})();
