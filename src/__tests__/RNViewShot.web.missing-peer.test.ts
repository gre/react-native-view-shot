// html2canvas-pro is an optional peer dependency. Bundlers fail at build time
// when it is missing; this covers the runtime fallback (environments that
// resolve modules lazily), which must reject with an actionable error.
jest.mock("html2canvas-pro", () => {
  throw new Error("Cannot find module 'html2canvas-pro'");
});

const RNViewShotWeb = require("../RNViewShot.web")
  .default as typeof import("../RNViewShot.web").default;

describe("RNViewShot.web when html2canvas-pro cannot be resolved at runtime", () => {
  it("rejects captureRef with an install hint", async () => {
    await expect(
      RNViewShotWeb.captureRef(document.createElement("div"), {
        format: "png",
        quality: 1,
        result: "data-uri",
      }),
    ).rejects.toThrow(/npm install html2canvas-pro/);
  });

  it("rejects captureScreen with an install hint", async () => {
    await expect(
      RNViewShotWeb.captureScreen({
        format: "png",
        quality: 1,
        result: "data-uri",
      }),
    ).rejects.toThrow(/npm install html2canvas-pro/);
  });
});
