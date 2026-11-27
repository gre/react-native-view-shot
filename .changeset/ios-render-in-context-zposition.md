---
"react-native-view-shot": patch
---

pr: #696

iOS: `useRenderInContext` captures now honour `zPosition`, so bordered views on the new architecture are no longer captured as a flat block of their background color.
