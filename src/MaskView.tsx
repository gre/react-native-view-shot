import React, {forwardRef, type ReactNode} from "react";
import {
  View,
  type ViewProps,
  type StyleProp,
  type ViewStyle,
  type ColorValue,
  Platform,
  processColor,
} from "react-native";

export interface MaskViewProps extends Omit<ViewProps, "nativeID"> {
  /**
   * The color of the solid rectangle rendered over the view in snapshots.
   * Accepts any standard React Native color (hex, rgb, rgba, hsl, named color, etc.).
   * Defaults to "#000000" (fully opaque black).
   *
   * SECURITY NOTE: If a color with an alpha channel below 255 is provided (e.g. "transparent",
   * "rgba(..., alpha < 1)", or 8-digit hex with alpha < 0xFF), underlying content will remain
   * partially or completely visible in screenshots. For guaranteed redaction, use an opaque color.
   */
  maskColor?: ColorValue | string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export const MASK_NATIVE_ID_PREFIX = "rn-view-shot-mask";

let hasWarnedWebOrWindows = false;

/**
 * Normalizes a React Native ColorValue into an 8-character hex string representing AARRGGBB.
 * Returns "ff000000" (opaque black) on fallback or invalid input.
 */
export function normalizeMaskColor(color?: ColorValue | string): string {
  if (color === undefined || color === null) {
    return "ff000000";
  }
  const processed = processColor(color as any);
  if (typeof processed !== "number") {
    return "ff000000";
  }
  // Convert 32-bit signed/unsigned integer to 8-character AARRGGBB hex
  return (processed >>> 0).toString(16).padStart(8, "0");
}

export type MaskViewRef = React.ComponentRef<typeof View>;

const MaskViewComponent = forwardRef<MaskViewRef, MaskViewProps>(
  function MaskView({maskColor = "#000000", style, children, ...rest}, ref) {
    if (
      __DEV__ &&
      !hasWarnedWebOrWindows &&
      (Platform.OS === "web" || Platform.OS === "windows")
    ) {
      hasWarnedWebOrWindows = true;
      console.warn(
        `[react-native-view-shot] MaskView is not supported on ${Platform.OS}. Content inside MaskView will not be masked in snapshots.`,
      );
    }

    const hexColor = normalizeMaskColor(maskColor);

    return (
      <View
        {...rest}
        ref={ref}
        collapsable={false}
        nativeID={`${MASK_NATIVE_ID_PREFIX}:${hexColor}`}
        style={[{overflow: "hidden"}, style, {overflow: "hidden"}]}
      >
        {children}
      </View>
    );
  },
);

export const MaskView = MaskViewComponent as (
  props: MaskViewProps & {ref?: React.Ref<MaskViewRef>},
) => React.ReactElement | null;

export default MaskView;
