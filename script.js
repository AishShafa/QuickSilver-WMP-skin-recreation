/* ==========================================================================
   QUICKSILVER – behaviour

   >>> TO ADD MUSIC: edit the PLAYLIST array below. <<<
   Put your .mp3 files in a "music" folder next to index.html, then add one
   line per song:   { title: "Song name", artist: "Artist", src: "music/file.mp3" }

   Or click the FOLDER button on the ring to load MP3s from your computer
   (those are not remembered after a reload).

   CONTENTS
     1 Playlist   2 Elements   3 State   4 Shutter animation   5 Loading
     6 Controls   7 Audio events   8 Visualization   9 Drawer   10 Keys/fit
   ========================================================================== */

/* ---------- 1. PLAYLIST (edit me!) ---------- */
const PLAYLIST = [
  // { title: "My First Song", artist: "Me",        src: "music/first-song.mp3" },
  // { title: "Another Track", artist: "Some Band", src: "music/another-track.mp3" },
];

/* ---------- 2. ELEMENTS ---------- */
const $ = (id) => document.getElementById(id);
const stage = $("player");
const el = {
  title: $("m-title"), artist: $("m-artist"), time: $("m-time"),
  play: $("btn-play"), stop: $("btn-stop"), prev: $("btn-prev"), next: $("btn-next"),
  open: $("btn-open"), file: $("file-input"), mute: $("btn-mute"),
  pl: $("btn-pl"), rep: $("btn-rep"), vis: $("btn-vis"), eye: $("btn-shutter"),
  seek: $("seek"), volume: $("volume"), shutter: $("shutter"), drawer: $("drawer"), canvas: $("vis"),
};

/* ---------- 3. STATE ---------- */
const audio = new Audio();
let index = -1, repeat = false, scrubbing = false;
audio.volume = el.volume.value / 100;

/* ---------- 4. SHUTTER ANIMATION ----------
   The original skin ships 30 shutter frames: frame 0 = closed (shows the
   "Windows Media Player 9 Series" logo), frame 29 = fully open (shows the glass). */
const FRAMES = 30, frameSrc = (i) => `skin/shutter${String(i).padStart(2, "0")}.png`;
for (let i = 0; i < FRAMES; i++) new Image().src = frameSrc(i);   // preload so playback is smooth
let frame = 0, shutterOpen = false, timer = null;

/** Animate the shutter to open (true) or closed (false) at ~30 fps */
function setShutter(open) {
  shutterOpen = open;
  stage.classList.toggle("open", open);
  clearInterval(timer);
  timer = setInterval(() => {
    frame += open ? 1 : -1;
    el.shutter.src = frameSrc(frame);
    if (frame <= 0 || frame >= FRAMES - 1) clearInterval(timer);
  }, 33);
}
el.eye.onclick = () => setShutter(!shutterOpen);

/* ---------- 5. TRACK LOADING ---------- */
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Show the "Playing" state on the glass button and mark the current song in the drawer */
function syncState() {
  const on = !audio.paused;
  stage.classList.toggle("playing", on);
  el.play.title = on ? "Pause" : "Play";
  drawList();
}
/** Load track i (wraps around) and optionally start it */
function load(i, autoplay = true) {
  if (!PLAYLIST.length) { el.open.click(); return; }       // nothing to play yet: offer the file picker
  index = (i + PLAYLIST.length) % PLAYLIST.length;
  const t = PLAYLIST[index];
  audio.src = t.src;
  el.title.textContent = t.title || t.src.split("/").pop();
  el.artist.textContent = t.artist || "";
  if (!shutterOpen) setShutter(true);                      // reveal the display like the original
  if (autoplay) audio.play().catch(() => {});              // browsers may block autoplay
  drawList();
}

/* ---------- 6. CONTROLS ---------- */
el.play.onclick = () => (index < 0 ? load(0) : audio.paused ? audio.play() : audio.pause());
el.stop.onclick = () => {
  audio.pause(); audio.currentTime = 0; index = -1;
  el.time.textContent = "0:00"; el.seek.value = 0;
  setShutter(false); syncState();
};
el.next.onclick = () => load(index + 1);
el.prev.onclick = () => (audio.currentTime > 3 ? (audio.currentTime = 0) : load(index - 1)); // restart, else go back

/* Folder button -> file picker. Chosen files are appended to the playlist. */
el.open.onclick = () => el.file.click();
el.file.onchange = () => {
  const first = PLAYLIST.length;
  for (const f of el.file.files)
    PLAYLIST.push({ title: f.name.replace(/\.[^.]+$/, ""), artist: "Local file", src: URL.createObjectURL(f) });
  if (PLAYLIST.length > first) load(first);
  el.file.value = "";
};

el.mute.onclick = () => el.mute.classList.toggle("on", (audio.muted = !audio.muted));
el.rep.onclick  = () => el.rep.classList.toggle("on", (repeat = !repeat));
el.pl.onclick   = () => { el.drawer.hidden = !el.drawer.hidden; el.pl.classList.toggle("on", !el.drawer.hidden); drawList(); };
el.vis.onclick  = () => {
  const on = el.canvas.style.display !== "block";
  el.canvas.style.display = on ? "block" : "none";
  el.vis.classList.toggle("on", on);
  if (on) { if (!shutterOpen) setShutter(true); draw(); }
};
el.volume.oninput = () => { audio.volume = el.volume.value / 100; audio.muted = false; el.mute.classList.remove("on"); };
el.seek.oninput   = () => { scrubbing = true; };
el.seek.onchange  = () => { audio.currentTime = (el.seek.value / 1000) * (audio.duration || 0); scrubbing = false; };

/* ---------- 7. AUDIO EVENTS ---------- */
audio.onplay = audio.onpause = syncState;
audio.ontimeupdate = () => {
  if (!audio.duration || scrubbing) return;
  el.seek.value = (audio.currentTime / audio.duration) * 1000;
  el.time.textContent = fmt(audio.currentTime);
};
audio.onended = () => {
  if (repeat) { audio.currentTime = 0; audio.play(); return; }
  if (index < PLAYLIST.length - 1) load(index + 1); else el.stop.click();   // end of list
};
audio.onerror = () => { if (index >= 0) el.artist.textContent = "Can't play this file – check its path"; };

/* ---------- 8. VISUALIZATION (decorative bars; not audio-reactive) ---------- */
const g = el.canvas.getContext("2d");
function draw(t = 0) {
  if (el.canvas.style.display !== "block") return;
  g.clearRect(0, 0, 262, 49);
  const n = 40, w = 262 / n, live = !audio.paused;
  for (let i = 0; i < n; i++) {
    const h = live ? 6 + (Math.sin(t / 220 + i * 0.7) + Math.sin(t / 130 + i * 1.9) + 2) * 9 : 3;
    g.fillStyle = "rgba(255,255,255,.75)"; g.fillRect(i * w + 1, 49 - h, w - 2, h);
  }
  requestAnimationFrame(draw);
}

/* ---------- 9. PLAYLIST DRAWER ---------- */
function drawList() {
  if (el.drawer.hidden) return;
  el.drawer.innerHTML = PLAYLIST.length ? "" : '<li class="empty">No songs yet. Click the folder button.</li>';
  PLAYLIST.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t.title || t.src; li.className = i === index ? "now" : "";
    li.onclick = () => load(i);
    el.drawer.appendChild(li);
  });
}

/* ---------- 10. KEYBOARD, WHEEL, FIT TO SCREEN ---------- */
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  if (e.code === "Space")      { e.preventDefault(); el.play.click(); }
  if (e.code === "ArrowRight") el.next.click();
  if (e.code === "ArrowLeft")  el.prev.click();
});
stage.addEventListener("wheel", (e) => {                   // wheel over the player = volume
  e.preventDefault();
  el.volume.value = Math.min(100, Math.max(0, +el.volume.value + (e.deltaY < 0 ? 5 : -5)));
  el.volume.oninput();
}, { passive: false });
function fit() { document.documentElement.style.setProperty("--zoom", Math.min(1.8, (innerWidth - 24) / 500)); }
addEventListener("resize", fit); fit();
