import React, {
  ReactNode,
  RefObject,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
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

const acceptedFormats = ["png", "jpg"].concat(
  Platform.OS === "android" ? ["webm", "raw"] : [],
);

const acceptedResults = ["tmpfile", "base64", "data-uri"].concat(
  Platform.OS === "android" ? ["zip-base64"] : [],
);

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

/**
 * Ref handle exposed by ViewShot component.
 */
export type ViewShotRef = {
  capture: () => Promise<string>;
};

const ViewShotComponent = forwardRef<ViewShotRef, ViewShotProperties>(
  function ViewShot(props, ref) {
    const {
      children,
      options,
      captureMode,
      onCapture,
      onCaptureFailure,
      onLayout,
      style,
    } = props;

    const rootRef = useRef<View>(null);
    const rafRef = useRef<number | null>(null);
    const lastCapturedURIRef = useRef<string | null>(null);
    const resolveFirstLayoutRef = useRef<((layout: any) => void) | null>(null);

    const firstLayoutPromise = useMemo(
      () =>
        new Promise<any>(resolve => {
          resolveFirstLayoutRef.current = resolve;
        }),
      [],
    );

    // Keep latest props in refs so stable callbacks always see fresh values
    const onCaptureRef = useRef(onCapture);
    onCaptureRef.current = onCapture;
    const onCaptureFailureRef = useRef(onCaptureFailure);
    onCaptureFailureRef.current = onCaptureFailure;
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const capture = useCallback(
      (): Promise<string> =>
        firstLayoutPromise
          .then(() => {
            if (!rootRef.current) return neverEndingPromise as Promise<never>;
            return captureRef(rootRef.current, optionsRef.current);
          })
          .then(
            uri => {
              if (!rootRef.current) return uri;
              if (lastCapturedURIRef.current) {
                setTimeout(releaseCapture, 500, lastCapturedURIRef.current);
              }
              lastCapturedURIRef.current = uri;
              if (onCaptureRef.current) onCaptureRef.current(uri);
              return uri;
            },
            e => {
              if (!rootRef.current) throw e;
              if (onCaptureFailureRef.current) onCaptureFailureRef.current(e);
              throw e;
            },
          ) as Promise<string>,
      [firstLayoutPromise],
    );

    useImperativeHandle(ref, () => ({capture}), [capture]);

    const syncCaptureLoop = useCallback(
      (mode: string | null | undefined): void => {
        cancelAnimationFrame(rafRef.current as number);
        if (mode === "continuous") {
          let previousCaptureURI: string | null = "-";
          const loop = (): void => {
            rafRef.current = requestAnimationFrame(loop);
            if (previousCaptureURI === lastCapturedURIRef.current) return;
            previousCaptureURI = lastCapturedURIRef.current;
            capture();
          };
          rafRef.current = requestAnimationFrame(loop);
        }
      },
      [capture],
    );

    // Mount + unmount lifecycle (equivalent to componentDidMount / componentWillUnmount)
    useEffect(() => {
      if (__DEV__) checkCompatibleProps(props);
      if (captureMode === "mount") {
        capture();
      } else {
        syncCaptureLoop(captureMode);
      }
      return () => syncCaptureLoop(null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update lifecycle (equivalent to componentDidUpdate)
    const prevCaptureModeRef = useRef(captureMode);
    const isFirstRender = useRef(true);
    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        prevCaptureModeRef.current = captureMode;
        return;
      }
      if (
        captureMode !== undefined &&
        captureMode !== prevCaptureModeRef.current
      ) {
        syncCaptureLoop(captureMode);
      }
      prevCaptureModeRef.current = captureMode;
      if (captureMode === "update") {
        capture();
      }
    });

    const onLayoutHandler = useCallback(
      (e: LayoutChangeEvent): void => {
        if (resolveFirstLayoutRef.current) {
          resolveFirstLayoutRef.current(e.nativeEvent.layout);
          resolveFirstLayoutRef.current = null;
        }
        if (onLayout) onLayout(e);
      },
      [onLayout],
    );

    return (
      <View
        ref={rootRef}
        collapsable={false}
        onLayout={onLayoutHandler}
        style={style}
      >
        {children}
      </View>
    );
  },
);

// Attach static methods for backwards compatibility (ViewShot.captureRef, ViewShot.releaseCapture)
const ViewShot = ViewShotComponent as typeof ViewShotComponent & {
  captureRef: typeof captureRef;
  releaseCapture: typeof releaseCapture;
};
ViewShot.captureRef = captureRef;
ViewShot.releaseCapture = releaseCapture;

export default ViewShot;
