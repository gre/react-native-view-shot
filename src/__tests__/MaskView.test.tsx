import React from "react";
import {Platform} from "react-native";
import renderer, {act} from "react-test-renderer";

// Mock RNViewShot before importing index to avoid TurboModuleRegistry in unit tests
jest.mock("../RNViewShot", () => ({
  __esModule: true,
  default: {
    captureRef: jest.fn(),
    captureScreen: jest.fn(),
    releaseCapture: jest.fn(),
  },
}));

import {MaskView, normalizeMaskColor} from "../MaskView";

describe("MaskView component", () => {
  it("renders children correctly", async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MaskView>
          <span>Sensitive Content</span>
        </MaskView>,
      );
    });

    const json = tree!.toJSON() as any;
    expect(json).toBeTruthy();
    expect(json.type).toBe("rn-view");
    expect(json.children).toBeDefined();
    expect(json.children[0].type).toBe("span");
    expect(json.children[0].children[0]).toBe("Sensitive Content");
    await act(async () => tree!.unmount());
  });

  it("enforces collapsable={false} to prevent flattening in Fabric/Paper", async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MaskView collapsable={true as any}>
          <span>Sensitive Content</span>
        </MaskView>,
      );
    });

    const json = tree!.toJSON() as any;
    expect(json.props.collapsable).toBe(false);
    await act(async () => tree!.unmount());
  });

  it("enforces overflow: 'hidden' to prevent overflowing children from leaking", async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MaskView style={{overflow: "visible" as any, width: 100}}>
          <span>Overflow Content</span>
        </MaskView>,
      );
    });

    const json = tree!.toJSON() as any;
    // Style is an array where overflow: hidden is enforced
    expect(json.props.style).toEqual(
      expect.arrayContaining([{overflow: "hidden"}]),
    );
    // The final applied style in the array must be overflow: hidden
    expect(json.props.style[json.props.style.length - 1]).toEqual({
      overflow: "hidden",
    });
    await act(async () => tree!.unmount());
  });

  it("sets default nativeID with normalized black maskColor (ff000000)", async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MaskView>
          <span>Secret</span>
        </MaskView>,
      );
    });

    const json = tree!.toJSON() as any;
    expect(json.props.nativeID).toBe("rn-view-shot-mask:ff000000");
    await act(async () => tree!.unmount());
  });

  it("sets nativeID with custom normalized maskColor", async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MaskView maskColor="#FF5500">
          <span>Secret</span>
        </MaskView>,
      );
    });

    const json = tree!.toJSON() as any;
    expect(json.props.nativeID).toBe("rn-view-shot-mask:ffff5500");
    await act(async () => tree!.unmount());
  });

  it("supports 8-digit hex colors with alpha", async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MaskView maskColor="#FF550080">
          <span>Secret</span>
        </MaskView>,
      );
    });

    const json = tree!.toJSON() as any;
    expect(json.props.nativeID).toBe("rn-view-shot-mask:80ff5500");
    await act(async () => tree!.unmount());
  });

  it("passes standard View props through to the underlying View", async () => {
    const customStyle = {width: 100, height: 100, backgroundColor: "red"};
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MaskView
          style={customStyle}
          testID="test-mask"
          pointerEvents="box-none"
        >
          <span>Inside</span>
        </MaskView>,
      );
    });

    const json = tree!.toJSON() as any;
    expect(json.props.testID).toBe("test-mask");
    expect(json.props.pointerEvents).toBe("box-none");
    await act(async () => tree!.unmount());
  });

  it("forwards ref to the underlying View element", async () => {
    const ref = React.createRef<any>();
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MaskView ref={ref}>
          <span>Ref Target</span>
        </MaskView>,
      );
    });

    expect(ref.current).toBeDefined();
    expect(ref.current._nativeTag).toBe(1);
    await act(async () => tree!.unmount());
  });

  it("prevents props from overriding the internal nativeID", async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MaskView {...({nativeID: "user-id-attempt"} as any)}>
          <span>Content</span>
        </MaskView>,
      );
    });

    const json = tree!.toJSON() as any;
    expect(json.props.nativeID).toBe("rn-view-shot-mask:ff000000");
    await act(async () => tree!.unmount());
  });

  it("supports 3-digit hex, named colors, transparent, and rgb() values", async () => {
    let tree1: renderer.ReactTestRenderer;
    let tree2: renderer.ReactTestRenderer;
    let tree3: renderer.ReactTestRenderer;
    await act(async () => {
      tree1 = renderer.create(
        <MaskView maskColor="#F00">
          <span>Red</span>
        </MaskView>,
      );
      tree2 = renderer.create(
        <MaskView maskColor="white">
          <span>White</span>
        </MaskView>,
      );
      tree3 = renderer.create(
        <MaskView maskColor="transparent">
          <span>Transparent</span>
        </MaskView>,
      );
    });

    const json1 = tree1!.toJSON() as any;
    const json2 = tree2!.toJSON() as any;
    const json3 = tree3!.toJSON() as any;
    expect(json1.props.nativeID).toBe("rn-view-shot-mask:ffff0000");
    expect(json2.props.nativeID).toBe("rn-view-shot-mask:ffffffff");
    expect(json3.props.nativeID).toBe("rn-view-shot-mask:00000000");
    await act(async () => {
      tree1!.unmount();
      tree2!.unmount();
      tree3!.unmount();
    });
  });

  it("warns in development when rendered on unsupported platforms (web/windows)", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const origOS = Platform.OS;
    try {
      Platform.OS = "web";
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(
          <MaskView>
            <span>Web Content</span>
          </MaskView>,
        );
      });
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[react-native-view-shot] MaskView is not supported on web",
        ),
      );
      await act(async () => tree!.unmount());
    } finally {
      Platform.OS = origOS;
      warnSpy.mockRestore();
    }
  });

  it("renders multiple children within the mask container", async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MaskView>
          <span>First</span>
          <span>Second</span>
        </MaskView>,
      );
    });

    const json = tree!.toJSON() as any;
    expect(json.children.length).toBe(2);
    expect(json.children[0].children[0]).toBe("First");
    expect(json.children[1].children[0]).toBe("Second");
    await act(async () => tree!.unmount());
  });
});

describe("normalizeMaskColor helper", () => {
  it("normalizes default/empty/null to opaque black (ff000000)", () => {
    expect(normalizeMaskColor()).toBe("ff000000");
    expect(normalizeMaskColor(null as any)).toBe("ff000000");
    expect(normalizeMaskColor(undefined)).toBe("ff000000");
  });

  it("normalizes named colors", () => {
    expect(normalizeMaskColor("red")).toBe("ffff0000");
    expect(normalizeMaskColor("blue")).toBe("ff0000ff");
    expect(normalizeMaskColor("green")).toBe("ff008000");
    expect(normalizeMaskColor("black")).toBe("ff000000");
    expect(normalizeMaskColor("white")).toBe("ffffffff");
  });

  it("normalizes 6-digit and 8-digit hex colors", () => {
    expect(normalizeMaskColor("#000000")).toBe("ff000000");
    expect(normalizeMaskColor("#ffffff")).toBe("ffffffff");
    expect(normalizeMaskColor("#ff0000")).toBe("ffff0000");
    expect(normalizeMaskColor("#00ff0080")).toBe("8000ff00");
    expect(normalizeMaskColor("#12345678")).toBe("78123456");
  });

  it("normalizes transparent to 00000000", () => {
    expect(normalizeMaskColor("transparent")).toBe("00000000");
    expect(normalizeMaskColor("rgba(0, 0, 0, 0)")).toBe("00000000");
  });

  it("normalizes the maintainer test colors to exact expected ARGB hex strings", () => {
    // Exact colors requested by maintainer:
    expect(normalizeMaskColor("red")).toBe("ffff0000");
    expect(normalizeMaskColor("#00F")).toBe("ff0000ff");
    expect(normalizeMaskColor("#00800080")).toBe("80008000");
    expect(normalizeMaskColor("rgba(255, 165, 0, 0.5)")).toBe("80ffa500");
    // Explicitly verify orange (255, 165, 0) is not incorrectly converted to red (0x7fff0000)
    expect(normalizeMaskColor("rgba(255, 165, 0, 0.5)")).not.toBe("7fff0000");
    expect(normalizeMaskColor("rgba(255, 165, 0, 0.5)")).not.toBe("80ff0000");
    expect(normalizeMaskColor("transparent")).toBe("00000000");
    expect(normalizeMaskColor("#000000")).toBe("ff000000");
  });

  it("normalizes rgb and rgba colors", () => {
    expect(normalizeMaskColor("rgb(255, 0, 0)")).toBe("ffff0000");
    expect(normalizeMaskColor("rgb(0, 255, 0)")).toBe("ff00ff00");
    expect(normalizeMaskColor("rgb(0, 0, 255)")).toBe("ff0000ff");
    // 0.5 alpha produces 0x7f or 0x80
    const rgbaHex = normalizeMaskColor("rgba(255, 0, 0, 0.5)");
    expect(rgbaHex).toMatch(/^(7f|80)ff0000$/);
  });

  it("falls back to black on invalid color strings", () => {
    expect(normalizeMaskColor("invalid-color-not-real")).toBe("ff000000");
    expect(normalizeMaskColor("")).toBe("ff000000");
    expect(normalizeMaskColor("#invalid")).toBe("ff000000");
  });
});
