import type {TurboModule} from "react-native";
import {TurboModuleRegistry, NativeModules} from "react-native";
import {Int32, WithDefault} from "react-native/Libraries/Types/CodegenTypes";

// Options stay `Object` (codegen → ReadableMap / NSDictionary).
// Narrowing here would force a coordinated change to both native module
// signatures.
export interface Spec extends TurboModule {
  releaseCapture: (uri: string) => void;
  captureRef: (
    target: WithDefault<number, -1>,
    withOptions: Object,
  ) => Promise<string>;
  captureScreen: (options: Object) => Promise<string>;
}

const isTurboModuleEnabled =
  (global as {__turboModuleProxy?: unknown}).__turboModuleProxy != null;

const RNViewShotModule = isTurboModuleEnabled
  ? TurboModuleRegistry.getEnforcing<Spec>("RNViewShot")
  : NativeModules.RNViewShot;

export default RNViewShotModule as Spec;
