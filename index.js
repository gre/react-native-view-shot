//@flow

import { NativeModules, findNodeHandle } from "react-native";

const { RNViewShot } = NativeModules;

export function takeSnapshot(
  view: number | ReactElement<any>,
  options ?: {
    width ?: number;
    height ?: number;
    format ?: "png" | "jpg" | "jpeg" | "webm";
    quality ?: number;
    base64 ?: bool;
    name ?: string;
  }
): Promise<string> {
  if (typeof view !== "number") {
    view = findNodeHandle(view);
  }
  return RNViewShot.takeSnapshot(view, options);
}

export default { takeSnapshot };
