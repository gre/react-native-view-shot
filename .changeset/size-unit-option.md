---
"react-native-view-shot": minor
---

pr: #742

Add the `sizeUnit` option (`"dp"` or `"px"`) so `width`/`height` mean the same thing on every platform. Without it, they stay points/dp on iOS and Windows and pixels on Android and web.
