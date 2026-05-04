import type React from "react";

describe("captureRef", () => {
  let captureRef: typeof import("../index").captureRef;
  let mockNativeCaptureRef: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    mockNativeCaptureRef = jest.fn().mockResolvedValue("/tmp/test.png");
    jest.mock("../RNViewShot", () => ({
      __esModule: true,
      default: {
        captureRef: mockNativeCaptureRef,
        captureScreen: jest.fn(),
        releaseCapture: jest.fn(),
      },
    }));
    const mod = require("../index");
    captureRef = mod.captureRef;
  });

  it("accepts a numeric view handle directly", async () => {
    await captureRef(42);
    expect(mockNativeCaptureRef).toHaveBeenCalledWith(42, expect.any(Object));
  });

  it("unwraps ref objects via ref.current", async () => {
    // When ref.current is truthy, captureRef unwraps it and uses findNodeHandle.
    // Cast to the public type — in practice ref.current is a host instance whose
    // exact shape is opaque; the type system mirrors what findNodeHandle accepts.
    const ref = {
      current: {_nativeTag: 99} as unknown as React.Component,
    };
    await captureRef(ref);
    // The native mock is called (findNodeHandle returns 42 by default from our mock)
    expect(mockNativeCaptureRef).toHaveBeenCalled();
  });

  it("passes ref.current=null through without unwrapping", async () => {
    // When ref.current is null, the outer if-condition fails so viewHandle stays as the ref object
    // findNodeHandle is then called with the ref object itself
    const ref: React.RefObject<React.Component | null> = {current: null};
    await captureRef(ref);
    expect(mockNativeCaptureRef).toHaveBeenCalled();
  });

  it("throws when RNViewShot is undefined", () => {
    jest.resetModules();
    jest.mock("../RNViewShot", () => ({
      __esModule: true,
      default: null,
    }));
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    const mod = require("../index");
    expect(() => mod.captureRef(42)).toThrow("RNViewShot is undefined");
    warnSpy.mockRestore();
  });
});

describe("captureScreen", () => {
  it("throws when RNViewShot is undefined", () => {
    jest.resetModules();
    jest.mock("../RNViewShot", () => ({
      __esModule: true,
      default: null,
    }));
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    const mod = require("../index");
    expect(() => mod.captureScreen()).toThrow("RNViewShot is undefined");
    warnSpy.mockRestore();
  });
});
