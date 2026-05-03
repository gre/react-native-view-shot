# Windows Example

React Native Windows demo app for `react-native-view-shot`.

## Prerequisites

- Node 20+
- Visual Studio 2022 with the **Universal Windows Platform development** and **Native desktop with C++** workloads
- Windows 11 SDK 10.0.22621
- .NET 8 SDK on `PATH`

## Run

```bash
cd example-windows
npm install --legacy-peer-deps
npx react-native autolink-windows
npx react-native run-windows --arch x64
```

`run-windows` builds, deploys, and launches the app in one shot. Pass `--no-launch --no-deploy --no-packager` to only build.

## What's covered

The home screen lists every test screen mirrored from `example/` (BasicTest, FullScreen, Transparency, ScrollView, Image, FS, Modal, Rendering, StyleFilters). Video / WebView / SVG screens are skipped because the underlying RN modules don't have Windows native support.

`snapshotContentContainer` is documented as not supported on Windows — see the lib's `README.md`. The flag is silently ignored and a `console.warn` fires in `__DEV__`.
