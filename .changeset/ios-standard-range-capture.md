---
"react-native-view-shot": patch
---

pr: #768

iOS: captures are rendered with `UIGraphicsImageRendererFormatRangeStandard`, so PNGs are written at 8 bits per channel instead of 16 on wide color devices and simulators. Visible change: JPG captures of views with transparent areas now get a white background there instead of black (JPEG has no alpha channel), matching what non wide color devices already produced.
