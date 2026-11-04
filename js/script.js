/**
 * PulsePlay — Master Audio Controller
 * ============================================================================
 * Technologies: HTML5 Audio API & Vanilla JavaScript
 * Phase 5: Keyboard Shortcuts, Complete Accessibility & UI Micro-Interactions
 * ============================================================================
 */

(function () {
  'use strict';

  // --- 1. Application State ---
  const state = {
    playlist: Array.isArray(window.initialPlaylist) ? [...window.initialPlaylist] : [],
    currentIndex: 0,
    isPlaying: false,
    isSeeking: false,
    volume: 0.8,
    previousVolume: 0.8,
    isMuted: false,
    repeatMode: 'off', // 'off' | 'all' | 'one'
    isShuffle: false,
    createdObjectURLs: new Set()
  };

  // Expose state and controller for external modules/debugging
  window.PulsePlay = {
    state,
    loadTrack: (idx, autoPlay) => loadTrack(idx, autoPlay),
    play: () => playAudio(),
    pause: () => pauseAudio(),
    next: () => nextTrack(false),
    prev: () => prevTrack(),
    toggleShuffle: () => toggleShuffle(),
    cycleRepeat: () => cycleRepeat(),
    clearPlaylist: () => clearPlaylist(),
    renderPlaylist: () => renderPlaylist(),
    setVolume: (v) => setVolume(v),
    toggleMute: () => toggleMute()
  };

  // --- 2. DOM Elements Cache ---
  let dom = {};

  function initDOMReferences() {
    dom = {
      audio: document.getElementById('audio-player'),
      playPauseBtn: document.getElementById('play-pause-btn'),
      playIcon: document.getElementById('play-icon'),
      pauseIcon: document.getElementById('pause-icon'),
      prevBtn: document.getElementById('prev-btn'),
      nextBtn: document.getElementById('next-btn'),
      shuffleBtn: document.getElementById('shuffle-btn'),
      repeatBtn: document.getElementById('repeat-btn'),
      progressBar: document.getElementById('progress-bar'),
      currentTime: document.getElementById('current-time'),
      totalDuration: document.getElementById('total-duration'),
      volumeSlider: document.getElementById('volume-slider'),
      muteBtn: document.getElementById('mute-btn'),
      volumeHighIcon: document.getElementById('volume-high-icon'),
      volumeMutedIcon: document.getElementById('volume-muted-icon'),
      songTitle: document.getElementById('song-title'),
      songArtist: document.getElementById('song-artist'),
      albumCover: document.getElementById('album-cover-img'),
      albumContainer: document.getElementById('album-art-container'),
      artworkLoader: document.getElementById('artwork-loader'),
      playlistList: document.getElementById('playlist-list'),
      playlistSection: document.getElementById('playlist-section'),
      trackCount: document.getElementById('track-count'),
      audioUpload: document.getElementById('audio-upload'),
      uploadLabel: document.getElementById('upload-label'),
      emptyPlaylist: document.getElementById('empty-playlist'),
      emptyUploadBtn: document.getElementById('empty-upload-btn'),
      clearPlaylistBtn: document.getElementById('clear-playlist-btn'),
      playerError: document.getElementById('player-error'),
      errorMessage: document.getElementById('error-message'),
      srAnnouncements: document.getElementById('sr-announcements'),
      mobileToggle: document.getElementById('mobile-playlist-toggle'),
      shortcutsBtn: document.getElementById('shortcuts-btn'),
      shortcutsDialog: document.getElementById('shortcuts-dialog'),
      closeShortcutsBtn: document.getElementById('close-shortcuts-btn')
    };
  }

  // --- 3. Utilities & Helpers ---

  /**
   * Formats duration in seconds to standard mm:ss or hh:mm:ss format.
   * Handles NaN, Infinity, negative values, and undefined values safely.
   */
  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '0:00';
    }
    const totalSecs = Math.floor(seconds);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;

    if (hrs > 0) {
      const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
      return `${hrs}:${formattedMins}:${formattedSecs}`;
    }
    return `${mins}:${formattedSecs}`;
  }

  /**
   * Updates range slider fill gradient via CSS custom property.
   */
  function updateSliderFill(slider, cssVar) {
    if (!slider) return;
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value) || 0;
    const percent = ((val - min) / (max - min)) * 100;
    slider.style.setProperty(cssVar, `${percent}%`);
  }

  /**
   * Accessible live screen-reader announcements.
   */
  function announce(text) {
    if (dom.srAnnouncements) {
      dom.srAnnouncements.textContent = text;
    }
  }

  /**
   * Display friendly error message in status banner.
   */
  function showError(msg) {
    if (dom.playerError && dom.errorMessage) {
      dom.errorMessage.textContent = msg;
      dom.playerError.classList.remove('hidden');
    }
  }

  /**
   * Hide the error message banner.
   */
  function hideError() {
    if (dom.playerError) {
      dom.playerError.classList.add('hidden');
    }
  }

  // --- 4. Dynamic Playlist Rendering & Empty State ---

  /**
   * Dynamically renders all tracks into the playlist DOM.
   * Uses safe document element construction to prevent XSS.
   */
  function renderPlaylist() {
    if (!dom.playlistList) return;

    // Clear existing children safely
    dom.playlistList.replaceChildren();

    const count = state.playlist.length;

    // Handle empty playlist state
    if (count === 0) {
      if (dom.emptyPlaylist) dom.emptyPlaylist.classList.remove('visually-hidden');
      if (dom.trackCount) dom.trackCount.textContent = '0 tracks';
      if (dom.songTitle) dom.songTitle.textContent = 'No track selected';
      if (dom.songArtist) dom.songArtist.textContent = 'Upload or add tracks';
      if (dom.albumCover) {
        dom.albumCover.src = 'assets/images/default-cover.svg';
        dom.albumCover.alt = 'Default album cover';
      }
      if (dom.currentTime) dom.currentTime.textContent = '0:00';
      if (dom.totalDuration) dom.totalDuration.textContent = '0:00';
      if (dom.progressBar) {
        dom.progressBar.value = 0;
        updateSliderFill(dom.progressBar, '--progress');
      }
      if (dom.audio) {
        dom.audio.removeAttribute('src');
        dom.audio.load();
      }
      setPlaybackUI(false);
      return;
    }

    // Hide empty playlist banner
    if (dom.emptyPlaylist) dom.emptyPlaylist.classList.add('visually-hidden');
    if (dom.trackCount) dom.trackCount.textContent = `${count} track${count === 1 ? '' : 's'}`;

    // Render items
    state.playlist.forEach((track, index) => {
      const li = document.createElement('li');
      li.className = 'playlist-item';
      if (index === state.currentIndex) {
        li.classList.add('active');
        li.setAttribute('aria-current', 'true');
      }
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');
      li.setAttribute('data-index', index.toString());
      li.setAttribute('aria-label', `Play track ${index + 1}: ${track.title} by ${track.artist}`);

      // Thumbnail image
      const img = document.createElement('img');
      img.src = track.cover || 'assets/images/default-cover.svg';
      img.alt = '';
      img.className = 'playlist-item-thumbnail';
      img.setAttribute('aria-hidden', 'true');

      // Details container
      const details = document.createElement('div');
      details.className = 'playlist-item-details';

      const title = document.createElement('h3');
      title.className = 'playlist-item-title';
      title.textContent = track.title || 'Untitled Track';

      const artist = document.createElement('p');
      artist.className = 'playlist-item-artist';
      artist.textContent = track.artist || 'Unknown Artist';

      details.appendChild(title);
      details.appendChild(artist);

      li.appendChild(img);
      li.appendChild(details);

      dom.playlistList.appendChild(li);
    });
  }

  /**
   * Synchronizes playlist active item styling and accessibility attributes.
   */
  function updateActivePlaylistItem(activeIndex) {
    if (!dom.playlistList) return;
    const items = dom.playlistList.querySelectorAll('.playlist-item');
    items.forEach((item, idx) => {
      const isCurrent = idx === activeIndex;
      item.classList.toggle('active', isCurrent);
      if (isCurrent) {
        item.setAttribute('aria-current', 'true');
      } else {
        item.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Clears the current playlist with confirmation dialog.
   * Revokes any generated object URLs to free memory.
   */
  function clearPlaylist() {
    if (state.playlist.length === 0) return;

    const confirmed = window.confirm('Are you sure you want to clear all tracks from the playlist?');
    if (!confirmed) return;

    pauseAudio();

    // Revoke all local blob object URLs to prevent memory leaks
    revokeAllObjectURLs();

    state.playlist = [];
    state.currentIndex = 0;
    renderPlaylist();
    announce('Playlist cleared.');
  }

  /**
   * Cleans up all generated URL.createObjectURL instances.
   */
  function revokeAllObjectURLs() {
    state.createdObjectURLs.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // Safe catch
      }
    });
    state.createdObjectURLs.clear();
  }

  // --- 5. Local MP3 & Audio Upload ---

  /**
   * Handles user uploaded audio files from local computer.
   */
  function handleAudioUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const validAudioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
    const newlyAddedTracks = [];

    Array.from(files).forEach((file) => {
      const lowerName = file.name.toLowerCase();
      const isValidExtension = validAudioExtensions.some((ext) => lowerName.endsWith(ext));
      const isValidMime = file.type.startsWith('audio/');

      if (!isValidExtension && !isValidMime) {
        console.warn(`[PulsePlay] Skipped unsupported file: "${file.name}"`);
        return;
      }

      // Generate local blob object URL for playback
      const objectUrl = URL.createObjectURL(file);
      state.createdObjectURLs.add(objectUrl);

      // Clean title extraction from filename
      let title = file.name;
      validAudioExtensions.forEach((ext) => {
        if (title.toLowerCase().endsWith(ext)) {
          title = title.substring(0, title.length - ext.length);
        }
      });

      // Default artist is 'Unknown Artist' unless formatted as "Artist - Title"
      let artist = 'Unknown Artist';
      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }

      newlyAddedTracks.push({
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: title || 'Local Audio Track',
        artist: artist || 'Unknown Artist',
        src: objectUrl,
        cover: 'assets/images/default-cover.svg',
        isLocalUpload: true
      });
    });

    if (newlyAddedTracks.length === 0) {
      showError('No valid audio files found. Supported formats: MP3, WAV, OGG, M4A, FLAC.');
      return;
    }

    const wasEmpty = state.playlist.length === 0;
    const startIndex = state.playlist.length;

    // Append new tracks to playlist
    state.playlist.push(...newlyAddedTracks);
    renderPlaylist();

    announce(`Added ${newlyAddedTracks.length} song${newlyAddedTracks.length === 1 ? '' : 's'} to playlist.`);
    hideError();

    // If playlist was previously empty or idle, immediately load & play first uploaded song
    if (wasEmpty || !state.isPlaying) {
      loadTrack(startIndex, true);
    }

    // Reset input value so user can upload the same file again if desired
    event.target.value = '';
  }

  // --- 6. Track Loading & Song Info Updates ---

  /**
   * Loads a track by playlist index with smooth artwork transitions.
   */
  function loadTrack(index, shouldPlay = false) {
    if (!state.playlist || state.playlist.length === 0) {
      renderPlaylist();
      return;
    }

    // Ensure valid index within bounds
    if (index < 0) index = state.playlist.length - 1;
    if (index >= state.playlist.length) index = 0;
    state.currentIndex = index;

    const track = state.playlist[index];
    if (!track) return;

    hideError();

    // 1. Update native HTML5 Audio source
    if (dom.audio) {
      dom.audio.src = track.src;
      dom.audio.load();
    }

    // 2. Update song title & artist safely
    if (dom.songTitle) dom.songTitle.textContent = track.title || 'Unknown Title';
    if (dom.songArtist) dom.songArtist.textContent = track.artist || 'Unknown Artist';

    // 3. Smooth artwork crossfade transition
    if (dom.albumCover) {
      dom.albumCover.classList.add('fade-out');
      setTimeout(() => {
        if (dom.albumCover) {
          dom.albumCover.src = track.cover || 'assets/images/default-cover.svg';
          dom.albumCover.alt = `Album cover for ${track.title} by ${track.artist}`;
          dom.albumCover.classList.remove('fade-out');
        }
      }, 120);
    }

    // 4. Reset progress display
    if (dom.progressBar) {
      dom.progressBar.value = 0;
      dom.progressBar.setAttribute('aria-valuenow', '0');
      updateSliderFill(dom.progressBar, '--progress');
    }
    if (dom.currentTime) dom.currentTime.textContent = '0:00';
    if (dom.totalDuration) dom.totalDuration.textContent = '0:00';

    // 5. Highlight active item in playlist
    updateActivePlaylistItem(index);

    // 6. Screen reader notification
    announce(`Loaded track: ${track.title} by ${track.artist}`);

    // 7. Auto-play if requested
    if (shouldPlay) {
      playAudio();
    }
  }

  // --- 7. Playback Engine (Play, Pause, Next, Prev) ---

  /**
   * Plays the current track with robust Promise rejection handling.
   */
  function playAudio() {
    if (!dom.audio || state.playlist.length === 0) {
      showError('Playlist is empty. Click "Upload Music" to select audio files.');
      return;
    }

    if (!dom.audio.src || dom.audio.src === '' || dom.audio.src === window.location.href) {
      loadTrack(state.currentIndex, true);
      return;
    }

    const playPromise = dom.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          hideError();
          setPlaybackUI(true);
        })
        .catch((error) => {
          console.warn('[PulsePlay] Playback request halted:', error.name, error.message);
          setPlaybackUI(false);

          if (error.name === 'NotAllowedError') {
            showError('Playback blocked by browser autoplay policy. Click play to listen.');
          } else if (error.name === 'NotSupportedError' || dom.audio.error) {
            showError(`Audio unavailable for "${state.playlist[state.currentIndex]?.title || 'track'}". Place file in assets/music/ or upload.`);
          }
        });
    }
  }

  /**
   * Pauses audio playback.
   */
  function pauseAudio() {
    if (dom.audio && !dom.audio.paused) {
      dom.audio.pause();
      setPlaybackUI(false);
    }
  }

  /**
   * Toggles between play and pause.
   */
  function togglePlayPause() {
    if (!dom.audio) return;
    if (dom.audio.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
  }

  /**
   * Calculates the next track index taking Shuffle into account.
   */
  function getNextTrackIndex() {
    const total = state.playlist.length;
    if (total <= 1) return 0;

    if (state.isShuffle) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * total);
      } while (randomIndex === state.currentIndex);
      return randomIndex;
    }

    return (state.currentIndex + 1) % total;
  }

  /**
   * Next Track Handler.
   * @param {boolean} isAutoplay - True if called automatically on song end.
   */
  function nextTrack(isAutoplay = false) {
    if (!state.playlist || state.playlist.length === 0) return;

    // Autoplay with Repeat One mode: replay current track
    if (isAutoplay && state.repeatMode === 'one') {
      if (dom.audio) {
        dom.audio.currentTime = 0;
        playAudio();
      }
      return;
    }

    // Autoplay with Repeat Off: stop after last song (if not shuffle)
    if (isAutoplay && state.repeatMode === 'off' && !state.isShuffle) {
      if (state.currentIndex >= state.playlist.length - 1) {
        pauseAudio();
        if (dom.audio) dom.audio.currentTime = 0;
        setPlaybackUI(false);
        announce('Playback finished (Repeat Off).');
        return;
      }
    }

    const nextIndex = getNextTrackIndex();
    loadTrack(nextIndex, true);
  }

  /**
   * Previous Track Handler.
   * Requirement: If played for more than 3 seconds, restarts the track.
   */
  function prevTrack() {
    if (!dom.audio || !state.playlist || state.playlist.length === 0) return;

    if (dom.audio.currentTime > 3) {
      dom.audio.currentTime = 0;
      if (dom.audio.paused) {
        playAudio();
      }
      announce('Restarted track from beginning');
    } else {
      const prevIndex = (state.currentIndex - 1 + state.playlist.length) % state.playlist.length;
      loadTrack(prevIndex, true);
    }
  }

  /**
   * Updates Play/Pause button icons, ARIA labels, and artwork animation states.
   */
  function setPlaybackUI(isPlaying) {
    state.isPlaying = isPlaying;

    if (dom.playPauseBtn) {
      dom.playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause song' : 'Play song');
      dom.playPauseBtn.title = isPlaying ? 'Pause (Space)' : 'Play (Space)';
    }

    if (dom.playIcon && dom.pauseIcon) {
      if (isPlaying) {
        dom.playIcon.classList.add('visually-hidden');
        dom.pauseIcon.classList.remove('visually-hidden');
      } else {
        dom.playIcon.classList.remove('visually-hidden');
        dom.pauseIcon.classList.add('visually-hidden');
      }
    }

    if (dom.albumContainer) {
      dom.albumContainer.classList.toggle('is-playing', isPlaying);
      dom.albumContainer.classList.toggle('is-paused', !isPlaying);
    }
  }

  // --- 8. Shuffle & Repeat Mode Controls ---

  /**
   * Toggles Shuffle mode and updates UI state.
   */
  function toggleShuffle() {
    state.isShuffle = !state.isShuffle;

    if (dom.shuffleBtn) {
      dom.shuffleBtn.classList.toggle('active', state.isShuffle);
      dom.shuffleBtn.setAttribute('aria-pressed', state.isShuffle.toString());
      dom.shuffleBtn.title = state.isShuffle ? 'Shuffle On' : 'Shuffle Off';
    }

    announce(`Shuffle is ${state.isShuffle ? 'on' : 'off'}`);
  }

  /**
   * Cycles Repeat mode: 'off' -> 'all' -> 'one' -> 'off'.
   */
  function cycleRepeat() {
    const modes = ['off', 'all', 'one'];
    const currentIdx = modes.indexOf(state.repeatMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    state.repeatMode = nextMode;

    if (dom.repeatBtn) {
      dom.repeatBtn.setAttribute('data-mode', nextMode);
      dom.repeatBtn.classList.toggle('active', nextMode !== 'off');

      let label = 'Repeat mode: Off';
      let title = 'Repeat Off';
      if (nextMode === 'all') {
        label = 'Repeat mode: All';
        title = 'Repeat All';
      } else if (nextMode === 'one') {
        label = 'Repeat mode: One';
        title = 'Repeat One';
      }

      dom.repeatBtn.setAttribute('aria-label', label);
      dom.repeatBtn.title = title;
    }

    announce(`Repeat mode set to ${state.repeatMode}`);
  }

  // --- 9. Volume & Mute Controls ---

  /**
   * Sets real audio volume (0.0 to 1.0).
   */
  function setVolume(volumeVal) {
    if (!dom.audio) return;
    const clamped = Math.max(0, Math.min(1, volumeVal));
    state.volume = clamped;
    dom.audio.volume = clamped;

    if (clamped === 0) {
      dom.audio.muted = true;
      state.isMuted = true;
    } else {
      dom.audio.muted = false;
      state.isMuted = false;
      state.previousVolume = clamped;
    }

    syncVolumeUI();
  }

  /**
   * Toggles audio mute state, restoring previous volume on unmute.
   */
  function toggleMute() {
    if (!dom.audio) return;

    if (dom.audio.muted || dom.audio.volume === 0) {
      const targetVol = state.previousVolume > 0 ? state.previousVolume : 0.8;
      dom.audio.muted = false;
      state.isMuted = false;
      setVolume(targetVol);
      announce(`Unmuted, volume ${Math.round(targetVol * 100)}%`);
    } else {
      state.previousVolume = dom.audio.volume || state.volume || 0.8;
      dom.audio.muted = true;
      state.isMuted = true;
      dom.audio.volume = 0;
      syncVolumeUI();
      announce('Muted');
    }
  }

  /**
   * Synchronizes volume slider, icons, and accessible labels.
   */
  function syncVolumeUI() {
    const isMuted = dom.audio ? (dom.audio.muted || dom.audio.volume === 0) : state.isMuted;
    const currentVol = isMuted ? 0 : (dom.audio ? dom.audio.volume : state.volume);

    if (dom.volumeSlider) {
      dom.volumeSlider.value = Math.round(currentVol * 100);
      dom.volumeSlider.setAttribute('aria-valuenow', `${Math.round(currentVol * 100)}`);
      updateSliderFill(dom.volumeSlider, '--volume');
    }

    if (dom.muteBtn) {
      dom.muteBtn.setAttribute('aria-label', isMuted ? 'Unmute audio' : 'Mute audio');
      dom.muteBtn.title = isMuted ? 'Unmute (M)' : 'Mute (M)';
      dom.muteBtn.classList.toggle('is-muted', isMuted);
    }

    if (dom.volumeHighIcon && dom.volumeMutedIcon) {
      if (isMuted) {
        dom.volumeHighIcon.classList.add('visually-hidden');
        dom.volumeMutedIcon.classList.remove('visually-hidden');
      } else {
        dom.volumeHighIcon.classList.remove('visually-hidden');
        dom.volumeMutedIcon.classList.add('visually-hidden');
      }
    }
  }

  // --- 10. Keyboard Shortcuts ---

  /**
   * Global Keyboard Shortcuts Listener
   * Guards against triggering while typing inside input, textarea, or editable tags.
   */
  function handleKeyboardShortcuts(e) {
    const activeEl = document.activeElement;
    if (activeEl) {
      const tag = activeEl.tagName ? activeEl.tagName.toLowerCase() : '';
      const isInput = tag === 'input' && activeEl.type !== 'button' && activeEl.type !== 'range';
      const isTextarea = tag === 'textarea';
      const isSelect = tag === 'select';
      const isContentEditable = activeEl.isContentEditable;
      if (isInput || isTextarea || isSelect || isContentEditable) {
        return;
      }
    }

    // If modal is open, let standard dialog interaction handle Esc, but prevent background shortcuts
    if (dom.shortcutsDialog && dom.shortcutsDialog.open && e.key !== 'Escape') {
      return;
    }

    const key = e.key;

    switch (key) {
      case ' ':
      case 'Spacebar':
        // If focused element is a non-player button or link, let native click trigger
        if (activeEl && (activeEl.tagName.toLowerCase() === 'button' || activeEl.tagName.toLowerCase() === 'a') && activeEl !== dom.playPauseBtn) {
          return;
        }
        e.preventDefault();
        togglePlayPause();
        break;

      case 'ArrowRight':
        if (dom.audio && Number.isFinite(dom.audio.duration)) {
          e.preventDefault();
          const targetTime = Math.min(dom.audio.duration, (dom.audio.currentTime || 0) + 5);
          dom.audio.currentTime = targetTime;
          announce(`Forward 5 seconds: ${formatTime(targetTime)}`);
        }
        break;

      case 'ArrowLeft':
        if (dom.audio) {
          e.preventDefault();
          const targetTime = Math.max(0, (dom.audio.currentTime || 0) - 5);
          dom.audio.currentTime = targetTime;
          announce(`Backward 5 seconds: ${formatTime(targetTime)}`);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        setVolume(Math.min(1, state.volume + 0.05));
        announce(`Volume: ${Math.round(state.volume * 100)}%`);
        break;

      case 'ArrowDown':
        e.preventDefault();
        setVolume(Math.max(0, state.volume - 0.05));
        announce(`Volume: ${Math.round(state.volume * 100)}%`);
        break;

      case 'm':
      case 'M':
        e.preventDefault();
        toggleMute();
        break;

      case 'n':
      case 'N':
        e.preventDefault();
        nextTrack(false);
        break;

      case 'p':
      case 'P':
        e.preventDefault();
        prevTrack();
        break;

      case '?':
        if (dom.shortcutsDialog) {
          e.preventDefault();
          if (dom.shortcutsDialog.open) {
            dom.shortcutsDialog.close();
          } else {
            dom.shortcutsDialog.showModal();
          }
        }
        break;

      default:
        break;
    }
  }

  // --- 11. Event Architecture & Listeners Binding ---

  function bindAudioEvents() {
    if (!dom.audio) return;

    // play event: playback started
    dom.audio.addEventListener('play', () => {
      setPlaybackUI(true);
      hideError();
      if (dom.artworkLoader) dom.artworkLoader.classList.add('hidden');
    });

    // pause event: playback stopped
    dom.audio.addEventListener('pause', () => {
      setPlaybackUI(false);
    });

    // ended event: track finished -> triggers Autoplay logic
    dom.audio.addEventListener('ended', () => {
      nextTrack(true);
    });

    // timeupdate event: continuous progress sync
    dom.audio.addEventListener('timeupdate', () => {
      if (!dom.audio || state.isSeeking) return;

      const current = dom.audio.currentTime || 0;
      const duration = dom.audio.duration;

      if (dom.currentTime) {
        dom.currentTime.textContent = formatTime(current);
      }

      if (Number.isFinite(duration) && duration > 0) {
        const percent = (current / duration) * 100;
        if (dom.progressBar) {
          dom.progressBar.value = percent;
          dom.progressBar.setAttribute('aria-valuenow', percent.toFixed(1));
          updateSliderFill(dom.progressBar, '--progress');
        }
      }
    });

    // loadedmetadata event: track duration and properties ready
    dom.audio.addEventListener('loadedmetadata', () => {
      const duration = dom.audio.duration;
      if (dom.totalDuration) {
        dom.totalDuration.textContent = formatTime(duration);
      }
      hideError();
    });

    // durationchange event
    dom.audio.addEventListener('durationchange', () => {
      const duration = dom.audio.duration;
      if (dom.totalDuration && Number.isFinite(duration)) {
        dom.totalDuration.textContent = formatTime(duration);
      }
    });

    // waiting event: buffering indicator
    dom.audio.addEventListener('waiting', () => {
      if (dom.artworkLoader) dom.artworkLoader.classList.remove('hidden');
    });

    // canplay / playing event: ready to play
    dom.audio.addEventListener('canplay', () => {
      if (dom.artworkLoader) dom.artworkLoader.classList.add('hidden');
      hideError();
    });

    dom.audio.addEventListener('playing', () => {
      if (dom.artworkLoader) dom.artworkLoader.classList.add('hidden');
    });

    // error event
    dom.audio.addEventListener('error', () => {
      if (dom.artworkLoader) dom.artworkLoader.classList.add('hidden');
      const track = state.playlist[state.currentIndex];
      const trackName = track ? `"${track.title}"` : 'Selected track';
      console.warn(`[PulsePlay] Audio loading error for ${trackName}:`, dom.audio.error);
      setPlaybackUI(false);
      showError(`Audio unavailable for ${trackName}. Place MP3 in assets/music/ or upload audio.`);
    });
  }

  function bindUIControls() {
    // Play/Pause button
    if (dom.playPauseBtn) {
      dom.playPauseBtn.addEventListener('click', togglePlayPause);
    }

    // Previous button
    if (dom.prevBtn) {
      dom.prevBtn.addEventListener('click', prevTrack);
    }

    // Next button
    if (dom.nextBtn) {
      dom.nextBtn.addEventListener('click', () => nextTrack(false));
    }

    // Shuffle button
    if (dom.shuffleBtn) {
      dom.shuffleBtn.addEventListener('click', toggleShuffle);
    }

    // Repeat button
    if (dom.repeatBtn) {
      dom.repeatBtn.addEventListener('click', cycleRepeat);
    }

    // Clear Playlist button
    if (dom.clearPlaylistBtn) {
      dom.clearPlaylistBtn.addEventListener('click', clearPlaylist);
    }

    // File Upload input
    if (dom.audioUpload) {
      dom.audioUpload.addEventListener('change', handleAudioUpload);
    }

    // Empty state upload button
    if (dom.emptyUploadBtn && dom.audioUpload) {
      dom.emptyUploadBtn.addEventListener('click', () => {
        dom.audioUpload.click();
      });
    }

    // Progress bar seeking
    if (dom.progressBar) {
      dom.progressBar.addEventListener('input', (e) => {
        state.isSeeking = true;
        const seekPercent = parseFloat(e.target.value) || 0;
        updateSliderFill(dom.progressBar, '--progress');

        if (dom.audio && Number.isFinite(dom.audio.duration)) {
          const previewTime = (seekPercent / 100) * dom.audio.duration;
          if (dom.currentTime) dom.currentTime.textContent = formatTime(previewTime);
        }
      });

      dom.progressBar.addEventListener('change', (e) => {
        const seekPercent = parseFloat(e.target.value) || 0;
        if (dom.audio && Number.isFinite(dom.audio.duration) && dom.audio.duration > 0) {
          dom.audio.currentTime = (seekPercent / 100) * dom.audio.duration;
        }
        state.isSeeking = false;
      });
    }

    // Volume slider
    if (dom.volumeSlider) {
      dom.volumeSlider.addEventListener('input', (e) => {
        const rawVal = parseFloat(e.target.value) || 0;
        setVolume(rawVal / 100);
      });
    }

    // Mute button
    if (dom.muteBtn) {
      dom.muteBtn.addEventListener('click', toggleMute);
    }

    // Playlist item selection (delegated)
    if (dom.playlistList) {
      dom.playlistList.addEventListener('click', (e) => {
        const item = e.target.closest('.playlist-item');
        if (!item) return;

        const indexAttr = item.getAttribute('data-index');
        const targetIndex = indexAttr !== null ? parseInt(indexAttr, 10) : -1;

        if (targetIndex >= 0 && targetIndex < state.playlist.length) {
          loadTrack(targetIndex, true);
        }
      });

      // Keyboard support for playlist items
      dom.playlistList.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const item = e.target.closest('.playlist-item');
          if (item) {
            e.preventDefault();
            item.click();
          }
        }
      });
    }

    // Mobile playlist toggle button
    if (dom.mobileToggle && dom.playlistSection) {
      dom.mobileToggle.addEventListener('click', () => {
        dom.playlistSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Shortcuts modal open/close
    if (dom.shortcutsBtn && dom.shortcutsDialog) {
      dom.shortcutsBtn.addEventListener('click', () => {
        dom.shortcutsDialog.showModal();
        dom.shortcutsBtn.setAttribute('aria-expanded', 'true');
      });
    }

    if (dom.closeShortcutsBtn && dom.shortcutsDialog) {
      dom.closeShortcutsBtn.addEventListener('click', () => {
        dom.shortcutsDialog.close();
      });
    }

    if (dom.shortcutsDialog) {
      dom.shortcutsDialog.addEventListener('close', () => {
        if (dom.shortcutsBtn) dom.shortcutsBtn.setAttribute('aria-expanded', 'false');
      });

      // Close when clicking dialog backdrop
      dom.shortcutsDialog.addEventListener('click', (e) => {
        const dialogRect = dom.shortcutsDialog.getBoundingClientRect();
        const isInDialog = (
          e.clientX >= dialogRect.left &&
          e.clientX <= dialogRect.right &&
          e.clientY >= dialogRect.top &&
          e.clientY <= dialogRect.bottom
        );
        if (!isInDialog) {
          dom.shortcutsDialog.close();
        }
      });
    }

    // Register global keyboard shortcuts
    window.addEventListener('keydown', handleKeyboardShortcuts);
  }

  // --- 12. Boot & Initialization ---
  document.addEventListener('DOMContentLoaded', () => {
    initDOMReferences();
    bindAudioEvents();
    bindUIControls();

    // Set initial audio volume
    if (dom.audio) {
      dom.audio.volume = state.volume;
    }
    syncVolumeUI();

    // Dynamically render playlist items
    renderPlaylist();

    // Load initial track (do not autoplay initially to comply with browser policy)
    if (state.playlist.length > 0) {
      loadTrack(0, false);
    }

    console.log('%c[PulsePlay] Phase 5 Accessibility & Shortcuts initialized.', 'color: #10b981; font-weight: bold;');
  });
})();
