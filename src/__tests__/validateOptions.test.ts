// validateOptions is not exported, so we test it indirectly through captureRef
// which calls it internally and passes the coerced options to the native module.

describe("validateOptions (via captureRef)", () => {
  let captureRef: typeof import("../index").captureRef;
  let mockCaptureRef: jest.Mock;

  beforeEach(() => {
    jest.resetModules();

    // Mock the native module
    mockCaptureRef = jest.fn().mockResolvedValue("/tmp/test.png");
    jest.mock("../RNViewShot", () => ({
      __esModule: true,
      default: {
        captureRef: mockCaptureRef,
        captureScreen: jest.fn().mockResolvedValue("/tmp/screen.png"),
        releaseCapture: jest.fn(),
      },
    }));

    // Import after mocking
    const mod = require("../index");
    captureRef = mod.captureRef;
  });

  it("uses default options when none provided", async () => {
    await captureRef(42);
    expect(mockCaptureRef).toHaveBeenCalledWith(42, {
      format: "png",
      quality: 1,
      result: "tmpfile",
      snapshotContentContainer: false,
      handleGLSurfaceViewOnAndroid: false,
    });
  });

  it("passes valid options through", async () => {
    await captureRef(42, {
      format: "jpg",
      quality: 0.8,
      result: "base64",
      width: 100,
      height: 200,
    });
    expect(mockCaptureRef).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        format: "jpg",
        quality: 0.8,
        result: "base64",
        width: 100,
        height: 200,
      }),
    );
  });

  it("resets invalid quality to default", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    await captureRef(42, {quality: 2.0});
    expect(mockCaptureRef).toHaveBeenCalledWith(
      42,
      expect.objectContaining({quality: 1}),
    );
    warnSpy.mockRestore();
  });

  it("resets negative quality to default", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    await captureRef(42, {quality: -0.5});
    expect(mockCaptureRef).toHaveBeenCalledWith(
      42,
      expect.objectContaining({quality: 1}),
    );
    warnSpy.mockRestore();
  });

  it("removes invalid width", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    await captureRef(42, {width: -10});
    const calledOptions = mockCaptureRef.mock.calls[0][1];
    expect(calledOptions.width).toBeUndefined();
    warnSpy.mockRestore();
  });

  it("removes invalid height", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    await captureRef(42, {height: 0});
    const calledOptions = mockCaptureRef.mock.calls[0][1];
    expect(calledOptions.height).toBeUndefined();
    warnSpy.mockRestore();
  });

  it("resets invalid format to png", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    await captureRef(42, {format: "bmp" as any});
    expect(mockCaptureRef).toHaveBeenCalledWith(
      42,
      expect.objectContaining({format: "png"}),
    );
    warnSpy.mockRestore();
  });

  it("resets invalid result to tmpfile", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    await captureRef(42, {result: "invalid" as any});
    expect(mockCaptureRef).toHaveBeenCalledWith(
      42,
      expect.objectContaining({result: "tmpfile"}),
    );
    warnSpy.mockRestore();
  });

  it("warns in __DEV__ when options are invalid", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    await captureRef(42, {quality: 5, width: -1});
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("bad options"),
    );
    warnSpy.mockRestore();
  });

  it("accepts data-uri result", async () => {
    await captureRef(42, {result: "data-uri"});
    expect(mockCaptureRef).toHaveBeenCalledWith(
      42,
      expect.objectContaining({result: "data-uri"}),
    );
  });
});

describe("zip-base64 result per platform", () => {
  let mockCaptureRef: jest.Mock;

  // Drop the registry holding the mutated Platform.OS so it can't leak.
  afterEach(() => jest.resetModules());

  // acceptedResults is computed from Platform.OS at module load, so set the
  // (mocked) platform before requiring ../index.
  function loadCaptureRef(os: string): typeof import("../index").captureRef {
    jest.resetModules();
    mockCaptureRef = jest.fn().mockResolvedValue("/tmp/test.png");
    jest.mock("../RNViewShot", () => ({
      __esModule: true,
      default: {
        captureRef: mockCaptureRef,
        captureScreen: jest.fn(),
        releaseCapture: jest.fn(),
      },
    }));
    require("react-native").Platform.OS = os;
    return require("../index").captureRef;
  }

  it("keeps zip-base64 on android", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    const captureRef = loadCaptureRef("android");
    await captureRef(42, {result: "zip-base64"});
    expect(mockCaptureRef).toHaveBeenCalledWith(
      42,
      expect.objectContaining({result: "zip-base64"}),
    );
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it.each(["ios", "web", "windows"])(
    "falls back to tmpfile with a warning on %s",
    async os => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      const captureRef = loadCaptureRef(os);
      await captureRef(42, {result: "zip-base64"});
      expect(mockCaptureRef).toHaveBeenCalledWith(
        42,
        expect.objectContaining({result: "tmpfile"}),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("option result 'zip-base64' is not a valid"),
      );
      warnSpy.mockRestore();
    },
  );
});

describe("captureScreen", () => {
  let captureScreen: typeof import("../index").captureScreen;
  let mockCaptureScreen: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    mockCaptureScreen = jest.fn().mockResolvedValue("/tmp/screen.png");
    jest.mock("../RNViewShot", () => ({
      __esModule: true,
      default: {
        captureRef: jest.fn(),
        captureScreen: mockCaptureScreen,
        releaseCapture: jest.fn(),
      },
    }));
    const mod = require("../index");
    captureScreen = mod.captureScreen;
  });

  it("calls native captureScreen with validated options", async () => {
    await captureScreen({format: "jpg", quality: 0.5});
    expect(mockCaptureScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        format: "jpg",
        quality: 0.5,
      }),
    );
  });
});

describe("releaseCapture", () => {
  let releaseCapture: typeof import("../index").releaseCapture;
  let mockReleaseCapture: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    mockReleaseCapture = jest.fn();
    jest.mock("../RNViewShot", () => ({
      __esModule: true,
      default: {
        captureRef: jest.fn(),
        captureScreen: jest.fn(),
        releaseCapture: mockReleaseCapture,
      },
    }));
    const mod = require("../index");
    releaseCapture = mod.releaseCapture;
  });

  it("calls native releaseCapture with uri", () => {
    releaseCapture("/tmp/test.png");
    expect(mockReleaseCapture).toHaveBeenCalledWith("/tmp/test.png");
  });

  it("warns and does not call native when uri is not a string", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    releaseCapture(123 as any);
    expect(mockReleaseCapture).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Invalid argument"),
    );
    warnSpy.mockRestore();
  });
});
