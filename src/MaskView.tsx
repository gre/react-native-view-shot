import React, {forwardRef, ReactNode} from "react";
import {View, ViewProps, StyleProp, ViewStyle} from "react-native";

export interface MaskViewProps extends Omit<ViewProps, "nativeID"> {
  /**
   * The color of the solid rectangle rendered over the view in snapshots.
   * Accepts any standard 6-digit or 8-digit hex color, e.g. "#000000" or "#FFFFFF".
   * Defaults to "#000000".
   */
  maskColor?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export const MASK_NATIVE_ID_PREFIX = "rn-view-shot-mask";

export type MaskViewRef = React.ComponentRef<typeof View>;

const MaskViewComponent = forwardRef<MaskViewRef, MaskViewProps>(
  function MaskView({maskColor = "#000000", style, children, ...rest}, ref) {
    return (
      <View
        {...rest}
        ref={ref}
        collapsable={false}
        nativeID={`${MASK_NATIVE_ID_PREFIX}:${maskColor}`}
        style={style}
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
