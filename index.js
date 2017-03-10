//@flow
import { NativeModules, findNodeHandle } from "react-native";
const { RNViewShot } = NativeModules;

export const dirs = {
  // cross platform
  CacheDir: RNViewShot.CacheDir,
  DocumentDir: RNViewShot.DocumentDir,
  MainBundleDir: RNViewShot.MainBundleDir,
  MovieDir: RNViewShot.MovieDir,
  MusicDir: RNViewShot.MusicDir,
  PictureDir: RNViewShot.PictureDir,
  // only Android
  DCIMDir: RNViewShot.DCIMDir,
  DownloadDir: RNViewShot.DownloadDir,
  RingtoneDir: RNViewShot.RingtoneDir,
  SDCardDir: RNViewShot.SDCardDir,
};

export function takeSnapshot(
  view: number | ReactElement<any>,
  options?: {
    width?: number,
    height?: number,
    path?: string,
    format?: "png" | "jpg" | "jpeg" | "webm",
    quality?: number,
    result?: "file" | "base64" | "data-uri",
    snapshotContentContainer?: bool
  } = {}
): Promise<string> {
  if (typeof view !== "number") {
    const node = findNodeHandle(view);
    if (!node) return Promise.reject(new Error("findNodeHandle failed to resolve view="+String(view)));
    view = node;
  }
  return RNViewShot.takeSnapshot(view, options);
}

export default { takeSnapshot, dirs };
