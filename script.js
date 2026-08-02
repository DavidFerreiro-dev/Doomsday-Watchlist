/* ══════════════════════════════════════════════════════════
   WHICH MOVIES AM I MISSING BEFORE AVENGERS: DOOMSDAY?
   script.js v3.0 — Render-first, progressive TMDB loading
   ══════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════════════
   § 1  CONFIGURATION
   ═══════════════════════════════════════════════════════════ */
const CONFIG = {
  TOKEN: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MWE2Yzk5YWVlMjA5MTc3ODY2NjZjMzhhODczOWU2YSIsIm5iZiI6MTc2MTk0NTEyNS4zOTEsInN1YiI6IjY5MDUyNjI1OTBmMzM4Mzc2MjRjN2NiNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ebK9-2YoYZRKBQDHN3uhWMhEyyi77hOUD6ZTSfzWGPI',
  TMDB_BASE: 'https://api.themoviedb.org/3',
  TMDB_W342: 'https://image.tmdb.org/t/p/w342',
  TMDB_W154: 'https://image.tmdb.org/t/p/w154',
  DOOMSDAY: new Date('2026-12-18T00:00:00'),
  LS_WATCHED: 'mab-watched-v3',
  BATCH_SIZE: 10,
  BATCH_DELAY: 180,
  FETCH_TIMEOUT: 9000,
};

/* ═══════════════════════════════════════════════════════════
   § 2  MASTER CATALOG  — 88 titles (updated to Aug 2, 2026)
       runtime = minutes. TV = approximate total per season.
   ═══════════════════════════════════════════════════════════ */
let CATALOG = [];

/* ═══════════════════════════════════════════════════════════
   § 3  CATEGORY HELPERS
   ═══════════════════════════════════════════════════════════ */
const UNIVERSE_META = {
  mcu: { label: 'MCU', badgeClass: 'cat-badge-mcu' },
  xmen: { label: 'X-Men (Fox)', badgeClass: 'cat-badge-xmen' },
  sony: { label: 'Sony Spider-Verse', badgeClass: 'cat-badge-sony' },
  'fantastic four': { label: 'Fantastic Four (Fox)', badgeClass: 'cat-badge-fantastic-four' },
  'new line cinema': { label: 'New Line Cinema', badgeClass: 'cat-badge-newline' },
};

function getCategoryKey(item) {
  return item.category || 'Others';
}

/* ═══════════════════════════════════════════════════════════
   § 4  APPLICATION STATE
   ═══════════════════════════════════════════════════════════ */
const state = {
  watched: new Set(JSON.parse(localStorage.getItem(CONFIG.LS_WATCHED) || '[]')),
  enriched: {},  // uid → { poster, title, runtime, cast:[] }
  filters: {
    search: '', status: 'all', format: 'all', universe: 'all', essential: false,
  },
};

const ESSENTIAL_LIST = [
  { title: "X-Men", optional: false },
  { title: "X2: X-Men United", optional: false },
  { title: "X-Men: The Last Stand", optional: false },
  { title: "X-Men: Days of Future Past", optional: false },
  { title: "Deadpool", optional: true },
  { title: "Logan", optional: true },
  { title: "Deadpool 2", optional: true },
  { title: "Captain America: The First Avenger", optional: false },
  { title: "The Avengers", optional: false },
  { title: "Captain America: The Winter Soldier", optional: false },
  { title: "Avengers: Age of Ultron", optional: false },
  { title: "Doctor Strange", optional: false },
  { title: "Captain America: Civil War", optional: false },
  { title: "Black Widow", optional: false },
  { title: "Avengers: Infinity War", optional: false },
  { title: "Avengers: Endgame", optional: false },
  { title: "Loki (Season 1)", optional: false },
  { title: "WandaVision", optional: true },
  { title: "Hawkeye", optional: false },
  { title: "The Falcon and the Winter Soldier", optional: false },
  { title: "Shang-Chi and the Legend of the Ten Rings", optional: false },
  { title: "Spider-Man: No Way Home", optional: true },
  { title: "Doctor Strange in the Multiverse of Madness", optional: true },
  { title: "Thor: Love and Thunder", optional: false },
  { title: "Black Panther: Wakanda Forever", optional: false },
  { title: "Ant-Man and the Wasp: Quantumania", optional: false },
  { title: "The Marvels", optional: true },
  { title: "Loki (Season 2)", optional: false },
  { title: "Deadpool & Wolverine", optional: true },
  { title: "Captain America: Brave New World", optional: false },
  { title: "Thunderbolts*", optional: false },
  { title: "The Fantastic Four: First Steps", optional: false },
  { title: "Spider-Man: Brand New Day", optional: false }
];

/* ═══════════════════════════════════════════════════════════
   § 5  UTILITIES
   ═══════════════════════════════════════════════════════════ */
function fmtRuntime(min) {
  if (!min || min <= 0) return '–';
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtRuntimeLong(min) {
  if (!min || min <= 0) return '0h 0m';
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let _toastTimer;
function showToast(msg, ms = 2800) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

function saveWatched() {
  localStorage.setItem(CONFIG.LS_WATCHED, JSON.stringify([...state.watched]));
}

/* ═══════════════════════════════════════════════════════════
   § 6  TMDB API — Bearer auth, per-request timeout
   ═══════════════════════════════════════════════════════════ */
async function tmdbFetch(endpoint) {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), CONFIG.FETCH_TIMEOUT);
    const res = await fetch(`${CONFIG.TMDB_BASE}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${CONFIG.TOKEN}` },
      signal: ctrl.signal,
    });
    clearTimeout(tid);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchItemData(item) {
  if (!item.tmdbId) return null;
  const ep = item.type === 'movie'
    ? `/movie/${item.tmdbId}?append_to_response=credits&language=en-US`
    : `/tv/${item.tmdbId}?append_to_response=credits&language=en-US`;
  const d = await tmdbFetch(ep);
  if (!d) return null;

  const poster = d.poster_path || null;
  const title = d.title || d.name || item.title;
  const runtime = item.type === 'movie' && d.runtime > 0 ? d.runtime : 0;
  const cast = (d.credits?.cast || []).slice(0, 4).map(a => a.name);
  return { poster, title, runtime, cast };
}

/* ═══════════════════════════════════════════════════════════
   § 7  PROGRESSIVE TMDB ENRICHMENT (non-blocking)
   ═══════════════════════════════════════════════════════════ */
async function enrichAllItems() {
  const items = CATALOG.filter(i => i.tmdbId);
  for (let i = 0; i < items.length; i += CONFIG.BATCH_SIZE) {
    await Promise.allSettled(
      items.slice(i, i + CONFIG.BATCH_SIZE).map(async item => {
        const data = await fetchItemData(item);
        if (data) {
          state.enriched[item.uid] = data;
          updateCardInPlace(item.uid);
        }
      })
    );
    updateStats();
    if (i + CONFIG.BATCH_SIZE < items.length) await sleep(CONFIG.BATCH_DELAY);
  }
}

/* Update a single card's DOM elements after TMDB data arrives */
function updateCardInPlace(uid) {
  const card = document.querySelector(`.movie-card[data-uid="${uid}"]`);
  if (!card) return;
  const data = state.enriched[uid];
  if (!data) return;
  const item = CATALOG.find(i => i.uid === uid);

  /* Poster */
  if (data.poster) {
    const ph = card.querySelector('.poster-placeholder');
    if (ph) {
      const img = document.createElement('img');
      img.src = `${CONFIG.TMDB_W342}${data.poster}`;
      img.alt = data.title || '';
      img.loading = 'lazy';
      img.style.cssText = 'opacity:0;transition:opacity .4s ease';
      img.onload = img.onerror = () => { img.style.opacity = '1'; };
      ph.replaceWith(img);
    }
  }

  /* Title */
  if (data.title) {
    const el = card.querySelector('.card-title');
    if (el) el.textContent = data.title;
  }

  /* Runtime */
  if (data.runtime) {
    let rEl = card.querySelector('.card-runtime');
    if (rEl) {
      rEl.textContent = fmtRuntime(data.runtime);
    } else {
      const meta = card.querySelector('.card-meta');
      if (meta) {
        const span = document.createElement('span');
        span.className = 'card-runtime';
        span.textContent = fmtRuntime(data.runtime);
        meta.appendChild(span);
      }
    }
  }

  /* Cast */
  if (data.cast?.length) {
    const castEl = card.querySelector('.cast-names');
    if (castEl) castEl.textContent = data.cast.join(', ');
  }
}

/* ═══════════════════════════════════════════════════════════
   § 8  FILTER LOGIC
   ═══════════════════════════════════════════════════════════ */
function getFilteredItems() {
  const { search, status, format, universe, essential } = state.filters;
  const q = search.toLowerCase().trim();

  let baseItems = CATALOG;
  if (essential) {
    const essentialTitles = new Set(ESSENTIAL_LIST.map(e => e.title));
    baseItems = CATALOG.filter(item => essentialTitles.has(item.title));
  }

  const filtered = baseItems.filter(item => {
    if (q) {
      const t = (state.enriched[item.uid]?.title || item.title).toLowerCase();
      if (!t.includes(q)) return false;
    }
    if (status === 'watched' && !state.watched.has(item.uid)) return false;
    if (status === 'pending' && state.watched.has(item.uid)) return false;
    if (format === 'movie' && item.type !== 'movie') return false;
    if (format === 'tv' && item.type !== 'tv') return false;
    if (universe !== 'all') {
      const uni = (item.universe || '').toLowerCase();
      if (universe === 'core-only') {
        if (uni === 'mcu') {
          if ((item.category || '').includes('Netflix')) return false;
        } else if (uni === 'x-men') {
          // Allow X-Men
        } else if (uni === 'sony') {
          if (item.category !== 'Sony · Raimi Trilogy' && item.category !== 'Sony · The Amazing Spider-Man') return false;
        } else {
          return false;
        }
      } else if (universe === 'mcu-all') {
        if (uni !== 'mcu') return false;
      } else if (universe === 'mcu-netflix') {
        if (uni !== 'mcu' || !(item.category || '').includes('Netflix')) return false;
      } else if (universe.startsWith('mcu-')) {
        const p = universe.slice(4);
        if (uni !== 'mcu' || !(item.category || '').includes(`Phase ${p}`)) return false;
      } else if (universe === 'fox-all') {
        if (uni !== 'x-men' && uni !== 'fantastic four') return false;
      } else if (universe === 'fantastic four') {
        if (uni === 'mcu' || !(item.category || '').includes('Fantastic Four')) return false;
      } else if (universe === 'x-men') {
        if (uni !== 'x-men' || (item.category || '').includes('Fantastic Four')) return false;
      } else if (universe.startsWith('sony-')) {
        if (uni !== 'sony') return false;
        if (universe === 'sony-spiderverse' && item.category !== 'Sony · Raimi Trilogy' && item.category !== 'Sony · The Amazing Spider-Man' && item.category !== 'Sony · Animated Spider-Verse') return false;
        if (universe === 'sony-ssu' && item.category !== 'Sony SSU') return false;
        if (universe === 'sony-ghostrider' && item.category !== 'Sony · Ghost Rider') return false;
      } else {
        if (uni !== universe) return false;
      }
    }
    return true;
  });

  if (essential) {
    filtered.sort((a, b) => {
      const idxA = ESSENTIAL_LIST.findIndex(e => e.title === a.title);
      const idxB = ESSENTIAL_LIST.findIndex(e => e.title === b.title);
      return idxA - idxB;
    });
  }
  return filtered;
}

/* ═══════════════════════════════════════════════════════════
   § 9  RENDERING
   ═══════════════════════════════════════════════════════════ */
function buildCardHTML(item) {
  const data = state.enriched[item.uid] || {};
  const title = esc(data.title || item.title);
  const runtime = data.runtime || 0;
  const cast = (data.cast || []).join(', ');
  const poster = data.poster;
  const isWatched = state.watched.has(item.uid);
  const isComingSoon = !!item.comingSoon || item.year === null;

  /* Universe badge */
  const uni = (item.universe || '').toLowerCase();
  const uniCls = uni.replace('-men', 'men').replace(' ', '-');
  const phaseMatch = item.category ? item.category.match(/Phase \d/) : null;

  let xmenLbl = 'X-MEN';
  if (uni === 'x-men' && item.category) {
    if (item.category.includes('Deadpool')) xmenLbl = 'DEADPOOL';
    else if (item.category.includes('Wolverine')) xmenLbl = 'WOLVERINE';
    else if (item.category.includes('Fantastic Four')) xmenLbl = 'FANTASTIC 4';
  }

  const uniLbl = uni === 'mcu' ? (phaseMatch ? `MCU P${phaseMatch[0].replace('Phase ', '')}` : (item.category && item.category.includes('Netflix') ? 'THE DEFENDERS' : 'MCU'))
    : uni === 'x-men' ? xmenLbl
      : uni === 'fantastic four' ? 'FANTASTIC 4'
        : uni === 'sony' ? 'SONY' : uni.toUpperCase();

  const isSpecial = item.category && item.category.includes('Special');
  const typeLbl = isSpecial ? 'Special'
    : item.type === 'tv' ? 'TV Show' : 'Movie';

  const posterHTML = poster
    ? `<img src="${CONFIG.TMDB_W342}${poster}" alt="${title}" loading="lazy">`
    : `<div class="poster-placeholder">
         <span class="placeholder-emoji">🎬</span>
         <span class="placeholder-text">${title}</span>
       </div>`;

  const castHTML = `<div class="card-cast-tooltip">
    <div class="cast-label">Cast</div>
    <div class="cast-names">${esc(cast) || '–'}</div>
  </div>`;

  const watchBtn = isComingSoon
    ? `<button class="btn-watch" disabled>Coming Soon</button>`
    : isWatched
      ? `<button class="btn-watch btn-watch-done"   data-uid="${item.uid}">✓ Watched · Unmark</button>`
      : `<button class="btn-watch btn-watch-pending" data-uid="${item.uid}">+ Mark as watched</button>`;

  const isEssentialActive = state.filters.essential;
  const essentialItem = isEssentialActive ? ESSENTIAL_LIST.find(e => e.title === item.title) : null;
  const isOptional = essentialItem && essentialItem.optional;

  return `
  <div class="movie-card${isWatched ? ' is-watched' : ''}${isComingSoon ? ' is-coming-soon' : ''}"
       data-uid="${item.uid}" role="listitem">
    <div class="card-poster">
      ${posterHTML}
      <div class="card-badges">
        <div style="display:flex;gap:4px;flex-wrap:wrap;">
          ${isOptional
      ? '<span class="badge badge-optional-top">OPTIONAL</span>'
      : `<span class="badge badge-universe ${uniCls}">${uniLbl}</span>`
    }
          ${isComingSoon ? '<span class="badge badge-coming-soon">Coming Soon</span>' : ''}
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;">
          <span class="badge badge-type">${isSpecial ? '⭐ ' : ''}${typeLbl}</span>
        </div>
      </div>
      <div class="watched-overlay"><div class="watched-check-icon">✓</div></div>
      ${castHTML}
    </div>
    <div class="card-body">
      <div class="card-title">${title}</div>
      <div class="card-meta">
        <span class="card-year">${item.year || 'Coming Soon'}</span>
        ${runtime > 0 ? `<span class="card-runtime">${fmtRuntime(runtime)}</span>` : ''}
      </div>
      <div class="card-footer">
        ${watchBtn}
      </div>
    </div>
  </div>`;
}

function groupItems(items) {
  const groups = new Map();
  for (const item of items) {
    const key = getCategoryKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

function renderGrid(items) {
  const grid = document.getElementById('movies-grid');
  const noResults = document.getElementById('no-results');
  const info = document.getElementById('results-info');

  if (!items.length) {
    grid.innerHTML = '';
    noResults.hidden = false;
    info.textContent = 'No results';
    return;
  }

  noResults.hidden = true;

  let html = '';
  if (state.filters.essential) {
    html = `<div class="cat-header">
      <div class="cat-header-text">
        <span class="cat-badge cat-badge-mcu" style="background:var(--gold-alpha);color:var(--gold);border-color:var(--gold);">ESSENTIAL</span>
        <h2>Essential Watchlist</h2>
      </div>
      <div class="cat-header-line"></div>
      <span class="cat-count">${items.length} title${items.length !== 1 ? 's' : ''}</span>
    </div>`;
    html += items.map(buildCardHTML).join('');
  } else {
    const groups = groupItems(items);
    for (const [catName, grpItems] of groups) {
      if (groups.size > 1) {
        const first = grpItems[0];
        const uni = (first.universe || '').toLowerCase().replace('-men', 'men');
        const meta = UNIVERSE_META[uni] || {};

        let displayCat = catName;
        if (uni === 'mcu') {
          const parts = catName.split(' · ');
          if (parts.length >= 3) {
            displayCat = `${parts[0]} · ${parts[1]} <small style="opacity:.55">${parts[2]}</small>`;
          }
        }

        html += `<div class="cat-header">
        <div class="cat-header-text">
          <span class="cat-badge ${meta.badgeClass || ''}">${meta.label || first.universe}</span>
          <h2>${displayCat}</h2>
        </div>
        <div class="cat-header-line"></div>
        <span class="cat-count">${grpItems.length} title${grpItems.length !== 1 ? 's' : ''}</span>
      </div>`;
      }
      html += grpItems.map(buildCardHTML).join('');
    }
  }

  grid.innerHTML = html;
  grid.onclick = (e) => {
    const btn = e.target.closest('.btn-watch[data-uid]');
    if (btn) {
      toggleWatched(btn.dataset.uid);
    }
  };

  const watchedCnt = items.filter(i => state.watched.has(i.uid)).length;
  info.textContent = `${items.length} of ${CATALOG.length} titles · ${watchedCnt} watched`;
}

/* ═══════════════════════════════════════════════════════════
   § 10  WATCHED STATE
   ═══════════════════════════════════════════════════════════ */
function toggleWatched(uid) {
  const item = CATALOG.find(i => i.uid === uid);
  if (!item || item.comingSoon || item.year === null) return;

  const wasWatched = state.watched.has(uid);
  if (wasWatched) { state.watched.delete(uid); showToast(`❌ "${item.title}" unmarked`); }
  else { state.watched.add(uid); showToast(`✅ "${item.title}" marked as watched`); }

  saveWatched();

  /* Update card in-place without re-rendering grid */
  const card = document.querySelector(`.movie-card[data-uid="${uid}"]`);
  if (card) {
    const now = state.watched.has(uid);
    card.classList.toggle('is-watched', now);
    const btn = card.querySelector('.btn-watch');
    if (btn) {
      btn.className = `btn-watch ${now ? 'btn-watch-done' : 'btn-watch-pending'}`;
      btn.textContent = now ? '✓ Watched · Unmark' : '+ Mark as watched';
    }
  }

  updateStats();
}

/* ═══════════════════════════════════════════════════════════
   § 11  STATS DASHBOARD
   ═══════════════════════════════════════════════════════════ */
function getRuntime(item) {
  return state.enriched[item.uid]?.runtime || 0;
}

function updateStats() {
  const all = CATALOG.filter(i => !i.comingSoon && i.year !== null);
  const total = all.reduce((s, i) => s + getRuntime(i), 0);
  const watched = all.filter(i => state.watched.has(i.uid));
  const watchedT = watched.reduce((s, i) => s + getRuntime(i), 0);
  const remainT = total - watchedT;
  const pct = total > 0 ? Math.round((watchedT / total) * 100) : 0;

  document.getElementById('stat-total-time').textContent = fmtRuntimeLong(total);
  document.getElementById('stat-total-count').textContent = `${all.length} titles`;
  document.getElementById('stat-watched-time').textContent = fmtRuntimeLong(watchedT);
  document.getElementById('stat-watched-count').textContent = `${watched.length} titles`;
  document.getElementById('stat-remaining-time').textContent = fmtRuntimeLong(remainT);
  document.getElementById('stat-remaining-count').textContent = `${all.length - watched.length} titles`;
  document.getElementById('stat-percent').textContent = `${pct}%`;

  const fill = document.getElementById('progress-fill');
  const glow = document.getElementById('progress-glow');
  fill.style.width = `${pct}%`;
  glow.style.width = `${pct}%`;
}

/* ═══════════════════════════════════════════════════════════
   § 12  COUNTDOWN
   ═══════════════════════════════════════════════════════════ */
function updateCountdown() {
  const diff = CONFIG.DOOMSDAY - new Date();
  const el = document.getElementById('countdown-days');
  el.textContent = diff <= 0 ? 'Today!' : Math.ceil(diff / 86400000).toLocaleString('en-US');
}

/* ═══════════════════════════════════════════════════════════
   § 13  EXPORT / IMPORT JSON
   ═══════════════════════════════════════════════════════════ */
function exportJSON() {
  const blob = new Blob([JSON.stringify({
    app: 'Marvel Marathon Tracker', version: '3.0',
    exportedAt: new Date().toISOString(),
    watchedUids: [...state.watched],
  }, null, 2)], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `marvel-marathon-${new Date().toISOString().slice(0, 10)}.json`,
  });
  a.click(); URL.revokeObjectURL(a.href);
  showToast('✅ JSON exported');
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = ({ target }) => {
    try {
      const data = JSON.parse(target.result);
      const ids = data.watchedUids || data.watched || [];
      if (!Array.isArray(ids)) throw new Error('invalid format');
      const valid = new Set(CATALOG.map(i => i.uid));
      let cnt = 0;
      ids.forEach(uid => { if (valid.has(uid)) { state.watched.add(uid); cnt++; } });
      saveWatched();
      renderGrid(getFilteredItems());
      updateStats();
      showToast(`📥 ${cnt} titles imported`);
    } catch (err) { showToast(`⚠️ Error: ${err.message}`); }
  };
  reader.readAsText(file);
}

/* ═══════════════════════════════════════════════════════════
   § 14  EVENT LISTENERS
   ═══════════════════════════════════════════════════════════ */
function attachEvents() {
  /* Search */
  const searchEl = document.getElementById('search-input');
  const clearEl = document.getElementById('btn-clear-search');

  searchEl.addEventListener('input', () => {
    state.filters.search = searchEl.value;
    clearEl.hidden = !searchEl.value;
    renderGrid(getFilteredItems());
  });
  clearEl.addEventListener('click', () => {
    searchEl.value = state.filters.search = '';
    clearEl.hidden = true;
    renderGrid(getFilteredItems());
    searchEl.focus();
  });

  /* Filters */
  document.getElementById('filter-status').addEventListener('change', e => { state.filters.status = e.target.value; renderGrid(getFilteredItems()); });
  document.getElementById('filter-format').addEventListener('change', e => { state.filters.format = e.target.value; renderGrid(getFilteredItems()); });
  document.getElementById('filter-universe').addEventListener('change', e => { state.filters.universe = e.target.value; renderGrid(getFilteredItems()); });

  /* Mark all visible */
  document.getElementById('btn-mark-visible').addEventListener('click', () => {
    const visible = getFilteredItems().filter(i => !i.comingSoon && i.year !== null);
    const allWatched = visible.every(i => state.watched.has(i.uid));
    visible.forEach(i => allWatched ? state.watched.delete(i.uid) : state.watched.add(i.uid));
    saveWatched();
    renderGrid(getFilteredItems());
    updateStats();
    showToast(allWatched ? `❌ ${visible.length} titles unmarked` : `✅ ${visible.length} titles marked`);
  });

  /* Reset */
  document.getElementById('btn-reset-all').addEventListener('click', () => {
    if (!confirm('Clear all progress?')) return;
    state.watched.clear(); saveWatched();
    renderGrid(getFilteredItems()); updateStats();
    showToast('🔄 Progress reset');
  });

  /* Essential Toggle */
  const btnEssential = document.getElementById('btn-toggle-essential-card');
  const textEssential = document.getElementById('text-toggle-essential');
  if (btnEssential && textEssential) {
    btnEssential.addEventListener('click', () => {
      state.filters.essential = !state.filters.essential;
      textEssential.innerHTML = state.filters.essential ? 'Show Full Catalog' : 'Show Essential Watchlist';
      renderGrid(getFilteredItems());
    });
  }

  /* Export / Import JSON */
  document.getElementById('btn-export-json').addEventListener('click', exportJSON);
  document.getElementById('import-json-input').addEventListener('change', e => {
    if (e.target.files[0]) importJSON(e.target.files[0]);
    e.target.value = '';
  });

  /* Clear filters (no-results button) */
  document.getElementById('btn-clear-filters').addEventListener('click', () => {
    ['search-input', 'filter-status', 'filter-format', 'filter-universe']
      .forEach(id => document.getElementById(id).value = id === 'search-input' ? '' : 'all');
    state.filters = { search: '', status: 'all', format: 'all', universe: 'all' };
    document.getElementById('btn-clear-search').hidden = true;
    renderGrid(getFilteredItems());
  });
}

/* ═══════════════════════════════════════════════════════════
   § 15  INITIALIZATION
   ═══════════════════════════════════════════════════════════ */
async function init() {
  updateCountdown();
  setInterval(updateCountdown, 3_600_000);
  attachEvents();

  try {
    const res = await fetch('peliculas.json?' + new Date().getTime());
    if (res.ok) {
      const data = await res.json();
      CATALOG = data.catalog || [];
      const totalCountEl = document.getElementById('total-count-display');
      if (totalCountEl) totalCountEl.textContent = data.totalItemsReleased || CATALOG.length;
    }
  } catch (err) {
    console.error('Error loading peliculas.json', err);
  }

  /* Render immediately with fallback data — users see content at once */
  renderGrid(getFilteredItems());
  updateStats();

  /* Progressively enrich with TMDB data in the background */
  enrichAllItems(); /* intentionally NOT awaited */
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();