import type {TurboModule} from "react-native";
import {TurboModuleRegistry, NativeModules, Platform} from "react-native";
import {Int32, WithDefault} from "react-native/Libraries/Types/CodegenTypes";

export interface Spec extends TurboModule {
  releaseCapture: (uri: string) => void;
  captureRef: (
    target: WithDefault<number, -1>,
    withOptions: Object,
  ) => Promise<string>;
  captureScreen: (options: Object) => Promise<string>;
}

// Support both old and new architecture
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const RNViewShotModule = isTurboModuleEnabled
  ? TurboModuleRegistry.getEnforcing<Spec>("RNViewShot")
  : NativeModules.RNViewShot;

export default RNViewShotModule as Spec;
