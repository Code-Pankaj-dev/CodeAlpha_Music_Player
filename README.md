# 🎵 PulsePlay — Music Player

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![CodeAlpha Internship](https://img.shields.io/badge/CodeAlpha-Frontend_Development_Internship-purple?style=for-the-badge)

<br>

**"Your music. Your mood."**  
*A modern, responsive, dark-themed music streaming web application built with pure Vanilla JavaScript, CSS3 Glassmorphism, and semantic HTML5.*

<br>

[Live Demo](#-live-demo) • [Key Features](#-features) • [Installation & Setup](#-installation--setup) • [Folder Structure](#-project-folder-structure) • [Author](#-author--internship-details)

</div>

---

## 📌 Project Overview

**PulsePlay** is a fully functional web-based music player developed as part of the **CodeAlpha Frontend Development Internship (Task 4: Music Player using JavaScript)**.

The application is engineered strictly using native web standards—**HTML5, CSS3, and Vanilla JavaScript (ES6+)**—with **zero external libraries, UI frameworks, or runtime dependencies** (no React, Vue, Bootstrap, or jQuery).

It features a dark glassmorphic interface inspired by music streaming services, complete with dynamic playlist management, local MP3 file uploading via the HTML5 File API and Blob URLs, real-time audio scrubbing, full volume and mute control, smart playback sequencing (shuffle and repeat modes), comprehensive keyboard hotkeys, and accessibility (WCAG 2.1 AAA contrast and ARIA support).

---

## 🚀 Live Demo

- **Live URL:** [https://code-pankaj-dev.github.io/CodeAlpha_Music_Player/](https://code-pankaj-dev.github.io/CodeAlpha_Music_Player/)  
  *(Note: Hosted via GitHub Pages. Ensure GitHub Pages is active in repository settings under `Settings > Pages > Branch: main`)*
- **GitHub Repository:** [https://github.com/Code-Pankaj-dev/CodeAlpha_Music_Player](https://github.com/Code-Pankaj-dev/CodeAlpha_Music_Player)

---

## 📸 Screenshots

> *Screenshots can be captured and added to `assets/images/` for preview.*

### Desktop Interface
```text
+----------------------------------------------------------------------------------------------------+
| PulsePlay   |                               NOW PLAYING                                |  PLAYLIST |
| ------------|--------------------------------------------------------------------------|-----------|
| > Now Play  |                                                                          | 4 Tracks  |
| > Playlist  |                     +----------------------------------+                 | [Upload]  |
| > Shortcuts |                     |                                  |                 | [Clear]   |
|             |                     |       [ Vinyl Album Artwork ]    |                 |           |
|             |                     |                                  |                 | 1. Track  |
|             |                     +----------------------------------+                 | 2. Track  |
|             |                                                                          | 3. Track  |
|             |                              Track Title                                 | 4. Track  |
|             |                              Artist Name                                 |           |
|             |                                                                          |           |
|             |        01:24 ==================O----------------------------- 03:45       |           |
|             |                                                                          |           |
|             |                [Shuffle]  [Prev]  [ PLAY / PAUSE ]  [Next]  [Repeat]     |           |
|             |                                                                          |           |
|             |                          [Volume Icon] ======O====== [100%]              |           |
+----------------------------------------------------------------------------------------------------+
```

| View | Description | File Path |
|---|---|---|
| **Desktop View** | 3-column layout featuring Sidebar, Music Player Center, and Playlist Queue | `assets/images/screenshot-desktop.png` *(Add your screenshot here)* |
| **Mobile View** | Collapsible single-column layout optimized for touch interaction | `assets/images/screenshot-mobile.png` *(Add your screenshot here)* |
| **Shortcuts Modal** | Interactive `<dialog>` listing all keyboard controls | `assets/images/screenshot-shortcuts.png` *(Add your screenshot here)* |

---

## ✨ Features

### 🎧 Core Playback Controls
- **Universal Audio Engine:** Uses a single shared native HTML5 `<audio id="audio-player">` instance.
- **Play & Pause:** Smooth toggle with automatic SVG icon switching and promise rejection handling for browser autoplay policies.
- **Smart Previous Track:**
  - If played for **more than 3 seconds**, clicking *Previous* restarts the current song from the beginning.
  - If played for **3 seconds or less**, it navigates to the previous track (with circular playlist boundary wrapping).
- **Next Track:** Advances smoothly to the next track in sequence, or randomizes when shuffle is enabled.
- **Interactive Seek Bar:** Custom range slider with continuous timestamp display (`mm:ss` / `hh:mm:ss`), drag-to-seek timestamp preview, and responsive gradient tracking (`--progress`).
- **Volume & Mute Controls:** Real 0–100% audio volume control with mute toggle and previous volume memory restoration on unmute.

### 📜 Dynamic Playlist Management
- **Safe Dynamic Rendering:** Generates playlist items using safe DOM methods (`document.createElement` and `textContent`), preventing Cross-Site Scripting (XSS).
- **Active Song Highlighting:** Displays active border accents, gradient fills, and animated equalizer pulses on the currently playing track.
- **Track Selection:** Clicking any song in the playlist immediately loads and plays it.
- **Track Count Badge:** Real-time badge counter updating automatically (`X tracks`).
- **Clear Playlist:** Safe clear button with confirmation modal (`window.confirm`) to wipe queue and trigger empty state.
- **Empty State Display:** Illustrated empty queue card featuring a direct "Upload Music" action button.

### 📂 Local Audio File Upload
- **Client-Side File Ingestion:** Select multiple local audio files via the HTML5 File API.
- **Supported Formats:** `.mp3`, `.wav`, `.ogg`, `.m4a`, `.aac`, `.flac`.
- **Intelligent Metadata Parser:** Automatically cleans extensions and parses `"Artist - Title"` formats (defaults to `"Unknown Artist"` when unavailable).
- **Memory Safety:** Uses in-memory Blob URLs (`URL.createObjectURL`), tracked in a `Set` and revoked via `URL.revokeObjectURL()` upon queue resets to prevent browser memory leaks.

### 🔀 Smart Shuffle & Three-Mode Repeat
- **True Non-Repeating Shuffle:** Randomly selects the next song while guaranteeing it will never immediately replay the current song when multiple tracks exist.
- **Three Repeat Modes:**
  - `Repeat Off`: Plays through the playlist and stops gracefully after the last song.
  - `Repeat All`: Loops the entire playlist continuously.
  - `Repeat One`: Automatically replays the current song upon completion (indicated by a badge labeled `1`).
- **Seamless Autoplay:** Advances to the next track automatically on the native `ended` audio event according to active repeat/shuffle rules.

### ⌨️ Global Keyboard Hotkeys
Full keyboard navigation with an **input isolation guard** that automatically ignores hotkeys when typing in text fields, inputs, or editable areas:

| Shortcut | Action | Description |
|:---:|---|---|
| <kbd>Space</kbd> | **Play / Pause** | Toggle playback on current track (prevents page scroll) |
| <kbd>&rarr;</kbd> | **Seek Forward 5s** | Jumps forward by 5 seconds with live screen-reader readout |
| <kbd>&larr;</kbd> | **Seek Backward 5s** | Rewinds by 5 seconds (clamped at `0:00`) |
| <kbd>&uarr;</kbd> | **Volume Up** | Increases volume by +5% |
| <kbd>&darr;</kbd> | **Volume Down** | Decreases volume by -5% |
| <kbd>M</kbd> / <kbd>m</kbd> | **Mute / Unmute** | Toggles mute state and restores previous volume |
| <kbd>N</kbd> / <kbd>n</kbd> | **Next Track** | Advances to next track in queue |
| <kbd>P</kbd> / <kbd>p</kbd> | **Previous Track** | Restarts track (> 3s) or goes to previous |
| <kbd>?</kbd> | **Shortcuts Guide** | Opens accessible `<dialog>` keyboard modal |
| <kbd>Esc</kbd> | **Close Modal** | Dismisses any open dialog modal |

### ♿ Accessibility (a11y) & UI Excellence
- **Semantic HTML5:** Built using `<main>`, `<aside>`, `<nav>`, `<figure>`, `<header>`, and `<dialog>`.
- **Screen Reader Support:** Live region (`#sr-announcements` with `aria-live="polite"`) announces track loads, volume levels, mute states, and seek jumps.
- **Focus Indicators:** Custom high-contrast `:focus-visible` cyan outline and glow for full keyboard operability.
- **Color Contrast:** Text contrast ratios exceed WCAG AAA standards (>16:1 for primary text).
- **Reduced Motion:** Respects `@media (prefers-reduced-motion: reduce)` by disabling disc rotation and micro-animations.
- **Loading Indicators:** Cyan buffering spinner (`#artwork-loader`) appears during audio buffer wait states.
- **Touch-Friendly:** All interactive buttons comply with the minimum 44×44px hit-target size.

---

## 🛠️ Technologies Used

- **HTML5:** Semantic markup, native `<audio>` element, accessible `<dialog>`, range sliders, and `<input type="file">`.
- **CSS3:** Custom properties (design tokens), Flexbox, CSS Grid, `backdrop-filter` glassmorphism, responsive media queries, and `@media (prefers-reduced-motion)`.
- **Vanilla JavaScript (ES6+):** Audio API event listeners, IIFE architecture, Blob Object URLs, DOM manipulation, state management, and keyboard event routing.
- **Inline Vector SVGs:** Lightweight, self-contained SVG icons and artwork placeholders with zero external network CDN dependencies.

---

## 📁 Project Folder Structure

```text
Music_Player/
│
├── index.html                     # Semantic HTML5 markup, application shell, and dialogs
├── README.md                      # Comprehensive project documentation
├── MUSIC_PLAYER_MASTER_PROMPT.md  # Master 6-phase engineering specification
│
├── css/
│   └── style.css                  # CSS tokens, glassmorphism UI, sliders & media queries
│
├── js/
│   ├── playlist.js                # Default playlist array and sample track data
│   └── script.js                  # Master audio controller, event pipeline, and hotkeys
│
├── assets/
│   ├── images/
│   │   └── default-cover.svg      # Standalone SVG album cover vector artwork
│   └── music/
│       └── README.txt             # Instructions for adding local audio files to assets
│
└── Music/                         # Local audio files folder for testing
    ├── Jaan_Jaan_Jaitu_Ho.mp3
    ├── Tadap_Dil_se_kabhi na Jati.mp3
    ├── Teri_Yaad_Yaad_Yaad.mp3
    └── Tum_hi_Aana.mp3
```

---

## 💻 Installation and Setup

### Prerequisites
- Any modern web browser (**Google Chrome**, **Mozilla Firefox**, **Microsoft Edge**, **Brave**, or **Apple Safari**).
- **Git** (optional, for cloning the repository).

### 1. Clone the Repository
```bash
git clone https://github.com/Code-Pankaj-dev/CodeAlpha_Music_Player.git
cd CodeAlpha_Music_Player
```

*(Alternatively, download the ZIP archive from GitHub and extract it to your desired folder).*

---

## 🏃 How to Run the Project

### Option A: Direct Browser Execution (No server required)
1. Navigate to the project root directory.
2. Double-click `index.html` or open it with your favorite browser:
   - On Windows: Right-click `index.html` &rarr; **Open with** &rarr; **Google Chrome** (or Edge/Firefox).
3. The music player will open immediately.

### Option B: Using a Local HTTP Server (Recommended)
Running through a local web server provides the best compatibility with browser audio caching and file handling:

**Using Python (Python 3 installed):**
```bash
# In the project directory:
python -m http.server 8000
```
Then navigate to: [http://localhost:8000](http://localhost:8000)

**Using Node.js (npx serve):**
```bash
npx serve .
```

---

## 🎵 How to Play Music in PulsePlay

### 1. Upload Local Audio Files (Direct in UI)
1. Click the **"Upload Music"** button in the playlist section (or inside the empty playlist view).
2. Select one or multiple audio tracks (`.mp3`, `.wav`, `.ogg`, `.m4a`, `.aac`, `.flac`).
3. The songs will be parsed, added to the playlist queue, and start playing immediately.

### 2. Add Audio Files Manually to Code
1. Place your audio files inside `assets/music/` (e.g. `song-1.mp3`, `song-2.mp3`, `song-3.mp3`).
2. Open [`js/playlist.js`](file:///e:/CodeAlpha_Frontend%20Development/Music_Player/js/playlist.js) and update the track entries:
   ```javascript
   const defaultPlaylist = [
     {
       id: 'track-1',
       title: 'Your Song Title',
       artist: 'Artist Name',
       src: 'assets/music/your-file.mp3',
       cover: 'assets/images/default-cover.svg'
     }
   ];
   ```
3. Refresh `index.html` in your browser.

---

## ⚠️ Known Limitations & Browser Autoplay Policies

1. **Browser Autoplay Restrictions:**  
   Modern browsers prevent audio from autoplaying before a user interaction (gesture). PulsePlay implements safety Promise guards (`playPromise.catch()`) that intercept `NotAllowedError` without throwing unhandled exceptions. Simply click the Play button or select a track to begin playback.
2. **Local Upload Session Scope:**  
   Files uploaded via the "Upload Music" button are stored in temporary browser memory as Blob URLs (`URL.createObjectURL`). Due to browser security sandboxes, these in-memory URLs do not persist across hard page refreshes. For permanent default playlists, add your files to `assets/music/` and reference them in `js/playlist.js`.

---

## 👨‍💻 Author & Internship Details

### Developer
- **Name:** Pankaj Upadhyay
- **Email:** [pankajupadhyay.dev@gmail.com](mailto:pankajupadhyay.dev@gmail.com)
- **GitHub:** [@Code-Pankaj-dev](https://github.com/Code-Pankaj-dev)
- **Repository:** [CodeAlpha_Music_Player](https://github.com/Code-Pankaj-dev/CodeAlpha_Music_Player)

### Internship Details
- **Organization:** [CodeAlpha](https://www.codealpha.tech/)
- **Track:** Frontend Development Internship
- **Task:** Task 4 — Music Player using JavaScript
- **Submission Date:** November 2026

---

## 📄 License

This project is open-source and available under the **MIT License**.
