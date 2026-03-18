import React from "react";

// View mock that ensures callback refs receive a value in react-test-renderer
export const View = React.forwardRef((props: any, ref: any) => {
  // useImperativeHandle ensures the ref callback receives a mock native-like object
  React.useImperativeHandle(ref, () => ({_nativeTag: 1}));
  return React.createElement("rn-view", props);
});
(View as any).displayName = "View";

export const Platform = {OS: "ios"};

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
