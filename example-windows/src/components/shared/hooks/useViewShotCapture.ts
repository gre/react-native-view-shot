import {useState, useCallback, useRef} from "react";
import {captureRef} from "react-native-view-shot";

export interface CaptureOptions {
  format?: "png" | "jpg" | "webm";
  quality?: number;
  result?: "tmpfile" | "base64" | "zip-base64" | "data-uri";
  handleGLSurfaceViewOnAndroid?: boolean;
}

export const useViewShotCapture = (successMessage?: string) => {
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const viewShotRef = useRef<any>(null);

  const onCapture = useCallback(
    (uri: string) => {
      setCapturedUri(uri);
      setIsCapturing(false);
      console.log(successMessage || "Captured!", `Content captured: ${uri}`);
    },
    [successMessage],
  );

  const onCaptureFailure = useCallback((error: Error) => {
    setIsCapturing(false);
    console.error("Capture Failed", `Error: ${error.message}`);
  }, []);

  const startCapture = useCallback(
    async (options: CaptureOptions = {}) => {
      if (!viewShotRef.current) {
        console.error("Error", "ViewShot reference not available");
        return;
      }

      setIsCapturing(true);
      setCapturedUri(null);

      try {
        const captureOptions = {
          format: "png" as const,
          quality: 0.8,
          ...options,
        };
        const uri = await captureRef(viewShotRef, captureOptions);
        onCapture(uri);
      } catch (error) {
        onCaptureFailure(error as Error);
      }
    },
    [onCapture, onCaptureFailure],
  );

  const resetCapture = useCallback(() => {
    setCapturedUri(null);
    setIsCapturing(false);
  }, []);

  return {
    capturedUri,
    isCapturing,
    viewShotRef,
    startCapture,
    resetCapture,
  };
};
