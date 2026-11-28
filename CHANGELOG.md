# react-native-view-shot

## 6.3.1

### Patch Changes

- [#768](https://github.com/gre/react-native-view-shot/pull/768) [`1007408`](https://github.com/gre/react-native-view-shot/commit/1007408b90ed76998173b007d5731e8dfb25dbc2) Thanks [@L65FREAD](https://github.com/L65FREAD)! - iOS: captures are rendered with `UIGraphicsImageRendererFormatRangeStandard`, so PNGs are written at 8 bits per channel instead of 16 on wide color devices and simulators. Visible change: JPG captures of views with transparent areas now get a white background there instead of black (JPEG has no alpha channel), matching what non wide color devices already produced.

- [#777](https://github.com/gre/react-native-view-shot/pull/777) [`5e09059`](https://github.com/gre/react-native-view-shot/commit/5e090591b7b73cc65a2c6201a16abc66b17ffa70) Thanks [@m-bert](https://github.com/m-bert)! - iOS: declare the SwiftPM name (`swiftpmConfig.name`) in `package.json`. Since React Native 0.88, SwiftPM autolinking names a library after its podspec when CocoaPods can read it, so the library was linked as `react-native-view-shot` and the build failed with `product 'react-native-view-shot' ... not found in package 'react-native-view-shot'`, because `Package.swift` calls the product `ReactNativeViewShot`. CocoaPods builds are unaffected.

## 6.3.0

### Minor Changes

- [#760](https://github.com/gre/react-native-view-shot/pull/760) [`a895274`](https://github.com/gre/react-native-view-shot/commit/a8952742b46fac13e1bbfaeeceb43dd1194845ea) Thanks [@officialasishkumar](https://github.com/officialasishkumar)! - iOS now supports the `fileName` option for `tmpfile` captures, like Android: it is the prefix of the file name, followed by a unique suffix and the extension. iOS used to ignore `fileName`; it now rejects the capture when the name is shorter than 3 characters or contains `/`, as Android does.

- [#742](https://github.com/gre/react-native-view-shot/pull/742) [`101a713`](https://github.com/gre/react-native-view-shot/commit/101a7134a065711596cbf49394f62b06b131f285) Thanks [@gre](https://github.com/gre)! - Add the `sizeUnit` option (`"dp"` or `"px"`) so `width`/`height` mean the same thing on every platform. Without it, they stay points/dp on iOS and Windows and pixels on Android and web.

### Patch Changes

- [#761](https://github.com/gre/react-native-view-shot/pull/761) [`6d52f61`](https://github.com/gre/react-native-view-shot/commit/6d52f6167cb52426a0abb7f7804f853128c9e22a) Thanks [@fabriziocucci](https://github.com/fabriziocucci)! - Android: `captureScreen` now snapshots the window with PixelCopy (API 26+), so TextureViews such as maps or video keep their z-order with the views drawn above them. With `handleGLSurfaceViewOnAndroid`, or if PixelCopy fails, it falls back to the previous drawing path.

- [#746](https://github.com/gre/react-native-view-shot/pull/746) [`013fbe9`](https://github.com/gre/react-native-view-shot/commit/013fbe9203dcc02e6382ea90556d305957ae652e) Thanks [@gre](https://github.com/gre)! - Android: stop using APIs deprecated in React Native 0.88 and Android (`TurboReactPackage`, `getCurrentActivity()`, `GuardedAsyncTask`, `CompressFormat.WEBP`), removing build warnings.

- [#745](https://github.com/gre/react-native-view-shot/pull/745) [`352f3b6`](https://github.com/gre/react-native-view-shot/commit/352f3b6817de4e541afe5adaa72c68e2482baeb3) Thanks [@gre](https://github.com/gre)! - Android: drop Gradle syntax and attributes deprecated by Gradle 10 and AGP 8 (space-assignment properties, method-style `compileSdkVersion`/`minSdkVersion`, the manifest `package` attribute, the library `versionCode`/`versionName`). The `namespace` is now always set, so AGP 7 or older is no longer supported (React Native 0.80+ already requires AGP 8).

- [#737](https://github.com/gre/react-native-view-shot/pull/737) [`0b970c9`](https://github.com/gre/react-native-view-shot/commit/0b970c9941dd5ea04300599dbc676cc572698dc4) Thanks [@gre](https://github.com/gre)! - Android: ship explicit consumer ProGuard/R8 rules for the native module, instead of relying only on React Native's own keep rules.

- [#738](https://github.com/gre/react-native-view-shot/pull/738) [`1b032e7`](https://github.com/gre/react-native-view-shot/commit/1b032e7060a2a3e949b3f144cba405608a9b3451) Thanks [@gre](https://github.com/gre)! - Android: when the app does not define them, the library now defaults to `compileSdkVersion` 35 (was 34) and `minSdkVersion` 24 (was 21), and no longer sets a `targetSdkVersion`. React Native 0.80+ templates define these values, so most apps are unaffected.

- [#765](https://github.com/gre/react-native-view-shot/pull/765) [`6e3cbfa`](https://github.com/gre/react-native-view-shot/commit/6e3cbfae3a635ca5218e5a9d81c1f1fa1eb64bbc) Thanks [@gre](https://github.com/gre)! - The `fileName` option now replaces characters other than letters, digits, `.`, `_` and `-` with `_` (with a dev warning), so the resulting `tmpfile` path is always safe to turn into a `file://` URL.

- [#771](https://github.com/gre/react-native-view-shot/pull/771) [`1da3a46`](https://github.com/gre/react-native-view-shot/commit/1da3a46abd95b83e99cddbee8c59e87eddd60fe4) Thanks [@saseungmin](https://github.com/saseungmin)! - Use type-only imports so React Native consumers with `verbatimModuleSyntax` enabled can type-check the library source without TS1484 errors.

- [#747](https://github.com/gre/react-native-view-shot/pull/747) [`deeaab2`](https://github.com/gre/react-native-view-shot/commit/deeaab29b36f01203afdcd9dbc3be3c4e55fe548) Thanks [@gre](https://github.com/gre)! - iOS: `captureScreen` uses the foreground scene's key window instead of the deprecated `keyWindow`, keeps working while the app is in the background, and rejects with a clear message when no window is available.

- [#774](https://github.com/gre/react-native-view-shot/pull/774) [`a4be523`](https://github.com/gre/react-native-view-shot/commit/a4be52302006e662d46a8649dd1b666c9e239f28) Thanks [@gre](https://github.com/gre)! - Fix TypeScript errors in apps that enable `exactOptionalPropertyTypes` or `noPropertyAccessFromIndexSignature`. React Native type-checks this package's `src/` (through the `react-native` export condition) with the app's own compiler options, where `skipLibCheck` does not apply.

- [#742](https://github.com/gre/react-native-view-shot/pull/742) [`101a713`](https://github.com/gre/react-native-view-shot/commit/101a7134a065711596cbf49394f62b06b131f285) Thanks [@gre](https://github.com/gre)! - Windows: read `width`/`height` as decimals instead of truncating them, and round half pixels away from zero (like JS `Math.round`), so `sizeUnit` produces the exact requested pixel size.

- [#740](https://github.com/gre/react-native-view-shot/pull/740) [`1573f78`](https://github.com/gre/react-native-view-shot/commit/1573f78642b8be36040ce461ee9e70e9b842a9c3) Thanks [@gre](https://github.com/gre)! - Declare the Windows-only `path` capture option in the TypeScript types and the README. The Windows module already supported it.
