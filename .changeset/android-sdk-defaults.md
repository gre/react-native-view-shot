---
"react-native-view-shot": patch
---

pr: #738

Android: when the app does not define them, the library now defaults to `compileSdkVersion` 35 (was 34) and `minSdkVersion` 24 (was 21), and no longer sets a `targetSdkVersion`. React Native 0.80+ templates define these values, so most apps are unaffected.
