# YouTube Audiophile

A Chrome extension that transforms YouTube into an audio-only player, perfect for music listening while saving bandwidth.

## Features

- **Audio-Only Mode**: Hides video elements and forces lowest quality (144p) for minimal bandwidth usage
- **Resilient Video Hiding**: Automatically re-hides videos when navigating within YouTube SPA
- **Persistent Settings**: Remembers your preference across browser sessions
- **Keyboard Shortcut**: Toggle with `Ctrl+Shift+A`
- **Smart Quality Control**: Sets to 1080p (or highest below) when deactivated, adapts to available levels
- **Performance Optimized**: Debounced toggles, cached elements, efficient DOM observation
- **Resilient Element Detection**: Multiple selectors for YouTube layout changes
- **Robust Error Handling**: Graceful fallbacks when YouTube API changes

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. Visit any YouTube video page

## Usage

- **Toggle Switch**: Look for the "YouTube Audiophile" toggle next to the YouTube logo
- **Keyboard Shortcut**: Press `Ctrl+Shift+A` to quickly toggle audio mode
- **Automatic Application**: Your setting persists across YouTube sessions

## How It Works

When activated:
- Video quality is set to the lowest available (typically 144p)
- Video element is hidden from view
- Audio continues playing normally

When deactivated:
- Quality is restored to 1080p (or highest available quality below 4K)
- Video becomes visible again

## Permissions

- `storage`: To remember your toggle preference
- `https://www.youtube.com/*`: To inject scripts and modify the page

## Development

Built with:
- Manifest V3
- Vanilla JavaScript (ES6+)
- Chrome Extension APIs

## Contributing

Feel free to submit issues and enhancement requests!
