const fs = require('fs');
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5MWE2Yzk5YWVlMjA5MTc3ODY2NjZjMzhhODczOWU2YSIsIm5iZiI6MTc2MTk0NTEyNS4zOTEsInN1YiI6IjY5MDUyNjI1OTBmMzM4Mzc2MjRjN2NiNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ebK9-2YoYZRKBQDHN3uhWMhEyyi77hOUD6ZTSfzWGPI';

async function fetchDate(item) {
  if (!item.tmdbId) return new Date('9999-01-01');
  if (item.customDate) {
    const d = item.customDate.split('/');
    if (d.length === 3) return new Date(d[2], d[1] - 1, d[0]);
    return new Date(item.customDate);
  }
  
  let seasonMatch = item.uid.match(/-s(\d+)$/);
  if (!seasonMatch) seasonMatch = item.title.match(/\(Season (\d+)\)/);
  const seasonNumber = seasonMatch ? parseInt(seasonMatch[1], 10) : null;
  
  let ep = '';
  if (item.type === 'movie') ep = `/movie/${item.tmdbId}`;
  else if (seasonNumber !== null) ep = `/tv/${item.tmdbId}/season/${seasonNumber}`;
  else ep = `/tv/${item.tmdbId}`;
  
  try {
    const res = await fetch('https://api.themoviedb.org/3' + ep, { headers: { 'Authorization': 'Bearer ' + token } });
    const d = await res.json();
    const dateStr = d.release_date || d.first_air_date || d.air_date;
    return dateStr ? new Date(dateStr) : new Date('9999-01-01');
  } catch (e) {
    return new Date('9999-01-01');
  }
}

async function sortCatalog() {
  const data = JSON.parse(fs.readFileSync('peliculas.json'));
  
  // Group by category first, to maintain category order
  const cats = [];
  const catMap = {};
  for (const item of data.catalog) {
    const cat = item.category || 'Unknown';
    if (!catMap[cat]) {
      catMap[cat] = [];
      cats.push(cat);
    }
    catMap[cat].push({ item, date: await fetchDate(item) });
    console.log('Fetched date for', item.title);
  }
  
  const newCatalog = [];
  for (const cat of cats) {
    catMap[cat].sort((a, b) => a.date - b.date);
    for (const obj of catMap[cat]) {
      newCatalog.push(obj.item);
    }
  }
  
  data.catalog = newCatalog;
  fs.writeFileSync('peliculas.json', JSON.stringify(data, null, 2));
  console.log('Sorted and saved peliculas.json');
}

sortCatalog();
