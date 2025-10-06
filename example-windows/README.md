# Windows Example - Minimal ViewShot Test

This is a minimal React Native Windows app to test the ViewShot module.

## ⚠️ Current Status

**Windows support is currently under construction and not working in CI.**

The Windows build fails in GitHub Actions CI due to missing React Native Windows assemblies and dependencies. This is a known issue that needs to be resolved separately from the main CI pipeline.

**Current CI Status:**

- ✅ All other platforms (Android, iOS, Web) work correctly
- ❌ Windows build is temporarily disabled in CI
- 🔧 Windows support is being worked on separately

## Setup

```bash
npm install
npx react-native-windows-init --overwrite
```

## Run

```bash
npm run windows
```

## Test

The app displays a simple view with a colored box that can be captured using ViewShot.
This validates that the Windows module correctly:

- Integrates with React Native Windows
- Captures view snapshots
- Returns image URIs

## Known Issues

- **CI Build Failure**: Windows build fails in GitHub Actions due to missing React Native Windows assemblies
- **Dependencies**: React Native Windows 0.75.19 compatibility issues in CI environment
- **Autolinking**: Windows autolinking may not work correctly in CI

These issues are being tracked and will be resolved in future updates.
