// `sizeUnit` converts width/height from the caller's unit into each
// platform's native unit, so the output pixel size is identical everywhere:
//   "dp": output px = round(value × PixelRatio.get())
//   "px": output px = value
// Native default units: iOS / Windows read points (dp), Android / web read
// pixels. Without `sizeUnit`, values pass through unchanged.

type Platform = "ios" | "android" | "web" | "windows";

interface Setup {
  captureRef: typeof import("../index").captureRef;
  captureScreen: typeof import("../index").captureScreen;
  nativeCaptureRef: jest.Mock;
  nativeCaptureScreen: jest.Mock;
}

function setup(os: Platform, pixelRatio: number): Setup {
  jest.resetModules();
  const RN = require("react-native");
  RN.Platform.OS = os;
  RN.PixelRatio.get = () => pixelRatio;
  const nativeCaptureRef = jest.fn().mockResolvedValue("/tmp/test.png");
  const nativeCaptureScreen = jest.fn().mockResolvedValue("/tmp/screen.png");
  jest.doMock("../RNViewShot", () => ({
    __esModule: true,
    default: {
      captureRef: nativeCaptureRef,
      captureScreen: nativeCaptureScreen,
      releaseCapture: jest.fn(),
    },
  }));
  const mod = require("../index");
  return {
    captureRef: mod.captureRef,
    captureScreen: mod.captureScreen,
    nativeCaptureRef,
    nativeCaptureScreen,
  };
}

/** Pixels each platform's native side produces from the values it got. */
function nativeOutputPx(os: Platform, value: number, pixelRatio: number) {
  switch (os) {
    case "android":
      // ReadableMap.getInt: integer pixels.
      if (!Number.isInteger(value)) throw new Error("android needs an int");
      return value;
    case "web":
      return value; // canvas.width = value
    case "ios":
      // UIGraphicsImageRenderer with scale = device scale: points × scale.
      // Must already be a whole number of pixels (no rounding happens).
      if (!Number.isInteger(value * pixelRatio))
        throw new Error("ios got a fractional pixel size");
      return value * pixelRatio;
    case "windows":
      // JSValue.AsDouble, then Math.Round(width * LogicalDpi/96,
      // MidpointRounding.AwayFromZero) in ViewShot.cs; for positive values
      // that is what JS Math.round does.
      return Math.round(value * pixelRatio);
  }
}

async function nativeSize(
  s: Setup,
  options: Parameters<Setup["captureRef"]>[1],
): Promise<{width?: number; height?: number; sizeUnit?: unknown}> {
  await s.captureRef(42, options);
  return s.nativeCaptureRef.mock.calls[0][1];
}

const RATIOS: Record<Platform, number> = {
  ios: 3,
  android: 2.75,
  web: 1.25,
  windows: 1.5,
};

describe("sizeUnit", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe.each(Object.keys(RATIOS) as Platform[])("on %s", os => {
    const pr = RATIOS[os];

    it("passes width/height through unchanged when omitted", async () => {
      const s = setup(os, pr);
      const opts = await nativeSize(s, {width: 300, height: 200});
      expect(opts.width).toBe(300);
      expect(opts.height).toBe(200);
      expect(opts).not.toHaveProperty("sizeUnit");
    });

    it('"dp" yields round(value × PixelRatio) output pixels', async () => {
      const s = setup(os, pr);
      const opts = await nativeSize(s, {
        width: 300,
        height: 201,
        sizeUnit: "dp",
      });
      expect(nativeOutputPx(os, opts.width!, pr)).toBe(Math.round(300 * pr));
      expect(nativeOutputPx(os, opts.height!, pr)).toBe(Math.round(201 * pr));
      expect(opts).not.toHaveProperty("sizeUnit");
    });

    it('"px" yields exactly value output pixels', async () => {
      const s = setup(os, pr);
      const opts = await nativeSize(s, {
        width: 300,
        height: 201,
        sizeUnit: "px",
      });
      expect(nativeOutputPx(os, opts.width!, pr)).toBe(300);
      expect(nativeOutputPx(os, opts.height!, pr)).toBe(201);
      expect(opts).not.toHaveProperty("sizeUnit");
    });

    it.each([
      [1, 1],
      [103, 103], // 103 × 1.5 = 154.5: half-pixel case
      [100.1, 100.1],
      [240 / 2.75, 101],
      [0.75, 2000],
    ])(
      '"dp" %p x %p gives the same pixels as everywhere else',
      async (w, h) => {
        const s = setup(os, pr);
        const opts = await nativeSize(s, {width: w, height: h, sizeUnit: "dp"});
        expect(nativeOutputPx(os, opts.width!, pr)).toBe(Math.round(w * pr));
        expect(nativeOutputPx(os, opts.height!, pr)).toBe(Math.round(h * pr));
      },
    );

    it('"px" rounds fractional pixels the same way everywhere', async () => {
      const s = setup(os, pr);
      const opts = await nativeSize(s, {
        width: 300.7,
        height: 200.4,
        sizeUnit: "px",
      });
      expect(nativeOutputPx(os, opts.width!, pr)).toBe(301);
      expect(nativeOutputPx(os, opts.height!, pr)).toBe(200);
    });

    it('"px" round-trips sizes from 1 to 2000 exactly', () => {
      // Same arithmetic as the implementation, without the capture plumbing.
      const toNative = (px: number) =>
        os === "ios" || os === "windows" ? px / pr : px;
      for (let px = 1; px <= 2000; px++) {
        expect(nativeOutputPx(os, toNative(px), pr)).toBe(px);
      }
    });

    it("drops a size that rounds below 1 pixel, with a warning", async () => {
      const warn = jest.spyOn(console, "warn").mockImplementation();
      const s = setup(os, pr);
      const opts = await nativeSize(s, {
        width: 0.1,
        height: 0.4,
        sizeUnit: "px",
      });
      expect(opts).not.toHaveProperty("width");
      expect(opts).not.toHaveProperty("height");
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("below 1"));
    });

    it("converts captureScreen options too", async () => {
      const s = setup(os, pr);
      await s.captureScreen({width: 100, height: 100, sizeUnit: "dp"});
      const opts = s.nativeCaptureScreen.mock.calls[0][0];
      expect(nativeOutputPx(os, opts.width, pr)).toBe(Math.round(100 * pr));
    });
  });

  it("Android dp: rounds to the nearest pixel instead of truncating (#291)", async () => {
    const s = setup("android", 2.75);
    // 240 / 2.75 * 2.75 === 239.99999999999997 in floating point.
    const opts = await nativeSize(s, {
      width: 240 / 2.75,
      height: 101,
      sizeUnit: "dp",
    });
    expect(opts.width).toBe(240);
    expect(opts.height).toBe(278); // 277.75
  });

  it("converts each of width / height independently", async () => {
    const s = setup("android", 2);
    const opts = await nativeSize(s, {width: 50, sizeUnit: "dp"});
    expect(opts.width).toBe(100);
    expect(opts).not.toHaveProperty("height");
  });

  it("warns and ignores an invalid sizeUnit", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation();
    const s = setup("android", 2.75);
    const opts = await nativeSize(s, {
      width: 300,
      height: 200,
      sizeUnit: "pt" as unknown as "dp",
    });
    expect(opts.width).toBe(300);
    expect(opts.height).toBe(200);
    expect(opts).not.toHaveProperty("sizeUnit");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("sizeUnit"));
  });
});
