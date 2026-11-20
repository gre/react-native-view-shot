---
"react-native-view-shot": patch
---

pr: #745

Android: drop Gradle syntax and attributes deprecated by Gradle 10 and AGP 8 (space-assignment properties, method-style `compileSdkVersion`/`minSdkVersion`, the manifest `package` attribute, the library `versionCode`/`versionName`). The `namespace` is now always set, so AGP 7 or older is no longer supported (React Native 0.80+ already requires AGP 8).
