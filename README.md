# YouTube Audiophile

A Chrome extension that lets you enjoy YouTube videos as audio-only, saving bandwidth while you listen to music or podcasts, and perfect for workplaces where you want to only listen without visuals. ♫⋆｡♪

## Features

- Listen to YouTube content without watching videos
- Hides the video from view and plays in lowest quality in the background to save bandwidth
- Automatically hides video thumbnails by replacing them with solid black background for a distraction-free experience
- Thumbnails on dynamically loaded content are hidden immediately using efficient DOM mutation observers
- Easy toggle switch next to the YouTube logo
- Quick keyboard shortcut (Ctrl+Shift+A)
- Remembers your preference across sessions

## Usage

- Use the toggle switch next to the YouTube logo to enable/disable audio-only mode
- When enabled, the video is hidden, thumbnails are replaced with a solid black background, and video quality is set to the lowest to save bandwidth
- Thumbnails on dynamically loaded content are hidden immediately as they're added to the page
- Press Ctrl+Shift+A for quick toggling
- Your setting is saved automatically and persists across sessions

## How It Works

To save bandwidth, the extension sets video quality to the lowest available using YouTube's player API and hides the video. This doesn't affect audio quality—YouTube handles audio separately and streams it in optimal quality. The extension doesn't interfere with YouTube's data stream and doesn't block ads, so you can support content creators as usual.

### Why Not Simply Disable the Video Stream?

YouTube's architecture doesn't allow completely disabling the video stream while keeping audio active—the media streams are bundled together. Attempting to disable video might:

- Interrupt audio playback
- Cause player errors or unexpected behavior
- Violate YouTube's terms of service
- Break compatibility with different devices/browsers

Setting video quality to the lowest available provides the best balance of bandwidth savings, audio quality preservation, and system stability.

## Changelog

### 1.3.0

- Fixed video player clickability: changed video hiding method to preserve play/pause functionality
- Improved thumbnail detection: excluded profile images and other non-thumbnail content from being hidden
- Enhanced reliability: better handling of dynamically loaded content and edge cases

### 1.2.0

- Improved thumbnail hiding: replaced scroll-based detection with efficient DOM mutation observers for immediate hiding of dynamically loaded thumbnails

### 1.1.0

- Thumbnail hiding: thumbnails on newly loaded content (via scrolling) are automatically hidden once loading completes
