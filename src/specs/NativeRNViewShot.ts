import type {TurboModule} from "react-native";
import {TurboModuleRegistry} from "react-native";
import {WithDefault} from "react-native/Libraries/Types/CodegenTypes";

export interface Spec extends TurboModule {
  releaseCapture: (uri: string) => void;
  captureRef: (
    target: WithDefault<number, -1>,
    withOptions: Object,
  ) => Promise<string>;
  captureScreen: (options: Object) => Promise<string>;
}

export default TurboModuleRegistry.get<Spec>("RNViewShot");
