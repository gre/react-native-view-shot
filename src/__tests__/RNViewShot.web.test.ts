// Mock html2canvas before importing the module
const mockToDataURL = jest.fn();
const mockCanvas = {
  toDataURL: mockToDataURL,
  width: 100,
  height: 100,
};

jest.mock("html2canvas", () => {
  return jest.fn().mockResolvedValue(mockCanvas);
});

import html2canvas from "html2canvas";

const RNViewShotWeb = require("../RNViewShot.web")
  .default as typeof import("../RNViewShot.web").default;

describe("RNViewShot.web", () => {
  const mockElement = document.createElement("div");

  beforeEach(() => {
    jest.clearAllMocks();
    mockToDataURL.mockReturnValue("data:image/png;base64,iVBOR...");
  });

  describe("captureRef", () => {
    it("calls html2canvas with useCORS: true", async () => {
      await RNViewShotWeb.captureRef(mockElement, {
        format: "png",
        quality: 1,
        result: "data-uri",
      });
      expect(html2canvas).toHaveBeenCalledWith(mockElement, {
        useCORS: true,
      });
    });

    it("returns data-uri when result is data-uri", async () => {
      mockToDataURL.mockReturnValue("data:image/png;base64,abc123");
      const result = await RNViewShotWeb.captureRef(mockElement, {
        format: "png",
        quality: 1,
        result: "data-uri",
      });
      expect(result).toBe("data:image/png;base64,abc123");
    });

    it("returns raw base64 when result is base64", async () => {
      mockToDataURL.mockReturnValue("data:image/png;base64,abc123");
      const result = await RNViewShotWeb.captureRef(mockElement, {
        format: "png",
        quality: 1,
        result: "base64",
      });
      expect(result).toBe("abc123");
    });

    it("maps jpg format to image/jpeg MIME type", async () => {
      await RNViewShotWeb.captureRef(mockElement, {
        format: "jpg",
        quality: 0.8,
        result: "data-uri",
      });
      expect(mockToDataURL).toHaveBeenCalledWith("image/jpeg", 0.8);
    });

    it("uses image/png for png format", async () => {
      await RNViewShotWeb.captureRef(mockElement, {
        format: "png",
        quality: 1,
        result: "data-uri",
      });
      expect(mockToDataURL).toHaveBeenCalledWith("image/png", 1);
    });

    it("passes quality to toDataURL", async () => {
      await RNViewShotWeb.captureRef(mockElement, {
        format: "jpg",
        quality: 0.5,
        result: "data-uri",
      });
      expect(mockToDataURL).toHaveBeenCalledWith("image/jpeg", 0.5);
    });

    it("returns data-uri for tmpfile result (with warning)", async () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      mockToDataURL.mockReturnValue("data:image/png;base64,abc123");
      const result = await RNViewShotWeb.captureRef(mockElement, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      expect(result).toBe("data:image/png;base64,abc123");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Tmpfile is not implemented"),
      );
      warnSpy.mockRestore();
    });

    it("resizes canvas when width and height are provided", async () => {
      const mockContext = {
        drawImage: jest.fn(),
      };
      const spy = jest.spyOn(document, "createElement").mockReturnValueOnce({
        getContext: () => mockContext,
        width: 0,
        height: 0,
        toDataURL: mockToDataURL,
      } as any);

      await RNViewShotWeb.captureRef(mockElement, {
        format: "png",
        quality: 1,
        result: "data-uri",
        width: 200,
        height: 300,
      });

      expect(mockContext.drawImage).toHaveBeenCalledWith(
        mockCanvas,
        0,
        0,
        200,
        300,
      );
      spy.mockRestore();
    });
  });

  describe("captureScreen", () => {
    it("captures document.body", async () => {
      await RNViewShotWeb.captureScreen({
        format: "png",
        quality: 1,
        result: "data-uri",
      });
      expect(html2canvas).toHaveBeenCalledWith(document.body, {
        useCORS: true,
      });
    });
  });

  describe("releaseCapture", () => {
    it("is a no-op on web (does not throw)", () => {
      expect(() => RNViewShotWeb.releaseCapture("test")).not.toThrow();
    });
  });
});
