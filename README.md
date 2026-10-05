<div align="center">
  <img src="Assets/logoDoom.png" alt="Avengers: Doomsday logo" width="300" />
  <br>
  <h1>Which Movies Am I Missing Before Avengers: Doomsday?</h1>

  <p><strong>A fan-made Marvel marathon tracker to help you prepare for the biggest MCU event of the next era.</strong></p>

  <p>
    <a href="https://davidferreiro-dev.github.io/Doomsday-Watchlist/" target="_blank" rel="noopener noreferrer">Open the live site</a>
  </p>
</div>

## 🎬 About the project

This website is a personal, fan-made watchlist and progress tracker created to help Marvel fans organize everything they need to watch before the release of *Avengers: Doomsday* in December 2026.

The catalog includes a broad set of titles from the Marvel Cinematic Universe, 20th Century Fox properties, Sony's Spider-Verse and related universe, and Netflix/Defenders-era entries. The app is built to make the marathon easier to plan, track, and complete.

<p align="center">
  <img src="Assets/preview.png" alt="Doomsday Watchlist preview" width="900" />
</p>

It is designed for people who want to:

- know exactly which movies and shows are part of the essential Marvel timeline,
- track what they have already watched,
- estimate how much time is left before they are fully prepared,
- filter the list by status, format, universe, or phase,
- keep a clean and practical watchlist without needing any backend or database.

## 🧪 Local installation and editing

This project is a static site, so there is no build step or dependency installation required.

1. Download the project or clone the repository.
2. Open the folder in VS Code or your editor of choice.
3. Open `index.html` directly in a browser for a quick check, or run a simple local server for a better development experience.
4. Edit `index.html`, `styles.css`, `script.js`, or `peliculas.json` as needed.
5. Refresh the browser to see your changes.

If you want to run a quick local server, you can use something like `python3 -m http.server` from the project folder and open the shown local address in your browser.

The project works well with static hosting such as GitHub Pages or Vercel.

## ✨ Features

- 111-title Marvel catalog spanning the main storylines and connected universes
- Countdown to *Avengers: Doomsday* release date
- Total runtime and watched/remaining time tracking
- Progress bar and percentage completion
- Search by title
- Filters by:
  - watched / pending
  - movie / TV show
  - universe / phase
- Essential watchlist shortcut for the most important titles
- Disney official-style essential list toggle
- Mark visible items as watched
- Reset progress button
- Export watch progress to JSON
- Import watch progress from JSON
- Local browser persistence with `localStorage`
- Responsive and modern UI
- Dynamic TMDB-powered title enrichment for posters, runtime, and metadata

## 📚 Included universes and catalog scope

The tracker covers content from multiple Marvel-related branches, including:

- MCU timeline (Infinity Saga and Multiverse Saga)
- MCU Phase 1 through Phase 6
- Netflix / Defenders era
- 20th Century Fox titles such as X-Men and Fantastic Four
- New Line Cinema entries such as Blade
- Sony Spider-Verse and Sony's Spider-Man Universe
- Ghost Rider-related content

## 🚀 How to use it

1. Open `index.html` in your browser.
2. Browse the catalog or use the search and filters.
3. Click titles to mark them as watched or pending.
4. Use the essential watchlist to focus only on the most important titles.
5. Export your progress whenever you want to save it.
6. Import it back later to continue where you left off.

You can also host the project on any static hosting service, such as GitHub Pages or Vercel, without needing a build pipeline.

## 🛠️ Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- The Movie Database (TMDB) API
- Local browser storage for personal progress tracking

## 📁 Project structure

- `index.html` — main app structure
- `styles.css` — visual design and responsive layout
- `script.js` — catalog logic, filters, progress tracking, and TMDB integration
- `peliculas.json` — catalog data
- `Assets/` — images, icons, and visual assets
- `LICENSE` — project license

## 🖼️ Credits

### Marvel and related rights holders

This project is a fan-made tribute based on Marvel-related characters, films, series, logos, and trademarks. All original intellectual property belongs to Marvel Studios, The Walt Disney Company, 20th Century Studios, Sony Pictures, and their respective rights holders.

### TMDB

This project uses The Movie Database (TMDB) for metadata such as posters, runtimes, release information, and related title data. TMDB is not affiliated with this project and does not endorse it.

## ⚖️ License

This project is distributed under the MIT License. If you create a derivative project, you must keep the copyright and license notice from the original MIT license and include the disclaimer that comes with it.

The MIT license allows you to reuse, modify, and redistribute the code, including in derivative projects, as long as the required notice is preserved. It does not grant rights to Marvel, Disney, Fox, Sony, or TMDB trademarks, logos, posters, or other third-party assets. If your derivative uses those brands or data, you are responsible for making sure you have the right to do so and for keeping the same non-affiliation disclaimers.

---

<footer>
  <p>
    <strong>Doomsday Watchlist</strong><br>
    Updated: October 2026<br>
    Made by David Ferreiro
  </p>
  <p>
    © 2026 David Ferreiro · Built for Marvel fans preparing for Avengers: Doomsday
  </p>
</footer>
