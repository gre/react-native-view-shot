import type {TurboModule} from "react-native";
import {TurboModuleRegistry, NativeModules} from "react-native";
import {Int32, WithDefault} from "react-native/Libraries/Types/CodegenTypes";

export interface Spec extends TurboModule {
  releaseCapture: (uri: string) => void;
  /**
   * `withOptions` is a `CaptureOptions` (see ../index.tsx). Typed as `Object` here
   * because RN codegen turns it into a native `ReadableMap` / `NSDictionary`, and
   * narrowing it to a TS interface would require regenerating both the iOS and
   * Android native module signatures (a coordinated breaking change). The JS layer
   * applies defaults and validation via `validateOptions` before this call, so the
   * native side always receives a fully-populated options dictionary.
   */
  captureRef: (
    target: WithDefault<number, -1>,
    withOptions: Object,
  ) => Promise<string>;
  /** See `captureRef` above for why `options` is typed as `Object`. */
  captureScreen: (options: Object) => Promise<string>;
}

// Old vs new architecture detection. `__turboModuleProxy` is set by the RN
// runtime when bridgeless / TurboModules are active. Falling back to
// `NativeModules.RNViewShot` keeps the old paper bridge working.
const isTurboModuleEnabled =
  (global as {__turboModuleProxy?: unknown}).__turboModuleProxy != null;

const RNViewShotModule = isTurboModuleEnabled
  ? TurboModuleRegistry.getEnforcing<Spec>("RNViewShot")
  : NativeModules.RNViewShot;

export default RNViewShotModule as Spec;
