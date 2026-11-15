import React from "react";

// View mock that ensures callback refs receive a value in react-test-renderer
export const View = React.forwardRef((props: any, ref: any) => {
  // useImperativeHandle ensures the ref callback receives a mock native-like object
  React.useImperativeHandle(ref, () => ({_nativeTag: 1}));
  return React.createElement("rn-view", props);
});
(View as any).displayName = "View";

export const Platform = {OS: "ios"};

export const PixelRatio = {
  get: () => 2,
};

export const findNodeHandle = jest.fn((ref: any) => {
  if (ref && ref._nativeTag) return ref._nativeTag;
  return 42;
});

export const NativeModules = {
  RNViewShot: {
    captureRef: jest.fn().mockResolvedValue("/tmp/captured.png"),
    captureScreen: jest.fn().mockResolvedValue("/tmp/screen.png"),
    releaseCapture: jest.fn(),
  },
};

export const StyleSheet = {
  create: (styles: any) => styles,
};

// React Native's processColor converts color strings to 32-bit ARGB integers
export const processColor = jest.fn((color?: any) => {
  if (color === undefined || color === null) return color;
  if (typeof color === "number") return color;
  try {
    const normalizeColor = require("@react-native/normalize-colors");
    const normalizedColor = normalizeColor(color);
    if (typeof normalizedColor !== "number") return null;
    return ((normalizedColor << 24) | (normalizedColor >>> 8)) >>> 0;
  } catch {
    return null;
  }
});
