# YouTube Audiophile

A Chrome extension to hide video and thumbnails while playing only the audio on YouTube

[![Chrome webstore logo](/publishing_assets/UV4C4ybeBTsZt43U4xis.png)](https://chromewebstore.google.com/detail/kefolpfkgnpndcfhepifebimniglijnl)

## Changelog

### 1.2.0

- Improved thumbnail hiding: replaced scroll-based detection with DOM mutation observers for immediate hiding of dynamically loaded thumbnails
- Fixed video player clickability: changed video hiding method to preserve play/pause functionality

### 1.1.0

- Thumbnail hiding: thumbnails on newly loaded content (via scrolling) are automatically hidden once loading completes
