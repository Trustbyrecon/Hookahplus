# Demo Video Setup

## How to Add Your MP4 Demo Video

1. **Download your MP4 file** from Sora or any other source
2. **Rename it to `demo-video.mp4`**
3. **Place it in this directory** (`public/assets/videos/`)
4. **Ensure the file is optimized** for web (recommended: H.264 codec, reasonable file size)

## File Requirements

- **Format**: MP4 (H.264 codec recommended)
- **Filename**: `demo-video.mp4`
- **Location**: `public/assets/videos/demo-video.mp4`
- **Size**: Keep under 50MB for optimal loading performance

## Alternative Formats

You can also add a WebM version for better browser compatibility:
- **Filename**: `demo-video.webm`
- **Location**: `public/assets/videos/demo-video.webm`

## Current Setup

The demo video page is configured to automatically:
- Load your MP4 file
- Display scene breakdowns based on video timing
- Provide custom video controls
- Show scene indicators
- Allow scene navigation

## Scene Timing

The current scene breakdown is set for a ~70-second video:
- Scene 1: 0-5s (Opening Hook)
- Scene 2: 5-13s (QR Code Scan)
- Scene 3: 13-25s (Flavor Personalization)
- Scene 4: 25-40s (Stripe Checkout)
- Scene 5: 40-48s (Confirmation Ping)
- Scene 6: 48-63s (Lounge Dashboard)
- Scene 7: 63-70s (Call to Action)

**Note**: You may need to adjust these timings in `app/demo-video/page.tsx` to match your actual video content.
