import React, {Component, ReactNode, RefObject} from "react";
import {
  View,
  Platform,
  findNodeHandle,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
} from "react-native";
import RNViewShot from "./RNViewShot";

// Global type for React Native's __DEV__ variable
declare const __DEV__: boolean;

const neverEndingPromise = new Promise(() => {});

// Options for capture configuration

export interface CaptureOptions {
  /**
   * (Android only) the file name of the file. Must be at least 3 characters long.
   */
  fileName?: string;
  /**
   * the width and height of the final image (resized from the View bound. don't provide it if you want
   * the original pixel size).
   */
  width?: number;
  /**
   * @see {CaptureOptions#width}
   */
  height?: number;
  /**
   * either png or jpg or webm (Android). Defaults to png. raw is a ARGB array of image pixels.
   */
  format?: "jpg" | "png" | "webm" | "raw";
  /**
   * the quality. 0.0 - 1.0 (default). (only available on lossy formats like jpg)
   */
  quality?: number;
  /**
   * the method you want to use to save the snapshot, one of:
   * - tmpfile (default): save to a temporary file (that will only exist for as long as the app is running).
   * - base64: encode as base64 and returns the raw string. Use only with small images as this may result of
   *   lags (the string is sent over the bridge). N.B. This is not a data uri, use data-uri instead.
   * - data-uri: same as base64 but also includes the Data URI scheme header.
   * - zip-base64: compress data with zip deflate algorithm and than convert to base64 and return as a raw string.
   */
  result?: "tmpfile" | "base64" | "data-uri" | "zip-base64";
  /**
   * if true and when view is a ScrollView, the "content container" height will be evaluated instead of the
   * container height.
   */
  snapshotContentContainer?: boolean;
  /**
   * if true and when view is a SurfaceView or have it in the view tree, view will be captured.
   * False by default, because it can have significant performance impact
   */
  handleGLSurfaceViewOnAndroid?: boolean;
  /**
   * (iOS only) change the iOS snapshot strategy to use method renderInContext instead of drawViewHierarchyInRect
   * which may help for some use cases.
   */
  useRenderInContext?: boolean;
}

export interface ViewShotProperties {
  options?: CaptureOptions;
  /**
   * - if not defined (default). the capture is not automatic and you need to use the ref and call capture()
   *   yourself.
   * - "mount". Capture the view once at mount. (It is important to understand image loading won't be waited, in
   *   such case you want to use "none" with viewShotRef.capture() after Image#onLoad.)
   * - "continuous" EXPERIMENTAL, this will capture A LOT of images continuously. For very specific use-cases.
   * - "update" EXPERIMENTAL, this will capture images each time React redraw (on did update). For very specific
   *   use-cases.
   */
  captureMode?: "mount" | "continuous" | "update";
  /**
   * children of ViewShot component
   */
  children?: ReactNode;
  /**
   * when a captureMode is defined, this callback will be called with the capture result.
   */
  onCapture?(uri: string): void;
  /**
   * when a captureMode is defined, this callback will be called when a capture fails.
   */
  onCaptureFailure?(error: Error): void;
  /**
   * Invoked on mount and layout changes
   */
  onLayout?(event: LayoutChangeEvent): void;
  /**
   * style prop as StyleProp<ViewStyle>
   */
  style?: StyleProp<ViewStyle>;
}

const defaultOptions: CaptureOptions = {
  format: "png",
  quality: 1,
  result: "tmpfile",
  snapshotContentContainer: false,
  handleGLSurfaceViewOnAndroid: false,
};

// validate and coerce options
function validateOptions(input?: CaptureOptions): {
  options: CaptureOptions;
  errors: string[];
} {
  const acceptedFormats = ["png", "jpg"].concat(
    Platform.OS === "android" ? ["webm", "raw"] : [],
  );
  const acceptedResults = ["tmpfile", "base64", "data-uri"].concat(
    Platform.OS === "android" ? ["zip-base64"] : [],
  );
  const options: CaptureOptions = {
    ...defaultOptions,
    ...input,
  };
  const errors: string[] = [];
  if (
    "width" in options &&
    (typeof options.width !== "number" || options.width <= 0)
  ) {
    errors.push("option width should be a positive number");
    delete options.width;
  }
  if (
    "height" in options &&
    (typeof options.height !== "number" || options.height <= 0)
  ) {
    errors.push("option height should be a positive number");
    delete options.height;
  }
  if (
    typeof options.quality !== "number" ||
    options.quality < 0 ||
    options.quality > 1
  ) {
    errors.push("option quality should be a number between 0.0 and 1.0");
    options.quality = defaultOptions.quality;
  }
  if (typeof options.snapshotContentContainer !== "boolean") {
    errors.push("option snapshotContentContainer should be a boolean");
  }
  if (typeof options.handleGLSurfaceViewOnAndroid !== "boolean") {
    errors.push("option handleGLSurfaceViewOnAndroid should be a boolean");
  }
  if (acceptedFormats.indexOf(options.format || "") === -1) {
    options.format = defaultOptions.format;
    errors.push(
      "option format '" +
        options.format +
        "' is not in valid formats: " +
        acceptedFormats.join(" | "),
    );
  }
  if (acceptedResults.indexOf(options.result || "") === -1) {
    options.result = defaultOptions.result;
    errors.push(
      "option result '" +
        options.result +
        "' is not in valid formats: " +
        acceptedResults.join(" | "),
    );
  }
  return {options, errors};
}

export function captureRef<T = any>(
  view: number | React.ReactInstance | RefObject<T> | null,
  optionsObject?: CaptureOptions,
): Promise<string> {
  if (!RNViewShot) {
    console.warn(
      "react-native-view-shot: RNViewShot is undefined. Make sure the library is linked on the native side.",
    );
    throw new Error(
      "react-native-view-shot: NativeModules.RNViewShot is undefined. Make sure the library is linked on the native side.",
    );
  }
  let viewHandle: any = view;
  if (view && typeof view === "object" && "current" in view && view.current) {
    viewHandle = view.current;
    if (!viewHandle) {
      return Promise.reject(new Error("ref.current is null"));
    }
  }
  if (Platform.OS !== "web" && typeof viewHandle !== "number") {
    const node = findNodeHandle(viewHandle);
    if (!node) {
      return Promise.reject(
        new Error("findNodeHandle failed to resolve view=" + String(view)),
      );
    }
    viewHandle = node;
  }
  const {options, errors} = validateOptions(optionsObject);
  if (__DEV__ && errors.length > 0) {
    console.warn(
      "react-native-view-shot: bad options:\n" +
        errors.map(e => `- ${e}`).join("\n"),
    );
  }
  return RNViewShot.captureRef(viewHandle, options);
}

export function releaseCapture(uri: string): void {
  if (typeof uri !== "string") {
    if (__DEV__) {
      console.warn("Invalid argument to releaseCapture. Got: " + uri);
    }
  } else {
    RNViewShot.releaseCapture(uri);
  }
}

export function captureScreen(optionsObject?: CaptureOptions): Promise<string> {
  if (!RNViewShot) {
    console.warn(
      "react-native-view-shot: RNViewShot is undefined. Make sure the library is linked on the native side.",
    );
    throw new Error(
      "react-native-view-shot: NativeModules.RNViewShot is undefined. Make sure the library is linked on the native side.",
    );
  }
  const {options, errors} = validateOptions(optionsObject);
  if (__DEV__ && errors.length > 0) {
    console.warn(
      "react-native-view-shot: bad options:\n" +
        errors.map(e => `- ${e}`).join("\n"),
    );
  }
  return RNViewShot.captureScreen(options);
}

// Props for ViewShot component

function checkCompatibleProps(props: ViewShotProperties): void {
  if (!props.captureMode && props.onCapture) {
    // in that case, it's authorized if you call capture() yourself
  } else if (props.captureMode && !props.onCapture) {
    console.warn(
      "react-native-view-shot: captureMode prop is defined but onCapture prop callback is missing",
    );
  } else if (
    (props.captureMode === "continuous" || props.captureMode === "update") &&
    props.options &&
    props.options.result &&
    props.options.result !== "tmpfile"
  ) {
    console.warn(
      "react-native-view-shot: result=tmpfile is recommended for captureMode=" +
        props.captureMode,
    );
  }
}

export default class ViewShot extends Component<ViewShotProperties> {
  static captureRef = captureRef;
  static releaseCapture = releaseCapture;

  root: any = null;
  _raf: number | null = null;
  lastCapturedURI: string | null = null;

  resolveFirstLayout: ((layout: any) => void) | null = null;
  firstLayoutPromise: Promise<any> = new Promise(resolve => {
    this.resolveFirstLayout = resolve;
  });

  capture = (): Promise<string> =>
    this.firstLayoutPromise
      .then(() => {
        const {root} = this;
        if (!root) return neverEndingPromise as Promise<never>; // component is unmounted, you never want to hear back from the promise
        return captureRef(root, this.props.options);
      })
      .then(
        uri => {
          this.onCapture(uri);
          return uri;
        },
        e => {
          this.onCaptureFailure(e);
          throw e;
        },
      ) as Promise<string>;

  onCapture = (uri: string): void => {
    if (!this.root) return;
    if (this.lastCapturedURI) {
      // schedule releasing the previous capture
      setTimeout(releaseCapture, 500, this.lastCapturedURI);
    }
    this.lastCapturedURI = uri;
    const {onCapture} = this.props;
    if (onCapture) onCapture(uri);
  };

  onCaptureFailure = (e: Error): void => {
    if (!this.root) return;
    const {onCaptureFailure} = this.props;
    if (onCaptureFailure) onCaptureFailure(e);
  };

  syncCaptureLoop = (captureMode: string | null | undefined): void => {
    cancelAnimationFrame(this._raf as number);
    if (captureMode === "continuous") {
      let previousCaptureURI: string | null = "-"; // needs to capture at least once at first, so we use "-" arbitrary string
      const loop = (): void => {
        this._raf = requestAnimationFrame(loop);
        if (previousCaptureURI === this.lastCapturedURI) return; // previous capture has not finished, don't capture yet
        previousCaptureURI = this.lastCapturedURI;
        this.capture();
      };
      this._raf = requestAnimationFrame(loop);
    }
  };

  onRef = (ref: any): void => {
    this.root = ref;
  };

  onLayout = (e: LayoutChangeEvent): void => {
    const {onLayout} = this.props;
    if (this.resolveFirstLayout) {
      this.resolveFirstLayout(e.nativeEvent.layout);
    }
    if (onLayout) onLayout(e);
  };

  componentDidMount(): void {
    if (__DEV__) checkCompatibleProps(this.props);
    if (this.props.captureMode === "mount") {
      this.capture();
    } else {
      this.syncCaptureLoop(this.props.captureMode);
    }
  }

  componentDidUpdate(prevProps: ViewShotProperties): void {
    if (this.props.captureMode !== undefined) {
      if (this.props.captureMode !== prevProps.captureMode) {
        this.syncCaptureLoop(this.props.captureMode);
      }
    }
    if (this.props.captureMode === "update") {
      this.capture();
    }
  }

  componentWillUnmount(): void {
    this.syncCaptureLoop(null);
  }

  render(): ReactNode {
    const {children} = this.props;
    return (
      <View
        ref={this.onRef}
        collapsable={false}
        onLayout={this.onLayout}
        style={this.props.style}
      >
        {children}
      </View>
    );
  }
}
