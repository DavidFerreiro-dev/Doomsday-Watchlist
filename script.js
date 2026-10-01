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
  DOOMSDAY: new Date('2026-12-17T00:00:00'),
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
let DISPLAY_CATALOG = [];

/* ═══════════════════════════════════════════════════════════
   § 3  CATEGORY HELPERS
   ═══════════════════════════════════════════════════════════ */
const UNIVERSE_META = {
  mcu: { label: 'MCU', badgeClass: 'cat-badge-mcu' },
  xmen: { label: 'Fox', badgeClass: 'cat-badge-xmen' },
  sony: { label: 'Sony', badgeClass: 'cat-badge-sony' },
  universal: { label: 'Universal', badgeClass: 'cat-badge-universal' },
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
    search: '', status: 'all', format: 'all', universe: 'all', sort: 'default', essential: false, disney: false,
  },
  searchMode: false,
  countdownUid: null,
  charFilter: null, // { actors: string[] } | null
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
  { title: "Spider-Man: No Way Home", optional: false },
  { title: "Doctor Strange in the Multiverse of Madness", optional: false },
  { title: "Thor: Love and Thunder", optional: false },
  { title: "Black Panther: Wakanda Forever", optional: false },
  { title: "Ant-Man and the Wasp: Quantumania", optional: false },
  { title: "The Marvels", optional: true },
  { title: "Loki (Season 2)", optional: false },
  { title: "Deadpool & Wolverine", optional: false },
  { title: "Captain America: Brave New World", optional: false },
  { title: "Thunderbolts*", optional: false },
  { title: "The Fantastic Four: First Steps", optional: false },
  { title: "Spider-Man: Brand New Day", optional: false }
];

const DISNEY_LIST = [
  "X-Men",
  "X2: X-Men United",
  "Captain America: The First Avenger",
  "The Avengers",
  "Avengers: Infinity War",
  "Avengers: Endgame",
  "Loki (Season 1)",
  "Loki (Season 2)",
  "Shang-Chi and the Legend of the Ten Rings",
  "Spider-Man: No Way Home",
  "Black Panther: Wakanda Forever",
  "Captain America: Brave New World",
  "Deadpool & Wolverine",
  "Doctor Strange in the Multiverse of Madness",
  "Thunderbolts*",
  "The Fantastic Four: First Steps"
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

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function matchesSearchSegment(item, segment) {
  const normalized = normalizeSearchText(segment);
  if (!normalized) return true;

  const data = state.enriched[item.uid] || {};
  const cast = (data.cast || []).map(normalizeSearchText);
  return cast.some(actor => actor === normalized || actor.includes(normalized));
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

function getCatalogStats(catalog) {
  const totalItems = catalog.length;
  const totalMovies = catalog.filter(item => item.type === 'movie').length;
  const totalTvShows = catalog.filter(item => item.type === 'tv').length;
  const totalItemsReleased = catalog.filter(item => {
    const releaseDate = getItemReleaseDate(item);
    return !!releaseDate && releaseDate.getTime() <= Date.now();
  }).length;

  return { totalItems, totalItemsReleased, totalMovies, totalTvShows };
}

function updateCatalogStatsDisplay() {
  const totalCountEl = document.getElementById('total-count-display');
  if (!totalCountEl) return;

  const stats = getCatalogStats(CATALOG);
  totalCountEl.textContent = stats.totalItemsReleased;
}

function resolvePosterSrc(poster) {
  if (!poster) return null;
  return /^https?:\/\//i.test(poster) ? poster : `${CONFIG.TMDB_W342}${poster}`;
}

function preloadImage(src) {
  if (!src) return Promise.resolve();
  return new Promise(resolve => {
    const image = new Image();
    image.onload = image.onerror = resolve;
    image.src = src;
  });
}

async function preloadVisualAssets() {
  if (document.fonts?.ready) await document.fonts.ready;
}

function formatReleaseDate(date) {
  if (!date) return 'Loading…';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function parseReleaseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === 'number') {
    return new Date(value, 0, 1);
  }

  const text = String(value).trim();
  if (!text) return null;

  const slashMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const dashMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dashMatch) {
    const [, year, month, day] = dashMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getItemReleaseDate(item, data = state.enriched[item.uid]) {
  if (!item) return null;
  const customDate = item['Custom Date'] ?? item.customDate;
  if (customDate) return parseReleaseDate(customDate);
  return parseReleaseDate(data?.releaseDate);
}

function isItemReleased(item, data = state.enriched[item.uid]) {
  const releaseDate = getItemReleaseDate(item, data);
  if (releaseDate && releaseDate.getTime() <= Date.now()) return true;

  return false;
}

function getNextProjectCountdownItem() {
  const now = Date.now();
  return CATALOG
    .map(item => ({ item, data: state.enriched[item.uid], releaseDate: getItemReleaseDate(item) }))
    .filter(entry => entry.releaseDate && entry.releaseDate.getTime() > now && !isItemReleased(entry.item, entry.data))
    .sort((a, b) => a.releaseDate - b.releaseDate)[0] || null;
}

function formatCountdown(ms) {
  if (ms <= 0) return 'Today!';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
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

  const customImage = item['Custom Image'] ?? item.customImage;
  const customImageUrl = typeof customImage === 'string' ? customImage : null;
  const poster = customImageUrl || d.poster_path || null;
  const title = customImage ? item.title : (d.title || d.name || item.title);
  const runtime = item.type === 'movie' && d.runtime > 0 ? d.runtime : 0;
  const credits = (d.credits?.cast || []).slice(0, 20);
  const cast = credits.map(a => a.name);
  const roles = credits.map(a => ({ name: a.name, character: a.character || '' }));
  const rating = d.vote_average ? d.vote_average.toFixed(1) : null;
  const episodes = item.type === 'tv' ? d.number_of_episodes : null;
  const customDate = item['Custom Date'] ?? item.customDate;
  const releaseDate = customDate ? parseReleaseDate(customDate) : (d.release_date || d.first_air_date);
  return { poster, title, runtime, cast, roles, status: d.status || null, releaseDate, rating, episodes };
}

/* ═══════════════════════════════════════════════════════════
   § 7  PROGRESSIVE TMDB ENRICHMENT
   ═══════════════════════════════════════════════════════════ */
async function enrichAllItems(onProgress) {
  const items = CATALOG.filter(i => i.tmdbId);
  const total = items.length;
  let done = 0;

  for (let i = 0; i < items.length; i += CONFIG.BATCH_SIZE) {
    while (state.searchMode) await sleep(100);
    const batch = items.slice(i, i + CONFIG.BATCH_SIZE);
    await Promise.allSettled(
      batch.map(async item => {
        const data = await fetchItemData(item);
        if (data) {
          state.enriched[item.uid] = data;
        }
        done++;
        if (onProgress) onProgress(done, total, item.title, item.uid);
      })
    );
    if (i + CONFIG.BATCH_SIZE < items.length) await sleep(CONFIG.BATCH_DELAY);
  }
}

/* Update a single card's DOM elements after TMDB data arrives */
function updateCardInPlace(uid) {
  const card = document.querySelector(`.movie-card[data-uid="${uid}"]`);
  if (!card) return;
  const item = CATALOG.find(i => i.uid === uid);
  if (!item) return;
  
  const temp = document.createElement('div');
  temp.innerHTML = buildCardHTML(item);
  const newCard = temp.firstElementChild;
  
  const data = state.enriched[uid];
  if (data && data.poster) {
    const img = newCard.querySelector('img');
    if (img) {
      img.style.cssText = 'opacity:0;transition:opacity .4s ease';
      img.onload = img.onerror = () => { img.style.opacity = '1'; };
    }
  }
  card.replaceWith(newCard);
}

/* ═══════════════════════════════════════════════════════════
   § 8  FILTER LOGIC
   ═══════════════════════════════════════════════════════════ */
function getFilteredItems() {
  const { search, status, format, universe, sort, essential, disney } = state.filters;
  const searchSegments = search.split(',').map(segment => segment.trim()).filter(Boolean);

  let baseItems = DISPLAY_CATALOG;
  if (disney) {
    const disneyTitles = new Set(DISNEY_LIST);
    baseItems = DISPLAY_CATALOG.filter(item => {
      return disneyTitles.has(item.title);
    });
  } else if (essential) {
    const essentialTitles = new Set(ESSENTIAL_LIST.map(e => e.title));
    baseItems = DISPLAY_CATALOG.filter(item => {
      return essentialTitles.has(item.title);
    });
  }

  const filtered = baseItems.filter(item => {
    if (searchSegments.length && !searchSegments.every(segment => matchesSearchSegment(item, segment))) return false;
    
    // Character filter — check TMDB cast
    if (state.charFilter) {
      const data = state.enriched[item.uid] || {};
      const selectedRoles = (state.charFilter.roles || []).map(normalizeSearchText);
      const selectedTitles = (state.charFilter.titles || []).map(normalizeSearchText);
      const itemRoles = (data.roles || []).map(role => normalizeSearchText(role.character)).filter(Boolean);
      const itemActors = (data.cast || []).map(normalizeSearchText);
      const title = normalizeSearchText(data.title || item.title);
      const selectionMatches = selection => {
          const actorMatch = selection.actors.some(actor => itemActors.includes(normalizeSearchText(actor)));
          const roleMatch = selection.roles.some(role => itemRoles.some(itemRole => itemRole === normalizeSearchText(role) || itemRole.includes(normalizeSearchText(role)) || normalizeSearchText(role).includes(itemRole)));
          const titleMatch = selection.titles.some(knownTitle => normalizeSearchText(knownTitle) === title);
          return titleMatch || (actorMatch && roleMatch);
      };
      const matches = state.charFilter.selections?.length
        ? (state.charFilter.matchMode === 'all'
          ? state.charFilter.selections.every(selectionMatches)
          : state.charFilter.selections.some(selectionMatches))
        : selectedTitles.includes(title) || (selectedRoles.length
          ? selectedRoles.some(role => itemRoles.some(itemRole => itemRole === role || itemRole.includes(role) || role.includes(itemRole)))
          : state.charFilter.actors.some(actor => itemActors.includes(normalizeSearchText(actor))));
      if (!matches) return false;
    }
    
    let isItemWatched = state.watched.has(item.uid);

    if (status === 'watched' && !isItemWatched) return false;
    if (status === 'pending' && isItemWatched) return false;
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
      } else if (universe === 'mcu-netflix') {
        if (uni !== 'mcu' || !(item.category || '').includes('Netflix')) return false;
      } else if (universe.startsWith('mcu-')) {
        const p = universe.slice(4);
        if (uni !== 'mcu' || !(item.category || '').includes(`Phase ${p}`)) return false;
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

  if (sort !== 'default') {
    const getSortValue = item => {
      const data = state.enriched[item.uid] || {};
      return sort.startsWith('duration') ? (data.runtime || 0) : (Number(data.rating) || 0);
    };
    const direction = sort.endsWith('asc') ? 1 : -1;
    filtered.sort((a, b) => {
      const aValue = getSortValue(a);
      const bValue = getSortValue(b);
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;
      return (aValue - bValue) * direction;
    });
  } else if (disney) {
    filtered.sort((a, b) => {
      const getIdx = (item) => DISNEY_LIST.indexOf(item.title);
      return getIdx(a) - getIdx(b);
    });
  } else if (essential) {
    filtered.sort((a, b) => {
      const getIdx = (item) => ESSENTIAL_LIST.findIndex(e => e.title === item.title);
      return getIdx(a) - getIdx(b);
    });
  }
  return filtered;
}

/* ═══════════════════════════════════════════════════════════
   § 9  RENDERING
   ═══════════════════════════════════════════════════════════ */
function buildCardHTML(item) {
  const dataUid = item.uid;
  const data = state.enriched[dataUid] || {};
  const title = esc(data.title || item.title);
  const runtime = data.runtime || 0;
  const cast = (data.cast || []).slice(0, 4).join(', ');
  const rating = data.rating;
  const episodes = data.episodes;
  const customImage = item['Custom Image'] ?? item.customImage;
  const customImageUrl = typeof customImage === 'string' ? customImage : null;
  const poster = data.poster || customImageUrl;
  const hasCustomImage = !!customImage;
  const isReleasedNow = isItemReleased(item, data);
  const nextMovie = !isReleasedNow ? getNextProjectCountdownItem() : null;
  const isCountdownTarget = !!nextMovie && nextMovie.item.uid === item.uid;
  const releaseDate = getItemReleaseDate(item, data);
  
  let isWatched = state.watched.has(item.uid);
  let isComingSoon = !isReleasedNow;

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
  const releaseLabel = formatReleaseDate(releaseDate);

  const countdownText = isCountdownTarget && releaseDate
    ? formatCountdown(releaseDate.getTime() - Date.now())
    : null;

  const posterHTML = hasCustomImage
    ? poster
      ? `<img src="${esc(resolvePosterSrc(poster))}" alt="${title}" loading="lazy">`
      : `<div class="poster-placeholder">
         <span class="placeholder-emoji">🎬</span>
         <span class="placeholder-text">Custom Image</span>
       </div>`
    : poster
    ? `<img src="${esc(resolvePosterSrc(poster))}" alt="${title}" loading="lazy">`
    : `<div class="poster-placeholder">
         <span class="placeholder-emoji">🎬</span>
         <span class="placeholder-text">${title}</span>
       </div>`;

  const castHTML = `<div class="card-cast-tooltip">
    <div class="cast-label">Cast</div>
    <div class="cast-names">${esc(cast) || '–'}</div>
  </div>`;

  const isEssentialActive = state.filters.essential;
  let isOptional = false;
  const essentialItem = isEssentialActive ? ESSENTIAL_LIST.find(e => e.title === item.title) : null;
  isOptional = essentialItem && essentialItem.optional;

  let watchBtn = isComingSoon
    ? isCountdownTarget
      ? `<button class="btn-watch btn-watch-countdown" disabled data-countdown-uid="${item.uid}">⏳ ${countdownText}</button>`
      : `<button class="btn-watch btn-watch-locked" disabled>Locked until release</button>`
    : isWatched
      ? `<button class="btn-watch btn-watch-done"   data-uid="${item.uid}">✓ Watched · Unmark</button>`
      : `<button class="btn-watch btn-watch-pending" data-uid="${item.uid}">+ Mark as watched</button>`;

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
          ${isComingSoon ? (isCountdownTarget ? '<span class="badge badge-next-release">NEXT RELEASE</span>' : '<span class="badge badge-coming-soon">Coming Soon</span>') : ''}
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
        <span class="card-year">${esc(releaseLabel)}</span>
        ${runtime > 0 ? `<span class="card-runtime">${fmtRuntime(runtime)}</span>` : ''}
        ${episodes ? `<span class="card-runtime">${episodes} eps</span>` : ''}
        ${rating ? `<span class="card-runtime">⭐ ${rating}</span>` : ''}
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
  state.countdownUid = getNextProjectCountdownItem()?.item.uid || null;

  if (!items.length) {
    grid.innerHTML = '';
    noResults.hidden = false;
    info.textContent = state.filters.search.trim()
      ? `Estás buscando: ${state.filters.search.trim()} · 0 resultados`
      : 'Sin resultados';
    return;
  }

  noResults.hidden = true;

  let html = '';
  if (state.filters.disney) {
    html = `<div class="cat-header">
      <div class="cat-header-text">
        <span class="cat-badge" style="background:#113ccf;color:white;border-color:#113ccf;">DISNEY</span>
        <h2>Official Disney List</h2>
      </div>
      <div class="cat-header-line"></div>
      <span class="cat-count">${items.length} title${items.length !== 1 ? 's' : ''}</span>
    </div>`;
    html += items.map(buildCardHTML).join('');
  } else if (state.filters.essential) {
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
  const search = state.filters.search.trim();
  info.textContent = search
    ? `Estás buscando: ${search} · ${items.length} resultados · ${watchedCnt} vistos`
    : `${items.length} de ${CATALOG.length} títulos · ${watchedCnt} vistos`;
}

/* ═══════════════════════════════════════════════════════════
   § 10  WATCHED STATE
   ═══════════════════════════════════════════════════════════ */
function toggleWatched(uid) {
  const item = CATALOG.find(i => i.uid === uid);
  if (!item) return;

  const isReleasedNow = isItemReleased(item);
  if (!isReleasedNow && !state.watched.has(uid)) return;

  const wasWatched = state.watched.has(uid);
  if (wasWatched) { state.watched.delete(uid); showToast(`❌ "${item.title}" unmarked`); }
  else { state.watched.add(uid); showToast(`✅ "${item.title}" marked as watched`); }

  saveWatched();

  updateCardInPlace(uid);

  updateStats();
}

/* ═══════════════════════════════════════════════════════════
   § 11  STATS DASHBOARD
   ═══════════════════════════════════════════════════════════ */
function getRuntime(item) {
  return state.enriched[item.uid]?.runtime || 0;
}

function updateStats() {
  const all = CATALOG.filter(i => isItemReleased(i));
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
  const now = Date.now();
  const diff = CONFIG.DOOMSDAY - now;
  const el = document.getElementById('countdown-days');
  if (el) el.textContent = diff <= 0 ? 'Today!' : Math.ceil(diff / 86400000).toLocaleString('en-US');

  const nextProject = getNextProjectCountdownItem();
  const nextLabel = document.getElementById('next-project-title');
  const nextDays = document.getElementById('next-project-days');
  const nextUnit = document.getElementById('next-project-unit');
  
  if (nextProject) {
    const timeUntil = nextProject.releaseDate.getTime() - now;
    
    if (nextLabel) nextLabel.textContent = nextProject.item.title;
    
    if (timeUntil <= 0) {
      if (nextDays) nextDays.textContent = 'Today!';
      if (nextUnit) nextUnit.textContent = 'available now';
    } else {
      if (nextDays) nextDays.textContent = formatCountdown(timeUntil);
      if (nextUnit) nextUnit.textContent = 'remaining';

      const countdownBtn = document.querySelector('.btn-watch-countdown[data-countdown-uid]');
      if (countdownBtn) {
        countdownBtn.textContent = `⏳ ${formatCountdown(timeUntil)}`;
      }
    }
  } else {
    if (nextLabel) nextLabel.textContent = 'No upcoming project';
    if (nextDays) nextDays.textContent = '--';
    if (nextUnit) nextUnit.textContent = 'days';
  }
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
  const applySearchEl = document.getElementById('btn-apply-search');
  let searchTimer;

  const setSearchMode = active => {
    state.searchMode = active;
    document.body.classList.toggle('search-mode', active);
    if (!active) {
      renderGrid(getFilteredItems());
      updateStats();
    }
  };

  searchEl.addEventListener('focus', () => setSearchMode(true));
  searchEl.addEventListener('blur', () => {
    if (!searchEl.value.trim()) setSearchMode(false);
  });

  searchEl.addEventListener('input', () => {
    state.filters.search = searchEl.value;
    setSearchMode(true);
    clearEl.hidden = !searchEl.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (!state.searchMode) renderGrid(getFilteredItems());
    }, 120);
  });
  clearEl.addEventListener('click', () => {
    searchEl.value = state.filters.search = '';
    setSearchMode(true);
    clearEl.hidden = true;
    renderGrid(getFilteredItems());
    searchEl.focus();
  });
  applySearchEl?.addEventListener('click', () => {
    setSearchMode(false);
    searchEl.blur();
  });

  /* Filters */
  document.getElementById('filter-status').addEventListener('change', e => { state.filters.status = e.target.value; renderGrid(getFilteredItems()); });
  document.getElementById('filter-format').addEventListener('change', e => { state.filters.format = e.target.value; renderGrid(getFilteredItems()); });
  document.getElementById('filter-universe').addEventListener('change', e => { state.filters.universe = e.target.value; renderGrid(getFilteredItems()); });
  document.getElementById('filter-sort').addEventListener('change', e => { state.filters.sort = e.target.value; renderGrid(getFilteredItems()); });

  /* Mark all visible */
  document.getElementById('btn-mark-visible').addEventListener('click', () => {
    const visible = getFilteredItems().filter(i => isItemReleased(i));
    if (!visible.length) {
      showToast('⚠️ No released titles visible');
      return;
    }
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

  /* Essential & Disney Toggles */
  const textEssential = document.getElementById('text-toggle-essential');
  const btnDisney = document.getElementById('btn-toggle-disney');

  if (textEssential) {
    textEssential.addEventListener('click', () => {
      state.filters.essential = !state.filters.essential;
      if (state.filters.essential) state.filters.disney = false;
      
      textEssential.innerHTML = state.filters.essential ? 'Show Full Catalog' : 'Show Essential Watchlist';
      if (btnDisney) {
        btnDisney.innerHTML = `<img src="Assets/disney.png" alt="Disney" style="height: 18px; filter: brightness(0) invert(1);"> Official Disney List`;
      }
      
      renderGrid(getFilteredItems());
    });
  }

  if (btnDisney) {
    btnDisney.addEventListener('click', () => {
      state.filters.disney = !state.filters.disney;
      if (state.filters.disney) state.filters.essential = false;
      
      btnDisney.innerHTML = state.filters.disney ? `<img src="Assets/disney.png" alt="Disney" style="height: 18px; filter: brightness(0) invert(1);"> Show Full Catalog` : `<img src="Assets/disney.png" alt="Disney" style="height: 18px; filter: brightness(0) invert(1);"> Official Disney List`;
      
      if (textEssential) textEssential.innerHTML = 'Show Essential Watchlist';
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
    ['search-input', 'filter-status', 'filter-format', 'filter-universe', 'filter-sort']
      .forEach(id => document.getElementById(id).value = id === 'search-input' ? '' : id === 'filter-sort' ? 'default' : 'all');
    state.filters = { search: '', status: 'all', format: 'all', universe: 'all', sort: 'default' };
    state.charFilter = null;
    document.getElementById('char-filter-label').textContent = 'Characters';
    document.getElementById('btn-char-filter')?.classList.remove('char-active');
    document.getElementById('btn-clear-search').hidden = true;
    renderGrid(getFilteredItems());
  });

  /* ── Character Filter Modal ── */
  (function initCharFilter() {
    const modal       = document.getElementById('char-filter-modal');
    const body        = document.getElementById('char-modal-body');
    const btnOpen     = document.getElementById('btn-char-filter');
    const btnClose    = document.getElementById('btn-close-char');
    const btnClear    = document.getElementById('btn-char-clear');
    const btnApply    = document.getElementById('btn-char-apply');
    const searchInp   = document.getElementById('char-search-input');
    const filterLabel = document.getElementById('char-filter-label');
    const matchModeEl = document.getElementById('char-match-mode');
    const requireAllEl = document.getElementById('char-require-all');
    if (!modal || !body || !btnOpen) return;

    // State inside modal
    let selectedGroup = CHAR_GROUPS[0];
    let selectedChar  = null;
    let pendingActors = [];
    let pendingRoles = [];
    let pendingTitles = [];
    let pendingSelections = [];
    let pendingMatchMode = 'any';
    let pageScrollY = 0;

    const getVariantRoles = (character, variant) => [variant.label, character.name];

    function updateMatchModeControl() {
      const hasMultiple = pendingSelections.length > 1;
      if (matchModeEl) matchModeEl.hidden = !hasMultiple;
      if (requireAllEl) requireAllEl.checked = hasMultiple && pendingMatchMode === 'all';
    }

    /* ── Render helpers ── */

    function renderGroupTabs() {
      const tabBar = body.querySelector('.cf-tabs');
      if (!tabBar) return;
      tabBar.innerHTML = CHAR_GROUPS.map(g => `
        <button class="cf-tab${g.id === selectedGroup.id ? ' active' : ''}" data-gid="${g.id}" title="${g.label}" aria-label="${g.label}">
          ${g.logo ? `<img src="${esc(g.logo)}" alt="" loading="eager" onerror="this.style.display='none';this.nextElementSibling.hidden=false"><span hidden>${g.icon}</span>` : `<span>${g.icon}</span>`}
          <span class="cf-tab-label">${g.label}</span>
        </button>
      `).join('');
      tabBar.querySelectorAll('.cf-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedGroup = CHAR_GROUPS.find(g => g.id === btn.dataset.gid);
          selectedChar  = null;
          renderGroupTabs();
          renderCharCards();
          renderVariants();
        });
      });
    }

    function renderCharCards(filter = '') {
      const grid = body.querySelector('.cf-char-grid');
      if (!grid) return;
      const q = filter.toLowerCase().trim();
      const chars = selectedGroup.chars.filter(c => {
        if (!q) return true;
        const nameMatch = c.name.toLowerCase().includes(q);
        const variantMatch = c.variants.some(v =>
          v.label.toLowerCase().includes(q) || v.sub.toLowerCase().includes(q)
        );
        return nameMatch || variantMatch;
      });

      grid.innerHTML = chars.map(c => {
        const isActive = selectedChar && selectedChar.id === c.id;
        const hasSelectedVariant = pendingSelections.some(selection =>
          c.variants.some(v => {
            const roles = getVariantRoles(c, v);
            return v.actors.every(actor => selection.actors.includes(actor)) &&
              roles.every(role => selection.roles.includes(role));
          })
        );
        return `
          <button class="cf-char-card${isActive ? ' active' : ''}${hasSelectedVariant ? ' has-selected' : ''}" data-cid="${c.id}">
            <div class="cf-char-img-wrap">
              ${c.img ? `<img src="${c.img}" alt="${c.name}" loading="lazy" decoding="async" onerror="this.style.display='none'">` : ''}
            </div>
            <span class="cf-char-name">${c.name}</span>
          </button>
        `;
      }).join('');

      if (!chars.length) {
        grid.innerHTML = '<p class="cf-empty">No characters match your search.</p>';
      }

      grid.querySelectorAll('.cf-char-card').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedChar = selectedGroup.chars.find(c => c.id === btn.dataset.cid);
          renderCharCards(searchInp?.value || '');
          renderVariants();
        });
      });
    }

    function renderVariants() {
      const panel = body.querySelector('.cf-variants-panel');
      if (!panel) return;
      if (!selectedChar) {
        panel.innerHTML = '<p class="cf-empty">Selecciona un personaje</p>';
        return;
      }
      panel.innerHTML = `
        <div class="cf-selected-character">
          <img src="${selectedChar.img}" alt="${selectedChar.name}" loading="eager">
          <div>
            <p class="cf-variants-kicker">PERSONAJE</p>
            <p class="cf-variants-title">${selectedChar.name}</p>
          </div>
        </div>
        <div class="cf-variant-list">
          ${selectedChar.variants.map(v => {
            const variantRoles = getVariantRoles(selectedChar, v);
            const isSelected = pendingSelections.some(selection =>
              v.actors.every(actor => selection.actors.includes(actor))
            );
            return `<button class="cf-variant-chip${isSelected ? ' selected' : ''}" data-actors='${JSON.stringify(v.actors)}' aria-pressed="${isSelected}">
              <span class="cf-variant-check">${isSelected ? '✓' : ''}</span>
              <span class="cv-label">${v.label}</span>
              <span class="cv-sub">${v.sub}</span>
            </button>`;
          }).join('')}
        </div>
      `;
      panel.querySelectorAll('.cf-variant-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const actors = JSON.parse(btn.dataset.actors);
          const variant = selectedChar.variants.find(candidate =>
            JSON.stringify(candidate.actors) === JSON.stringify(actors)
          );
          const roles = getVariantRoles(selectedChar, variant);
          const titles = variant.titles || [];
          const isSelected = pendingSelections.some(selection =>
            actors.every(actor => selection.actors.includes(actor))
          );
          pendingSelections = isSelected
            ? pendingSelections.filter(selection => !actors.every(actor => selection.actors.includes(actor)))
            : [...pendingSelections, { actors, roles, titles }];
          pendingActors = [...new Set(pendingSelections.flatMap(selection => selection.actors))];
          pendingRoles = [...new Set(pendingSelections.flatMap(selection => selection.roles))];
          pendingTitles = [...new Set(pendingSelections.flatMap(selection => selection.titles))];
          updateMatchModeControl();
          renderVariants();
          renderCharCards(searchInp?.value || '');
        });
      });
    }

    function buildModal() {
      body.innerHTML = `
        <div class="cf-tabs"></div>
        <div class="cf-main">
          <div class="cf-char-grid"></div>
          <div class="cf-variants-panel"></div>
        </div>
      `;
      renderGroupTabs();
      renderCharCards();
      renderVariants();
    }

    /* ── Search ── */
    if (searchInp) {
      searchInp.addEventListener('input', () => {
        const q = searchInp.value.toLowerCase().trim();
        if (q) {
          // Search across all groups
          let foundGroup = null;
          for (const g of CHAR_GROUPS) {
            const match = g.chars.some(c =>
              c.name.toLowerCase().includes(q) ||
              c.variants.some(v => v.label.toLowerCase().includes(q) || v.sub.toLowerCase().includes(q))
            );
            if (match) { foundGroup = g; break; }
          }
          if (foundGroup && foundGroup.id !== selectedGroup.id) {
            selectedGroup = foundGroup;
            renderGroupTabs();
          }
        }
        renderCharCards(q);
      });
    }

    /* ── Open / close ── */
    function openModal() {
      pageScrollY = window.scrollY;
      document.body.style.top = `-${pageScrollY}px`;
      document.body.classList.add('char-filter-mode');
      selectedGroup = CHAR_GROUPS[0];
      selectedChar  = null;
      pendingActors = [...(state.charFilter?.actors || [])];
      pendingRoles = [...(state.charFilter?.roles || [])];
      pendingTitles = [...(state.charFilter?.titles || [])];
      pendingSelections = [...(state.charFilter?.selections || [])];
      pendingMatchMode = state.charFilter?.matchMode || 'any';
      if (!pendingSelections.length && pendingActors.length) {
        pendingSelections = CHAR_GROUPS.flatMap(g => g.chars.flatMap(c => c.variants
          .filter(v => v.actors.some(actor => pendingActors.includes(actor)))
          .map(v => ({ actors: v.actors, roles: getVariantRoles(c, v), titles: v.titles || [] }))));
      }
      if (!pendingRoles.length && pendingActors.length) {
        CHAR_GROUPS.forEach(g => g.chars.forEach(c => c.variants.forEach(v => {
          if (v.actors.some(actor => pendingActors.includes(actor))) {
            pendingRoles.push(...getVariantRoles(c, v));
          }
        })));
        pendingRoles = [...new Set(pendingRoles)];
      }
      if (searchInp) searchInp.value = '';

      // Pre-select current filter
      if (state.charFilter) {
        for (const g of CHAR_GROUPS) {
          for (const c of g.chars) {
            if (c.variants.some(v => getVariantRoles(c, v).some(role => pendingRoles.includes(role)))) {
              selectedGroup = g;
              selectedChar  = c;
              break;
            }
          }
          if (selectedChar) break;
        }
      }

      buildModal();
      updateMatchModeControl();
      modal.classList.remove('modal-hidden');
    }

    function closeModal() {
      modal.classList.add('modal-hidden');
      document.body.classList.remove('char-filter-mode');
      document.body.style.top = '';
      window.scrollTo(0, pageScrollY);
    }

    function applyFilter() {
      state.charFilter = pendingActors.length ? { actors: pendingActors, roles: pendingRoles, titles: pendingTitles, selections: pendingSelections, matchMode: pendingMatchMode } : null;
      if (state.charFilter) {
        let label = `Characters (${pendingActors.length})`;
        if (pendingActors.length === 1) {
          CHAR_GROUPS.forEach(g => g.chars.forEach(c => c.variants.forEach(v => {
            if (v.actors.includes(pendingActors[0])) label = c.name;
          })));
        }
        filterLabel.textContent = label;
        btnOpen.classList.add('char-active');
      } else {
        filterLabel.textContent = 'Characters';
        btnOpen.classList.remove('char-active');
      }
      closeModal();
      renderGrid(getFilteredItems());
    }

    btnOpen.addEventListener('click', openModal);
    btnClose.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    btnClear.addEventListener('click', () => {
      pendingActors = [];
      pendingRoles = [];
      pendingTitles = [];
      pendingSelections = [];
      pendingMatchMode = 'any';
      updateMatchModeControl();
      renderVariants();
      renderCharCards(searchInp?.value || '');
    });
    requireAllEl?.addEventListener('change', () => {
      pendingMatchMode = requireAllEl.checked ? 'all' : 'any';
    });
    btnApply.addEventListener('click', applyFilter);
  })();

}

/* ═══════════════════════════════════════════════════════════
   § 15  INITIALIZATION
   ═══════════════════════════════════════════════════════════ */
async function init() {
  const loader       = document.getElementById('app-loader');
  const barFill      = document.getElementById('loader-bar-fill');
  const barLabel     = document.getElementById('loader-bar-label');
  const loaderStatus = document.getElementById('loader-status');

  // Step 1: load catalog JSON
  if (loaderStatus) loaderStatus.textContent = 'Loading catalog…';
  try {
    const res = await fetch('peliculas.json?' + new Date().getTime());
    if (res.ok) {
      const data = await res.json();
      CATALOG = data.catalog || [];
      for (const item of CATALOG) {
        DISPLAY_CATALOG.push({ ...item, isGroup: false });
      }
    }
  } catch (err) {
    console.error('Error loading peliculas.json', err);
  }

  // Step 2: render the catalog immediately, then enrich cards in the background.
  if (loaderStatus) loaderStatus.textContent = 'Fetching TMDB data…';
  const total = CATALOG.filter(i => i.tmdbId).length;
  if (barLabel) barLabel.textContent = `0 / ${total}`;

  attachEvents();
  updateCatalogStatsDisplay();
  renderGrid(getFilteredItems());
  updateStats();
  updateCountdown();
  setInterval(updateCountdown, 1000);

  const pendingCardUids = new Set();
  let enrichmentFrame = 0;
  const flushEnrichmentUpdates = () => {
    enrichmentFrame = 0;
    if (state.searchMode) return;
    if (state.filters.sort !== 'default' || state.filters.search.trim() || state.charFilter) {
      pendingCardUids.clear();
      renderGrid(getFilteredItems());
      updateStats();
      updateCountdown();
      return;
    }
    pendingCardUids.forEach(uid => updateCardInPlace(uid));
    pendingCardUids.clear();
    const nextUid = getNextProjectCountdownItem()?.item.uid || null;
    if (state.countdownUid !== nextUid) {
      renderGrid(getFilteredItems());
    } else {
      updateStats();
    }
    updateCountdown();
  };

  const enrichment = enrichAllItems((done, tot, title, uid) => {
    const pct = tot > 0 ? (done / tot) * 100 : 0;
    if (barFill)  barFill.style.width = `${pct}%`;
    if (barLabel) barLabel.textContent = `${done} / ${tot}`;
    if (title) {
      if (uid) pendingCardUids.add(uid);
      if (!enrichmentFrame) enrichmentFrame = requestAnimationFrame(flushEnrichmentUpdates);
    }
  });

  // Step 3: only wait for local fonts before revealing the application.
  if (loaderStatus) loaderStatus.textContent = 'Preparing interface…';
  await preloadVisualAssets();

  // Animate loader out
  if (barFill)  barFill.style.width = '100%';
  if (loaderStatus) loaderStatus.textContent = 'Ready!';
  await sleep(400);
  if (loader) {
    loader.classList.add('loader-hidden');
  }

  await enrichment;
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
