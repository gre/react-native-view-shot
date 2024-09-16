import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
  releaseCapture: (uri: number) => void;
  captureRef: (tag: number, options: Object) => Promise<string>;
  captureScreen: (options: Object) => Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>("RNViewShot");
