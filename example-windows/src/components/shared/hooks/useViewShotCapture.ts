import {useState, useCallback, useRef, useEffect} from "react";
import {
  captureRef,
  releaseCapture,
  type CaptureOptions,
  type ViewShotRef,
} from "react-native-view-shot";

export type {CaptureOptions} from "react-native-view-shot";

export const useViewShotCapture = (successMessage?: string) => {
  const [capture, setCapture] = useState<{
    uri: string;
    temporary: boolean;
  } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const viewShotRef = useRef<ViewShotRef | null>(null);
  const requestId = useRef(0);

  useEffect(
    () => () => {
      requestId.current++;
    },
    [],
  );

  useEffect(() => {
    if (capture?.temporary) {
      return () => releaseCapture(capture.uri);
    }
  }, [capture]);

  const startCapture = useCallback(
    async (options: CaptureOptions = {}) => {
      if (!viewShotRef.current) {
        console.error("Error", "ViewShot reference not available");
        return;
      }

      const id = ++requestId.current;
      const temporary = !options.result || options.result === "tmpfile";
      setIsCapturing(true);
      setCapture(null);

      try {
        const uri = await captureRef(viewShotRef, {
          format: "png",
          quality: 0.8,
          ...options,
        });
        if (id !== requestId.current) {
          if (temporary) releaseCapture(uri);
          return;
        }
        setCapture({uri, temporary});
        setIsCapturing(false);
        console.log(successMessage || "Captured!");
      } catch (error) {
        if (id !== requestId.current) return;
        setIsCapturing(false);
        console.error(
          "Capture Failed",
          error instanceof Error ? error.message : String(error),
        );
      }
    },
    [successMessage],
  );

  const resetCapture = useCallback(() => {
    requestId.current++;
    setCapture(null);
    setIsCapturing(false);
  }, []);

  return {
    capturedUri: capture?.uri ?? null,
    isCapturing,
    viewShotRef,
    startCapture,
    resetCapture,
  };
};
