/**
 * PulsePlay — Master Playlist Data
 * ============================================================================
 * NOTE FOR USER:
 * The tracks below are default template entries that reference local audio paths.
 * To play these sample tracks, place corresponding audio files in 'assets/music/':
 *   - assets/music/song-1.mp3
 *   - assets/music/song-2.mp3
 *   - assets/music/song-3.mp3
 *
 * Alternatively, you can upload your own MP3 files directly through the player's
 * "Upload Music" button at any time without editing this file!
 * ============================================================================
 */

const defaultPlaylist = [
  {
    id: 'track-1',
    title: 'Neon Horizon',
    artist: 'Cyber Synthwave',
    src: 'assets/music/song-1.mp3',
    cover: 'assets/images/default-cover.svg'
  },
  {
    id: 'track-2',
    title: 'Midnight Echoes',
    artist: 'Lunar Ambient',
    src: 'assets/music/song-2.mp3',
    cover: 'assets/images/default-cover.svg'
  },
  {
    id: 'track-3',
    title: 'Pulse Velocity',
    artist: 'Digital Groove',
    src: 'assets/music/song-3.mp3',
    cover: 'assets/images/default-cover.svg'
  }
];

// Attach to window for global access across scripts
window.initialPlaylist = defaultPlaylist;
