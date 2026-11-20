---
"react-native-view-shot": patch
---

pr: #747

iOS: `captureScreen` uses the foreground scene's key window instead of the deprecated `keyWindow`, keeps working while the app is in the background, and rejects with a clear message when no window is available.
