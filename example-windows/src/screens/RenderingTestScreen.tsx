import React, {useEffect, useRef} from "react";
import {View, Text, StyleSheet, SafeAreaView, ScrollView} from "react-native";
import ViewShot from "react-native-view-shot";
import {CaptureButton} from "../components/shared/CaptureButton";
import {PreviewContainer} from "../components/shared/PreviewContainer";
import {useViewShotCapture} from "../components/shared/hooks/useViewShotCapture";

const CARD_WIDTH = 640;
const CELL_GAP = 8;
const CELL_HEIGHT = 160;
const CARD_ROWS = 5;
const CARD_HEIGHT =
  CELL_HEIGHT * CARD_ROWS + CELL_GAP * CARD_ROWS + CELL_GAP * 2;

interface CellProps {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}

const Cell: React.FC<CellProps> = ({label, wide, children}) => (
  <View style={[styles.cell, wide && styles.cellWide]}>
    <Text style={styles.cellLabel}>{label}</Text>
    {children}
  </View>
);

const PaddingBackgroundCell: React.FC = () => (
  <Cell label="padding + bg + border">
    <View style={styles.paddedBox}>
      <View style={styles.paddedBoxInner} />
    </View>
  </Cell>
);

const OverflowCell: React.FC = () => (
  <Cell label="borderRadius + overflow:hidden">
    <View style={styles.overflowBox}>
      <View style={styles.overflowBoxOversized} />
    </View>
  </Cell>
);

const TransformsRow: React.FC = () => (
  <Cell wide label="transforms (rotate / scale / skew / 3D / combo)">
    <View style={styles.transformRow}>
      <View
        style={[
          styles.transformBox,
          {backgroundColor: "#FF6B6B", transform: [{rotate: "30deg"}]},
        ]}
      />
      <View
        style={[
          styles.transformBox,
          {
            backgroundColor: "#4ECDC4",
            transform: [{scaleX: 1.4}, {scaleY: 0.6}],
          },
        ]}
      />
      <View
        style={[
          styles.transformBox,
          {backgroundColor: "#45B7D1", transform: [{skewX: "20deg"}]},
        ]}
      />
      <View
        style={[
          styles.transformBox,
          {
            backgroundColor: "#F1C40F",
            transform: [{perspective: 300}, {rotateX: "45deg"}],
          },
        ]}
      />
      <View
        style={[
          styles.transformBox,
          {
            backgroundColor: "#9B59B6",
            transform: [{translateX: 4}, {rotate: "15deg"}, {scale: 0.85}],
          },
        ]}
      />
    </View>
  </Cell>
);

const NestedOpacityCell: React.FC = () => (
  <Cell label="nested opacity (parent 0.5)">
    <View style={styles.opacityParent}>
      <View
        style={[
          styles.opacityChild,
          {backgroundColor: "#E74C3C", left: 8, top: 8},
        ]}
      />
      <View
        style={[
          styles.opacityChild,
          {backgroundColor: "#3498DB", left: 32, top: 16},
        ]}
      />
    </View>
  </Cell>
);

const ZIndexCell: React.FC = () => (
  <Cell label="z-index (first child on top)">
    <View style={styles.zIndexParent}>
      <View
        style={[
          styles.zIndexChild,
          {backgroundColor: "#E74C3C", left: 0, zIndex: 3},
        ]}
      />
      <View
        style={[
          styles.zIndexChild,
          {backgroundColor: "#27AE60", left: 24, zIndex: 2},
        ]}
      />
      <View
        style={[
          styles.zIndexChild,
          {backgroundColor: "#3498DB", left: 48, zIndex: 1},
        ]}
      />
    </View>
  </Cell>
);

const ScrolledCell: React.FC = () => {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({y: 60, animated: false});
    }, 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <Cell wide label="scrolled ScrollView (y = 60)">
      <ScrollView
        ref={scrollRef}
        style={styles.scrolledViewport}
        scrollEnabled={false}
      >
        <View style={[styles.scrolledBand, {backgroundColor: "#E74C3C"}]}>
          <Text style={styles.scrolledBandText}>top (y=0)</Text>
        </View>
        <View style={[styles.scrolledBand, {backgroundColor: "#F1C40F"}]}>
          <Text style={styles.scrolledBandText}>middle (y=60)</Text>
        </View>
        <View style={[styles.scrolledBand, {backgroundColor: "#27AE60"}]}>
          <Text style={styles.scrolledBandText}>bottom (y=120)</Text>
        </View>
      </ScrollView>
    </Cell>
  );
};

const SkiaCell: React.FC = () => (
  <Cell wide label="Skia (not available on Windows)">
    <View style={styles.skiaPlaceholder}>
      <Text style={styles.skiaPlaceholderText}>
        @shopify/react-native-skia has no Windows support
      </Text>
    </View>
  </Cell>
);

const RenderingTestScreen: React.FC = () => {
  const {capturedUri, isCapturing, viewShotRef, startCapture} =
    useViewShotCapture("Rendering captured");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} testID="renderingTestScrollView">
        <View style={styles.intro}>
          <Text style={styles.introTitle}>🧪 Rendering correctness</Text>
          <Text style={styles.introBody}>
            Single capture exercising transforms, nested opacity, z-index,
            scroll clip, padding/background, overflow:hidden, and a Skia
            comparator. Compare iOS (ground truth) vs Android.
          </Text>
        </View>

        <View style={styles.captureWrapper}>
          <ViewShot ref={viewShotRef} style={styles.card}>
            <View style={styles.row}>
              <PaddingBackgroundCell />
              <OverflowCell />
            </View>
            <TransformsRow />
            <View style={styles.row}>
              <NestedOpacityCell />
              <ZIndexCell />
            </View>
            <ScrolledCell />
            <SkiaCell />
          </ViewShot>
        </View>

        <View style={styles.controls}>
          <CaptureButton
            onPress={() => startCapture({format: "png", quality: 1})}
            isCapturing={isCapturing}
            captureText="📸 Capture test card"
          />
          {capturedUri && (
            <PreviewContainer
              capturedUri={capturedUri}
              title="✅ Rendering Captured:"
              imageWidth={CARD_WIDTH}
              imageHeight={CARD_HEIGHT}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#F2F2F7"},
  scroll: {flex: 1},
  intro: {
    margin: 16,
    padding: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#1976D2",
  },
  introTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D47A1",
    marginBottom: 4,
  },
  introBody: {fontSize: 12, color: "#1565C0", lineHeight: 17},
  captureWrapper: {alignItems: "center", paddingVertical: 16},
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    padding: CELL_GAP,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  row: {flexDirection: "row", gap: CELL_GAP, marginBottom: CELL_GAP},
  cell: {
    flex: 1,
    height: CELL_HEIGHT,
    backgroundColor: "#FAFAFA",
    borderRadius: 6,
    padding: 6,
  },
  cellWide: {width: "100%", flex: 0, marginBottom: CELL_GAP},
  cellLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
  },

  paddedBox: {
    flex: 1,
    backgroundColor: "#FFE4E1",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#A52A2A",
    padding: 10,
  },
  paddedBoxInner: {flex: 1, backgroundColor: "#A52A2A", borderRadius: 4},

  overflowBox: {
    width: 120,
    height: 70,
    borderRadius: 24,
    overflow: "hidden",
    alignSelf: "center",
  },
  overflowBoxOversized: {
    width: 200,
    height: 120,
    backgroundColor: "#FF7F50",
    marginLeft: -40,
    marginTop: -25,
  },

  transformRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  transformBox: {width: 32, height: 32, borderRadius: 4},

  opacityParent: {
    flex: 1,
    opacity: 0.5,
    backgroundColor: "#ECF0F1",
    borderRadius: 4,
  },
  opacityChild: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 4,
  },

  zIndexParent: {
    flex: 1,
    backgroundColor: "#ECF0F1",
    borderRadius: 4,
    paddingTop: 16,
  },
  zIndexChild: {
    position: "absolute",
    top: 16,
    width: 56,
    height: 56,
    borderRadius: 4,
  },

  scrolledViewport: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: "#ECF0F1",
    padding: 8,
  },
  scrolledBand: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  scrolledBandText: {color: "#FFF", fontWeight: "700", fontSize: 12},

  skiaPlaceholder: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: "#ECF0F1",
    borderWidth: 1,
    borderColor: "#BDC3C7",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  skiaPlaceholderText: {
    fontSize: 11,
    color: "#7F8C8D",
    textAlign: "center",
    fontStyle: "italic",
  },

  controls: {padding: 16},
});

export default RenderingTestScreen;
