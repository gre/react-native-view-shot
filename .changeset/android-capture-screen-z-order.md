---
"react-native-view-shot": patch
---

pr: #761

Android: `captureScreen` now snapshots the window with PixelCopy (API 26+), so TextureViews such as maps or video keep their z-order with the views drawn above them. With `handleGLSurfaceViewOnAndroid`, or if PixelCopy fails, it falls back to the previous drawing path.
