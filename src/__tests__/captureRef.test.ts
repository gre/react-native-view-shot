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
    const ref = {
      current: {_nativeTag: 99} as unknown as React.Component,
    };
    await captureRef(ref);
    expect(mockNativeCaptureRef).toHaveBeenCalled();
  });

  it("accepts a ref whose current is null", async () => {
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
