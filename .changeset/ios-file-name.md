---
"react-native-view-shot": minor
---

pr: #760

iOS now supports the `fileName` option for `tmpfile` captures, like Android: it is the prefix of the file name, followed by a unique suffix and the extension. iOS used to ignore `fileName`; it now rejects the capture when the name is shorter than 3 characters or contains `/`, as Android does.
