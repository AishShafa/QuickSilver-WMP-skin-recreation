# Quicksilver WMP 9 Skin Recreation

This project is a browser-based recreation of the classic Windows Media Player 9 Series "Quicksilver" skin, rebuilt with HTML, CSS, and JavaScript.
It is inspired by the original Quicksilver skin and artwork from WMPGoodies, with the layout and styling adapted for a modern web page.
![Uploading image.png…]()


## Features

- Classic WMP 9-style interface
- Original skin-inspired artwork and layout
- Play, pause, stop, previous, and next controls
- Volume and seek sliders
- Repeat toggle
- Playlist drawer
- Visualizer display
- Local MP3 support through browser file selection
- Standalone project structure with no build step required

## Project structure

- index.html - main player structure
- style.css - skin styling and positioning
- script.js - player logic, controls, and playlist behavior
- skin/ - converted artwork used by the UI

## Getting started

1. Download or clone this repository.
2. Open index.html in a browser.
3. Add your MP3 files to a folder named music next to the page, or use the folder button in the player to select files from your computer.
4. If you want songs to appear by default, edit the PLAYLIST array in script.js.

const PLAYLIST = [
  { title: "Song Name", artist: "Artist", src: "music/song.mp3" }
];
