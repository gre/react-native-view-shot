---
"react-native-view-shot": patch
---

pr: #765

The `fileName` option now replaces characters other than letters, digits, `.`, `_` and `-` with `_` (with a dev warning), so the resulting `tmpfile` path is always safe to turn into a `file://` URL.
