---
"react-native-view-shot": patch
---

pr: #742

Windows: read `width`/`height` as decimals instead of truncating them, and round half pixels away from zero (like JS `Math.round`), so `sizeUnit` produces the exact requested pixel size.
