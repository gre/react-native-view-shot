import React from "react";
import renderer, {act} from "react-test-renderer";

// Mock RNViewShot before importing ViewShot
const mockCaptureRef = jest.fn().mockResolvedValue("/tmp/captured.png");
const mockReleaseCapture = jest.fn();
jest.mock("../RNViewShot", () => ({
  __esModule: true,
  default: {
    captureRef: mockCaptureRef,
    captureScreen: jest.fn(),
    releaseCapture: mockReleaseCapture,
  },
}));

import ViewShot from "../index";

describe("ViewShot component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with collapsable={false} and onLayout", async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ViewShot>
          <span>Hello</span>
        </ViewShot>,
      );
    });
    const json = tree!.toJSON() as any;
    expect(json).toBeTruthy();
    expect(json.props.collapsable).toBe(false);
    expect(json.props.onLayout).toBeDefined();
    await act(async () => tree!.unmount());
  });

  it("passes style prop to the outer View", async () => {
    const style = {flex: 1, backgroundColor: "red"};
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ViewShot style={style} />);
    });
    const json = tree!.toJSON() as any;
    expect(json.props.style).toEqual(style);
    await act(async () => tree!.unmount());
  });

  it("warns when captureMode is set without onCapture", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ViewShot captureMode="mount" />);
    });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("onCapture prop callback is missing"),
    );
    warnSpy.mockRestore();
    await act(async () => tree!.unmount());
  });

  it("warns when continuous mode uses non-tmpfile result", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ViewShot
          captureMode="continuous"
          onCapture={jest.fn()}
          options={{result: "base64"}}
        />,
      );
    });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("result=tmpfile is recommended"),
    );
    warnSpy.mockRestore();
    await act(async () => tree!.unmount());
  });

  it("warns when update mode uses non-tmpfile result", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ViewShot
          captureMode="update"
          onCapture={jest.fn()}
          options={{result: "data-uri"}}
        />,
      );
    });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("result=tmpfile is recommended"),
    );
    warnSpy.mockRestore();
    await act(async () => tree!.unmount());
  });

  it("does not warn when captureMode is undefined with onCapture", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ViewShot onCapture={jest.fn()} />);
    });
    const viewShotWarnings = warnSpy.mock.calls.filter(
      call =>
        typeof call[0] === "string" &&
        call[0].includes("react-native-view-shot"),
    );
    expect(viewShotWarnings).toHaveLength(0);
    warnSpy.mockRestore();
    await act(async () => tree!.unmount());
  });

  it("does not warn for valid continuous + onCapture + tmpfile", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ViewShot
          captureMode="continuous"
          onCapture={jest.fn()}
          options={{result: "tmpfile"}}
        />,
      );
    });
    const viewShotWarnings = warnSpy.mock.calls.filter(
      call =>
        typeof call[0] === "string" &&
        call[0].includes("react-native-view-shot"),
    );
    expect(viewShotWarnings).toHaveLength(0);
    warnSpy.mockRestore();
    await act(async () => tree!.unmount());
  });

  it("static captureRef and releaseCapture are exposed", () => {
    expect(typeof ViewShot.captureRef).toBe("function");
    expect(typeof ViewShot.releaseCapture).toBe("function");
  });

  it("starts requestAnimationFrame loop for continuous mode", async () => {
    const rafSpy = jest.spyOn(global, "requestAnimationFrame");
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ViewShot captureMode="continuous" onCapture={jest.fn()} />,
      );
    });
    expect(rafSpy).toHaveBeenCalled();
    await act(async () => tree!.unmount());
    rafSpy.mockRestore();
  });

  it("cancels animation frame on unmount", async () => {
    const cancelSpy = jest.spyOn(global, "cancelAnimationFrame");
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ViewShot captureMode="continuous" onCapture={jest.fn()} />,
      );
    });
    await act(async () => tree!.unmount());
    expect(cancelSpy).toHaveBeenCalled();
    cancelSpy.mockRestore();
  });

  it("capture() waits for first layout before calling captureRef", async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ViewShot captureMode="mount" onCapture={jest.fn()} />,
      );
    });
    // captureRef not called yet — firstLayoutPromise not resolved
    expect(mockCaptureRef).not.toHaveBeenCalled();
    await act(async () => tree!.unmount());
  });

  it("re-syncs capture loop when captureMode changes", async () => {
    const rafSpy = jest.spyOn(global, "requestAnimationFrame");
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ViewShot onCapture={jest.fn()} />);
    });
    rafSpy.mockClear();

    await act(async () => {
      tree!.update(<ViewShot captureMode="continuous" onCapture={jest.fn()} />);
    });
    expect(rafSpy).toHaveBeenCalled();
    await act(async () => tree!.unmount());
    rafSpy.mockRestore();
  });

  it("captures on update when captureMode is 'update'", async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ViewShot captureMode="update" onCapture={jest.fn()} />,
      );
    });

    // Trigger layout to resolve firstLayoutPromise
    const json = tree!.toJSON() as any;
    await act(async () => {
      json.props.onLayout({
        nativeEvent: {layout: {x: 0, y: 0, width: 100, height: 100}},
      });
    });

    mockCaptureRef.mockClear();

    // Trigger componentDidUpdate
    await act(async () => {
      tree!.update(
        <ViewShot
          captureMode="update"
          onCapture={jest.fn()}
          options={{quality: 0.5}}
        />,
      );
    });

    // Flush microtask + macrotask queue for capture() promise chain
    await new Promise(r => setTimeout(r, 50));

    expect(mockCaptureRef).toHaveBeenCalled();
    await act(async () => tree!.unmount());
  });

  it("calls onCapture callback on successful capture", async () => {
    const onCapture = jest.fn();
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <ViewShot captureMode="update" onCapture={onCapture} />,
      );
    });

    // Trigger layout
    const json = tree!.toJSON() as any;
    await act(async () => {
      json.props.onLayout({
        nativeEvent: {layout: {x: 0, y: 0, width: 100, height: 100}},
      });
    });

    // Trigger update
    await act(async () => {
      tree!.update(
        <ViewShot
          captureMode="update"
          onCapture={onCapture}
          options={{quality: 0.8}}
        />,
      );
    });

    await new Promise(r => setTimeout(r, 50));

    expect(onCapture).toHaveBeenCalledWith("/tmp/captured.png");
    await act(async () => tree!.unmount());
  });

  it("forwards onLayout to props.onLayout", async () => {
    const onLayout = jest.fn();
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ViewShot onLayout={onLayout} />);
    });

    const json = tree!.toJSON() as any;
    const event = {
      nativeEvent: {layout: {x: 0, y: 0, width: 200, height: 300}},
    };
    await act(async () => {
      json.props.onLayout(event);
    });

    expect(onLayout).toHaveBeenCalledWith(event);
    await act(async () => tree!.unmount());
  });
});
