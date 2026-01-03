# YouTube Audiophile

A Chrome extension to hide video and thumbnails while playing only the audio on YouTube

## Why This Extension Exists?

While listening to audio on YouTube without watching the video at workplaces or public settings, sometimes you simply want to hide the unnecessary visuals entirely. This simple and lightweight extension does only that and nothing else. No cluttered settings and no additional features to mess around.

## Usage

- Use the toggle switch next to the YouTube logo to enable/disable audio-only mode
- When enabled, the video is hidden, thumbnails are replaced with a solid black background, and video quality is set to the lowest to save bandwidth
- Press Ctrl+Shift+A for quick toggling
- Your setting is saved automatically and persists across sessions

## Current Limitation

- Not for YouTube Music
- Not for short videos (you might want to use a separate extension to block short videos)

## How It Works

The video quality is set to the lowest available using YouTube's player API and then hidden. This doesn't affect audio quality as YouTube handles audio separately and streams it in optimal quality. The extension doesn't interfere with YouTube's data stream.

Why Not Simply Disable the Video Stream? - YouTube's architecture doesn't allow completely disabling the video stream while keeping audio active. The media streams are bundled together. Attempting to disable video might interrupt audio playback, cause player errors or unexpected behavior, and violate YouTube's terms of service.

## Changelog

### 1.2.0

- Improved thumbnail hiding: replaced scroll-based detection with DOM mutation observers for immediate hiding of dynamically loaded thumbnails
- Fixed video player clickability: changed video hiding method to preserve play/pause functionality

### 1.1.0

- Thumbnail hiding: thumbnails on newly loaded content (via scrolling) are automatically hidden once loading completes
