import React from "react";
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

import {MaskView} from "../index";

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

  it("sets default nativeID with black maskColor (#000000)", async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MaskView>
          <span>Secret</span>
        </MaskView>,
      );
    });

    const json = tree!.toJSON() as any;
    expect(json.props.nativeID).toBe("rn-view-shot-mask:#000000");
    await act(async () => tree!.unmount());
  });

  it("sets nativeID with custom maskColor", async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MaskView maskColor="#FF5500">
          <span>Secret</span>
        </MaskView>,
      );
    });

    const json = tree!.toJSON() as any;
    expect(json.props.nativeID).toBe("rn-view-shot-mask:#FF5500");
    await act(async () => tree!.unmount());
  });

  it("supports 8-digit hex colors with alpha", async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MaskView maskColor="#80FF5500">
          <span>Secret</span>
        </MaskView>,
      );
    });

    const json = tree!.toJSON() as any;
    expect(json.props.nativeID).toBe("rn-view-shot-mask:#80FF5500");
    await act(async () => tree!.unmount());
  });

  it("passes standard View props through to the underlying View", async () => {
    const style = {width: 100, height: 100, backgroundColor: "red"};
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <MaskView style={style} testID="test-mask" pointerEvents="box-none">
          <span>Inside</span>
        </MaskView>,
      );
    });

    const json = tree!.toJSON() as any;
    expect(json.props.style).toEqual(style);
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
    expect(json.props.nativeID).toBe("rn-view-shot-mask:#000000");
    await act(async () => tree!.unmount());
  });

  it("supports 3-digit hex and named colors", async () => {
    let tree1: renderer.ReactTestRenderer;
    let tree2: renderer.ReactTestRenderer;
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
    });

    const json1 = tree1!.toJSON() as any;
    const json2 = tree2!.toJSON() as any;
    expect(json1.props.nativeID).toBe("rn-view-shot-mask:#F00");
    expect(json2.props.nativeID).toBe("rn-view-shot-mask:white");
    await act(async () => {
      tree1!.unmount();
      tree2!.unmount();
    });
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
