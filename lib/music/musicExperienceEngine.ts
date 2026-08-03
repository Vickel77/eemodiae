// @ts-nocheck
/* Music experience engine — ported from implementation/music-experience.html */

let ARTISTS = [];
let SONGS = [];
let ALBUMS = [];
let _onNavigate = null;
let _rootEl = null;

const PER_PAGE = { artists: 8, songs: 8, artistSongs: 8, albums: 8 };

const $ = (s) => (_rootEl || document).querySelector(s);
const artistById = (id) => ARTISTS.find((a) => a.id === id);
const albumById = (id) => ALBUMS.find((a) => a.id === id);
const songById = (id) => SONGS.find((s) => s.id === id);
const songsInAlbum = (id) => SONGS.filter((s) => s.albumId === id);
const esc = (s) =>
  String(s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
const dur = (s) => (s ? Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0") : "");

function shareSong(id) {
  const song = songById(id);
  if (!song) return;
  const artist = artistById(song.artistId);
  const url = `https://eemodiae.org/music/${id}`;
  const data = {
    title: song.title,
    text: `${song.title} by ${artist ? artist.name : "EEMODIAE"}`,
    url,
  };
  if (navigator.share) {
    navigator.share(data).catch(() => {});
    return;
  }
  navigator.clipboard &&
    navigator.clipboard
      .writeText(url)
      .then(() => toast("Link copied to clipboard."))
      .catch(() => toast("Copy this link: " + url));
}

function downloadSong(id) {
  const song = songById(id);
  if (!song) return;
  if (!song.audio) {
    toast("Download will be available once the track is uploaded.");
    return;
  }
  fetch(song.audio)
    .then((response) => response.blob())
    .then((blob) => {
      const blobURL = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobURL;
      link.download = (song.title || "download") + ".mp3";
      link.click();
      window.URL.revokeObjectURL(blobURL);
    })
    .catch(() => {
      const a = document.createElement("a");
      a.href = song.audio;
      a.download = song.title + ".mp3";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
}

function toast(msg) {
  const t = $("#mx-toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2600);
}

function paginate({ items, page, perPage, gridEl, navEl, renderItem, onPage }) {
  const total = Math.max(1, Math.ceil(items.length / perPage));
  page = Math.min(Math.max(1, page), total);
  const slice = items.slice((page - 1) * perPage, page * perPage);

  gridEl.innerHTML = slice.length ? slice.map(renderItem).join("") : "";
  if (!slice.length) {
    gridEl.insertAdjacentHTML(
      "beforeend",
      '<div class="mx-empty" style="grid-column:1/-1">Nothing here yet. New releases are on the way.</div>'
    );
  }

  if (total <= 1) {
    navEl.hidden = true;
    navEl.innerHTML = "";
    return page;
  }
  navEl.hidden = false;

  const btn = (label, p, opts = {}) =>
    `<button class="mx-page-btn" data-page="${p}" ${opts.current ? 'aria-current="page"' : ""} ${opts.disabled ? "disabled" : ""} aria-label="${opts.aria || `Page ${p}`}">${label}</button>`;

  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - page) <= 1) pages.push(i);
  }
  let html = btn("&lsaquo;", page - 1, { disabled: page === 1, aria: "Previous page" });
  let prev = 0;
  for (const p of pages) {
    if (p - prev > 1) html += '<span class="mx-page-ellipsis">&middot;&middot;&middot;</span>';
    html += btn(p, p, { current: p === page });
    prev = p;
  }
  html += btn("&rsaquo;", page + 1, { disabled: page === total, aria: "Next page" });
  navEl.innerHTML = html;

  navEl.onclick = (e) => {
    const b = e.target.closest("[data-page]");
    if (!b || b.disabled) return;
    onPage(parseInt(b.dataset.page, 10));
  };
  return page;
}

function coverMarkup(item) {
  const artist = artistById(item.artistId);
  if (item.cover) {
    return `<img src="${esc(item.cover)}" alt="${esc(item.title)} cover art" loading="lazy">`;
  }
  const [c1, c2] = item.palette || ["#37215c", "#553192"];
  return `<div class="mx-cover-gen" style="background:radial-gradient(circle at 28% 22%,${c2},${c1})">
    <span class="mx-cover-note" aria-hidden="true">&#9835;</span>
    <span class="mx-cover-title">${esc(item.title)}</span>
    <span class="mx-cover-artist">${esc(artist ? artist.name : "")}</span>
  </div>`;
}

function songCard(song) {
  const artist = artistById(song.artistId);
  const d = dur(song.duration);
  return `<article class="mx-song mx-reveal" data-open="${song.id}" role="button" tabindex="0" aria-label="Open ${esc(song.title)}">
    <div class="mx-cover">
      ${coverMarkup(song)}
      <button class="mx-play" data-play="${song.id}" aria-label="Play ${esc(song.title)}">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>
    <div class="mx-song-meta">
      ${d ? `<span class="mx-duration">${d}</span>` : ""}
      <h3>${esc(song.title)}</h3>
      <p>${esc(artist ? artist.name : "")}</p>
      <div class="mx-song-actions">
        <button class="mx-chip" data-share="${song.id}" aria-label="Share ${esc(song.title)}">
          <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.5" y1="13.5" x2="15.5" y2="17.5"/><line x1="15.5" y1="6.5" x2="8.5" y2="10.5"/></svg>Share
        </button>
        <button class="mx-chip" data-download="${song.id}" aria-label="Download ${esc(song.title)}">
          <svg viewBox="0 0 24 24"><path d="M12 3v12"/><polyline points="7 11 12 16 17 11"/><line x1="5" y1="20" x2="19" y2="20"/></svg>Save
        </button>
      </div>
    </div>
  </article>`;
}

function albumCard(album) {
  const artist = artistById(album.artistId);
  const n = songsInAlbum(album.id).length;
  return `<article class="mx-song is-album mx-reveal" data-album="${album.id}" role="button" tabindex="0" aria-label="Open album ${esc(album.title)}">
    <div class="mx-cover">
      ${coverMarkup(album)}
      <button class="mx-play" data-album-play="${album.id}" aria-label="Play album ${esc(album.title)}">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>
    <div class="mx-song-meta">
      <h3>${esc(album.title)}</h3>
      <p>${esc(artist ? artist.name : "")} &middot; ${n === 1 ? "1 song" : n + " songs"}</p>
    </div>
  </article>`;
}

function artistCard(artist) {
  const avatar = artist.photo
    ? `<img src="${esc(artist.photo)}" alt="Portrait of ${esc(artist.name)}" loading="lazy">`
    : `<span aria-hidden="true">${initials(artist.name)}</span>`;
  return `<article class="mx-artist mx-reveal" data-artist="${artist.id}" role="button" tabindex="0" aria-label="View ${esc(artist.name)}">
    <div class="mx-avatar">${avatar}</div>
    <h3>${esc(artist.name)}</h3>
    <p>${esc(artist.role)}</p>
    <span class="mx-artist-open">View songs</span>
  </article>`;
}

const state = {
  query: "",
  artistPage: 1,
  albumPage: 1,
  songPage: 1,
  artistSongsPage: 1,
};

const recentSongs = (list) => [...list].sort((a, b) => (b.release || "").localeCompare(a.release || ""));

function filteredArtists() {
  if (!state.query) return ARTISTS;
  const q = state.query.toLowerCase();
  return ARTISTS.filter((a) => a.name.toLowerCase().includes(q));
}

function filteredSongs() {
  if (!state.query) return SONGS;
  const q = state.query.toLowerCase();
  return SONGS.filter((s) => {
    const a = artistById(s.artistId);
    return s.title.toLowerCase().includes(q) || (a && a.name.toLowerCase().includes(q));
  });
}

function filteredAlbums() {
  if (!state.query) return ALBUMS;
  const q = state.query.toLowerCase();
  return ALBUMS.filter((al) => {
    const a = artistById(al.artistId);
    return al.title.toLowerCase().includes(q) || (a && a.name.toLowerCase().includes(q));
  });
}

function renderGallery() {
  const artists = filteredArtists();
  const albums = filteredAlbums();
  const songs = recentSongs(filteredSongs());
  const artistsCount = $("#mx-artistes-count");
  const albumsCount = $("#mx-albums-count");
  const songsCount = $("#mx-songs-count");
  if (artistsCount) artistsCount.textContent = artists.length === 1 ? "1 artiste" : artists.length + " artistes";
  if (albumsCount) albumsCount.textContent = albums.length === 1 ? "1 album" : albums.length + " albums";
  if (songsCount) songsCount.textContent = songs.length === 1 ? "1 song" : songs.length + " songs";

  state.artistPage = paginate({
    items: artists,
    page: state.artistPage,
    perPage: PER_PAGE.artists,
    gridEl: $("#mx-artists-grid"),
    navEl: $("#mx-artists-pagination"),
    renderItem: artistCard,
    onPage: (p) => {
      state.artistPage = p;
      renderGallery();
    },
  });

  const albumsSection = $("#mx-albums-section");
  if (albumsSection) albumsSection.style.display = albums.length ? "" : "none";
  state.albumPage = paginate({
    items: albums,
    page: state.albumPage,
    perPage: PER_PAGE.albums,
    gridEl: $("#mx-albums-grid"),
    navEl: $("#mx-albums-pagination"),
    renderItem: albumCard,
    onPage: (p) => {
      state.albumPage = p;
      renderGallery();
    },
  });

  state.songPage = paginate({
    items: songs,
    page: state.songPage,
    perPage: PER_PAGE.songs,
    gridEl: $("#mx-songs-grid"),
    navEl: $("#mx-songs-pagination"),
    renderItem: songCard,
    onPage: (p) => {
      state.songPage = p;
      renderGallery();
    },
  });
  observeReveals();
}

function renderArtist(id) {
  const artist = artistById(id);
  if (!artist) return;
  const songs = SONGS.filter((s) => s.artistId === id);
  const avatar = artist.photo
    ? `<img src="${esc(artist.photo)}" alt="Portrait of ${esc(artist.name)}" loading="lazy">`
    : `<span aria-hidden="true">${initials(artist.name)}</span>`;
  const hero = $("#mx-artist-hero");
  if (hero) {
    hero.innerHTML = `
    <div class="mx-avatar">${avatar}</div>
    <div>
      <h2>${esc(artist.name)}</h2>
      <p>${esc(artist.bio)}</p>
      <div class="mx-artist-songcount">${songs.length === 1 ? "1 song" : songs.length + " songs"}</div>
    </div>`;
  }
  const count = $("#mx-artist-songs-count");
  if (count) count.textContent = songs.length === 1 ? "1 song" : songs.length + " songs";
  state.artistSongsPage = paginate({
    items: songs,
    page: state.artistSongsPage,
    perPage: PER_PAGE.artistSongs,
    gridEl: $("#mx-artist-songs-grid"),
    navEl: $("#mx-artist-songs-pagination"),
    renderItem: songCard,
    onPage: (p) => {
      state.artistSongsPage = p;
      renderArtist(id);
    },
  });
  observeReveals();
}

function bigCover(item) {
  return `<div class="mx-sd-cover">${coverMarkup(item)}</div>`;
}

function renderSong(id) {
  const song = songById(id);
  if (!song) return;
  const artist = artistById(song.artistId);
  const album = albumById(song.albumId);
  const d = dur(song.duration);
  const metaBits = [
    artist ? esc(artist.name) : "",
    album ? esc(album.title) : "",
    d ? d : "",
    song.release ? new Date(song.release).getFullYear() : "",
  ]
    .filter(Boolean)
    .join(" &middot; ");

  let lyricsHTML = `<p class="mx-empty">Lyrics will be added soon.</p>`;
  if (song.lyricsHtml) {
    lyricsHTML = song.lyricsHtml;
  } else if (song.lyrics && song.lyrics.length) {
    lyricsHTML = song.lyrics
      .map(
        (block, i) =>
          `<div class="mx-verse${i === 1 ? " chorus" : ""}">${block.map((l) => `<p>${esc(l)}</p>`).join("")}</div>`
      )
      .join("");
  }

  const detail = $("#mx-song-detail");
  if (!detail) return;
  detail.innerHTML = `
    <div class="mx-sd-top">
      ${bigCover(song)}
      <div class="mx-sd-info">
        <div class="mx-sd-eyebrow">Now Presenting</div>
        <h2>${esc(song.title)}</h2>
        <div class="mx-sd-artist">by <a data-artist="${song.artistId}" role="button" tabindex="0">${esc(artist ? artist.name : "")}</a></div>
        <div class="mx-sd-meta-row">${metaBits}</div>
        <div class="mx-sd-actions">
          <button class="mx-btn mx-btn-primary" data-play="${song.id}">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Play
          </button>
          <button class="mx-btn mx-btn-ghost" data-share="${song.id}">
            <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.5" y1="13.5" x2="15.5" y2="17.5"/><line x1="15.5" y1="6.5" x2="8.5" y2="10.5"/></svg>Share
          </button>
          <button class="mx-btn mx-btn-ghost" data-download="${song.id}">
            <svg viewBox="0 0 24 24"><path d="M12 3v12"/><polyline points="7 11 12 16 17 11"/><line x1="5" y1="20" x2="19" y2="20"/></svg>Save
          </button>
        </div>
      </div>
    </div>

    ${song.scripture ? `<blockquote class="mx-scripture">
      <p>${esc(song.scripture.text)}</p>
      <cite>${esc(song.scripture.ref)}</cite>
    </blockquote>` : ""}

    ${song.reflection ? `<p class="mx-reflection">${esc(song.reflection)}</p>` : ""}

    <h3 class="mx-lyrics-h">Lyrics</h3>
    <div class="mx-lyrics">${lyricsHTML}</div>
  `;
}

function renderAlbum(id) {
  const album = albumById(id);
  if (!album) return;
  const artist = artistById(album.artistId);
  const tracks = songsInAlbum(id);
  const hero = $("#mx-album-hero");
  if (hero) {
    hero.innerHTML = `
    ${bigCover(album)}
    <div class="mx-sd-info">
      <div class="mx-sd-eyebrow">Album</div>
      <h2>${esc(album.title)}</h2>
      <div class="mx-sd-artist"><a data-artist="${album.artistId}" role="button" tabindex="0">${esc(artist ? artist.name : "")}</a></div>
      <div class="mx-sd-meta-row">${album.year || ""} &middot; ${tracks.length === 1 ? "1 song" : tracks.length + " songs"}</div>
      <div class="mx-sd-actions">
        <button class="mx-btn mx-btn-primary" data-album-play="${album.id}">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Play album
        </button>
      </div>
    </div>`;
  }
  const tracksCount = $("#mx-album-tracks-count");
  if (tracksCount) tracksCount.textContent = tracks.length === 1 ? "1 song" : tracks.length + " songs";
  const trackList = $("#mx-album-tracks");
  if (trackList) {
    trackList.innerHTML = tracks.length
      ? tracks
          .map(
            (s) => `<li class="mx-track" data-open="${s.id}" role="button" tabindex="0" aria-label="Open ${esc(s.title)}">
        <span class="mx-track-num" aria-hidden="true"></span>
        <div class="mx-track-body">
          <div class="t">${esc(s.title)}</div>
          <div class="s">${esc(artist ? artist.name : "")}</div>
        </div>
        <span class="mx-track-dur">${dur(s.duration)}</span>
      </li>`
          )
          .join("")
      : `<li class="mx-empty">Songs are on the way.</li>`;
  }
}

function showView(name) {
  document.querySelectorAll(".mx-view").forEach((v) => v.classList.remove("active"));
  const view = $("#view-" + name);
  if (view) view.classList.add("active");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function applyState(s) {
  if (s && s.view === "artist" && artistById(s.id)) {
    renderArtist(s.id);
    showView("artist");
  } else if (s && s.view === "album" && albumById(s.id)) {
    renderAlbum(s.id);
    showView("album");
  } else if (s && s.view === "song" && songById(s.id)) {
    renderSong(s.id);
    showView("song");
  } else {
    showView("gallery");
  }
}

function navigate(view, id) {
  if (view === "artist") state.artistSongsPage = 1;
  const s = { view, id };
  if (_onNavigate) _onNavigate(s);
  applyState(s);
}

const openArtist = (id) => navigate("artist", id);
const openAlbum = (id) => navigate("album", id);
const openSong = (id) => navigate("song", id);

function goBack() {
  if (_onNavigate) {
    _onNavigate({ view: "gallery" });
    applyState({ view: "gallery" });
    return;
  }
  applyState({ view: "gallery" });
}

const Player = {
  audio: null,
  queue: [],
  index: -1,

  ensureAudio() {
    if (!this.audio) this.audio = new Audio();
    return this.audio;
  },

  playable() {
    return SONGS.filter((s) => s.audio);
  },

  play(songId) {
    const song = SONGS.find((s) => s.id === songId);
    if (!song) return;
    if (!song.audio) {
      toast("This song will be available to stream very soon.");
      return;
    }
    this.queue = this.playable();
    this.index = this.queue.findIndex((s) => s.id === songId);
    this.load(this.queue[this.index]);
  },

  playAlbum(albumId) {
    const tracks = songsInAlbum(albumId).filter((s) => s.audio);
    if (!tracks.length) {
      toast("This album will be available to stream very soon.");
      return;
    }
    this.queue = tracks;
    this.index = 0;
    this.load(this.queue[0]);
  },

  load(song) {
    const artist = artistById(song.artistId);
    const audio = this.ensureAudio();
    audio.src = song.audio;
    audio.play().catch(() => {});
    const title = $("#mx-now-title");
    const artistEl = $("#mx-now-artist");
    if (title) title.textContent = song.title;
    if (artistEl) artistEl.textContent = artist ? artist.name : "";
    $("#mx-player")?.classList.add("active");
    _rootEl?.classList.add("player-open");
    if ("mediaSession" in navigator) {
      const album = albumById(song.albumId);
      const artwork = [];
      const art = song.cover || (album && album.cover);
      if (art) artwork.push({ src: art, sizes: "512x512" });
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: artist ? artist.name : "EEMODIAE",
        album: album ? album.title : "EEMODIAE Music",
        artwork,
      });
      navigator.mediaSession.setActionHandler("play", () => audio.play());
      navigator.mediaSession.setActionHandler("pause", () => audio.pause());
      navigator.mediaSession.setActionHandler("previoustrack", () => this.step(-1));
      navigator.mediaSession.setActionHandler("nexttrack", () => this.step(1));
    }
  },

  step(dir) {
    if (!this.queue.length) return;
    this.index = (this.index + dir + this.queue.length) % this.queue.length;
    this.load(this.queue[this.index]);
  },

  toggle() {
    const audio = this.ensureAudio();
    if (!audio.src) return;
    audio.paused ? audio.play() : audio.pause();
  },

  close() {
    const audio = this.ensureAudio();
    audio.pause();
    audio.removeAttribute("src");
    $("#mx-player")?.classList.remove("active");
    _rootEl?.classList.remove("player-open");
  },
};

const fmt = (s) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return m + ":" + String(r).padStart(2, "0");
};

function routeAction(el) {
  if (el.matches("[data-back]")) {
    goBack();
    return true;
  }
  if (el.hasAttribute("data-play")) {
    Player.play(el.dataset.play);
    return true;
  }
  if (el.hasAttribute("data-album-play")) {
    Player.playAlbum(el.dataset.albumPlay);
    return true;
  }
  if (el.hasAttribute("data-share")) {
    shareSong(el.dataset.share);
    return true;
  }
  if (el.hasAttribute("data-download")) {
    downloadSong(el.dataset.download);
    return true;
  }
  if (el.hasAttribute("data-artist")) {
    openArtist(el.dataset.artist);
    return true;
  }
  if (el.hasAttribute("data-album")) {
    openAlbum(el.dataset.album);
    return true;
  }
  if (el.hasAttribute("data-open")) {
    openSong(el.dataset.open);
    return true;
  }
  return false;
}

const ACTION_SELECTOR =
  "[data-back],[data-play],[data-album-play],[data-share],[data-download],[data-artist],[data-album],[data-open]";

function onDocClick(e) {
  const el = e.target.closest(ACTION_SELECTOR);
  if (el) routeAction(el);
}

function onDocKeydownActivate(e) {
  if (e.key !== "Enter" && e.key !== " ") return;
  const el = e.target.closest && e.target.closest(ACTION_SELECTOR);
  if (el && (el.getAttribute("role") === "button" || el.tagName === "BUTTON" || el.tagName === "A")) {
    e.preventDefault();
    routeAction(el);
  }
}

function onDocKeydownSpace(e) {
  if (e.code !== "Space") return;
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
  if (e.target.closest(ACTION_SELECTOR)) return;
  const audio = Player.ensureAudio();
  if (audio.src) {
    e.preventDefault();
    Player.toggle();
  }
}

let searchTimer;
function onSearchInput(e) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.query = e.target.value.trim();
    state.artistPage = 1;
    state.albumPage = 1;
    state.songPage = 1;
    renderGallery();
  }, 160);
}

let revealObserver;
function observeReveals() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".mx-reveal").forEach((el) => el.classList.add("in"));
    return;
  }
  revealObserver =
    revealObserver ||
    new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            revealObserver.unobserve(en.target);
          }
        });
      },
      { rootMargin: "40px" }
    );
  document.querySelectorAll(".mx-reveal:not(.in)").forEach((el) => revealObserver.observe(el));
}

function bindPlayerEvents() {
  const audio = Player.ensureAudio();
  audio.addEventListener("timeupdate", onTimeUpdate);
  audio.addEventListener("ended", onEnded);
  audio.addEventListener("play", onPlayIcon);
  audio.addEventListener("pause", onPauseIcon);
  $("#mx-toggle")?.addEventListener("click", () => Player.toggle());
  $("#mx-prev")?.addEventListener("click", () => Player.step(-1));
  $("#mx-next")?.addEventListener("click", () => Player.step(1));
  $("#mx-close")?.addEventListener("click", () => Player.close());
  $("#mx-progress")?.addEventListener("click", onProgressClick);
}

function onTimeUpdate() {
  const audio = Player.ensureAudio();
  const { currentTime, duration } = audio;
  const pct = duration ? (currentTime / duration) * 100 : 0;
  const fill = $("#mx-progress-fill");
  const progress = $("#mx-progress");
  const time = $("#mx-time");
  if (fill) fill.style.width = pct + "%";
  if (progress) progress.setAttribute("aria-valuenow", Math.round(pct));
  if (time) time.textContent = fmt(currentTime) + " / " + fmt(duration);
}

function onEnded() {
  Player.step(1);
}

function onPlayIcon() {
  const icon = $("#mx-toggle-icon");
  if (icon) icon.innerHTML = '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>';
}

function onPauseIcon() {
  const icon = $("#mx-toggle-icon");
  if (icon) icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
}

function onProgressClick(e) {
  const audio = Player.ensureAudio();
  if (!audio.duration) return;
  const r = e.currentTarget.getBoundingClientRect();
  audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
}

let _initialized = false;

export function initMusicExperience({
  rootEl,
  artists = [],
  songs = [],
  albums = [],
  initialView = "gallery",
  initialId = null,
  onNavigate = null,
}) {
  destroyMusicExperience();
  _rootEl = rootEl;
  ARTISTS = artists;
  SONGS = songs;
  ALBUMS = albums;
  _onNavigate = onNavigate;

  state.query = "";
  state.artistPage = 1;
  state.albumPage = 1;
  state.songPage = 1;
  state.artistSongsPage = 1;

  bindPlayerEvents();
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onDocKeydownActivate);
  document.addEventListener("keydown", onDocKeydownSpace);
  $("#mx-search-input")?.addEventListener("input", onSearchInput);

  if (initialView === "artist" && initialId && artistById(initialId)) {
    applyState({ view: "artist", id: initialId });
  } else if (initialView === "album" && initialId && albumById(initialId)) {
    applyState({ view: "album", id: initialId });
  } else if (initialView === "song" && initialId && songById(initialId)) {
    applyState({ view: "song", id: initialId });
  } else {
    renderGallery();
    showView("gallery");
  }

  _initialized = true;
}

export function destroyMusicExperience() {
  if (!_initialized && !_rootEl) return;
  document.removeEventListener("click", onDocClick);
  document.removeEventListener("keydown", onDocKeydownActivate);
  document.removeEventListener("keydown", onDocKeydownSpace);
  $("#mx-search-input")?.removeEventListener("input", onSearchInput);
  Player.close();
  if (Player.audio) {
    Player.audio.removeEventListener("timeupdate", onTimeUpdate);
    Player.audio.removeEventListener("ended", onEnded);
    Player.audio.removeEventListener("play", onPlayIcon);
    Player.audio.removeEventListener("pause", onPauseIcon);
  }
  clearTimeout(searchTimer);
  _initialized = false;
  _rootEl = null;
  _onNavigate = null;
}
