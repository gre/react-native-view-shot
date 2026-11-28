---
"react-native-view-shot": patch
---

iOS: declare the SwiftPM name (`swiftpmConfig.name`) in `package.json`. Since React Native 0.88, SwiftPM autolinking names a library after its podspec when CocoaPods can read it, so the library was linked as `react-native-view-shot` and the build failed with `product 'react-native-view-shot' ... not found in package 'react-native-view-shot'`, because `Package.swift` calls the product `ReactNativeViewShot`. CocoaPods builds are unaffected.
