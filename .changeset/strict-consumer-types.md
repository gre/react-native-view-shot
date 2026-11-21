---
"react-native-view-shot": patch
---

Fix TypeScript errors in apps that enable `exactOptionalPropertyTypes` or `noPropertyAccessFromIndexSignature`. React Native type-checks this package's `src/` (through the `react-native` export condition) with the app's own compiler options, where `skipLibCheck` does not apply.
