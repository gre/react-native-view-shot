import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ViewStyle,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { CaptureButton } from '../components/shared/CaptureButton';
import { PreviewContainer } from '../components/shared/PreviewContainer';
import { useViewShotCapture } from '../components/shared/hooks/useViewShotCapture';

const CARD_WIDTH = 640;
const CELL_GAP = 8;
const CELL_HEIGHT = 160;
const CARD_ROWS = 5; // 9 cells in a 2-col grid + small slack
const CARD_HEIGHT =
  CELL_HEIGHT * CARD_ROWS + CELL_GAP * CARD_ROWS + CELL_GAP * 2;

/**
 * The "source" rendered inside every cell. We use a solid colored block with
 * a couple of inner shapes so each filter has something visible to alter
 * (saturation, hue rotation, etc.). No remote image — keeps the Detox test
 * fast and deterministic.
 */
const FilterSource: React.FC = () => (
  <View style={styles.source}>
    <View style={[styles.sourceStripe, { backgroundColor: '#E74C3C' }]} />
    <View style={[styles.sourceStripe, { backgroundColor: '#F1C40F' }]} />
    <View style={[styles.sourceStripe, { backgroundColor: '#27AE60' }]} />
    <View style={[styles.sourceStripe, { backgroundColor: '#3498DB' }]} />
    <View style={styles.sourceDot} />
  </View>
);

interface FilterCellProps {
  label: string;
  filter?: ViewStyle['filter'];
}

const FilterCell: React.FC<FilterCellProps> = ({ label, filter }) => (
  <View style={styles.cell}>
    <Text style={styles.cellLabel}>{label}</Text>
    <View style={styles.cellInner}>
      <View style={filter ? { flex: 1, filter } : styles.fill}>
        <FilterSource />
      </View>
    </View>
  </View>
);

const StyleFiltersTestScreen: React.FC = () => {
  const { capturedUri, isCapturing, viewShotRef, startCapture } =
    useViewShotCapture('StyleFilters captured');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} testID="styleFiltersTestScrollView">
        <View style={styles.intro}>
          <Text style={styles.introTitle}>🎨 Style filters (#578)</Text>
          <Text style={styles.introBody}>
            RN&apos;s `filter` style prop covers brightness, contrast,
            grayscale, hueRotate, invert, saturate, sepia, blur, dropShadow. The
            capture-time gap differs by platform:
          </Text>
          <Text style={styles.introBullet}>
            • <Text style={styles.introBold}>iOS</Text>: every filter renders
            live via `CALayer.filters`. Matrix-based filters (brightness /
            contrast / grayscale / hueRotate / invert / saturate / sepia) modify
            the layer&apos;s content directly and DO appear in the capture.
            CIFilter-based effects (blur, dropShadow) are applied
            post-composition and `drawViewHierarchyInRect` /
            `UIGraphicsImageRenderer` don&apos;t see them — those are the true
            #578 gap on iOS.
          </Text>
          <Text style={styles.introBullet}>
            • <Text style={styles.introBold}>Android</Text>: RN&apos;s runtime
            only wires `brightness` (and a couple others depending on version).
            Most filters don&apos;t even render live, so the capture matches the
            live (unfiltered) result — there&apos;s no demonstrable capture gap
            here, the limitation is upstream RN.
          </Text>
        </View>

        <View style={styles.captureWrapper} testID="styleFilters-section">
          <ViewShot ref={viewShotRef} style={styles.card}>
            <View style={styles.row}>
              <FilterCell label="no filter (reference)" />
              <FilterCell
                label="brightness(1.5)"
                filter={[{ brightness: 1.5 }]}
              />
            </View>
            <View style={styles.row}>
              <FilterCell label="contrast(1.8)" filter={[{ contrast: 1.8 }]} />
              <FilterCell label="grayscale(1)" filter={[{ grayscale: 1 }]} />
            </View>
            <View style={styles.row}>
              <FilterCell
                label="hueRotate(90deg)"
                filter={[{ hueRotate: '90deg' }]}
              />
              <FilterCell label="invert(1)" filter={[{ invert: 1 }]} />
            </View>
            <View style={styles.row}>
              <FilterCell label="saturate(2)" filter={[{ saturate: 2 }]} />
              <FilterCell label="sepia(1)" filter={[{ sepia: 1 }]} />
            </View>
            <View style={styles.row}>
              <FilterCell label="blur(8)" filter={[{ blur: 8 }]} />
              <FilterCell label="(empty)" />
            </View>
          </ViewShot>
        </View>

        <View style={styles.controls}>
          <CaptureButton
            onPress={() => startCapture({ format: 'png', quality: 1 })}
            isCapturing={isCapturing}
            captureText="📸 Capture filtered card"
          />
          {capturedUri && (
            <View testID="styleFilters-preview">
              <PreviewContainer
                capturedUri={capturedUri}
                title="✅ Style Filters Captured:"
                noteText="iOS: blur/dropShadow are missing (true gap). Android: most filters never rendered live, so capture matches live."
                imageWidth={CARD_WIDTH}
                imageHeight={CARD_HEIGHT}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { flex: 1 },
  intro: {
    margin: 16,
    padding: 12,
    backgroundColor: '#FDECEA',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#C0392B',
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7B1F12',
    marginBottom: 4,
  },
  introBody: { fontSize: 12, color: '#922B21', lineHeight: 17 },
  introBullet: {
    fontSize: 12,
    color: '#922B21',
    lineHeight: 17,
    marginTop: 6,
  },
  introBold: { fontWeight: '700' },
  captureWrapper: { alignItems: 'center', paddingVertical: 16 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    padding: CELL_GAP,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  row: { flexDirection: 'row', gap: CELL_GAP, marginBottom: CELL_GAP },
  cell: {
    flex: 1,
    height: CELL_HEIGHT,
    backgroundColor: '#FAFAFA',
    borderRadius: 6,
    padding: 6,
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  cellInner: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: '#ECF0F1',
  },
  fill: { flex: 1 },
  source: { flex: 1, flexDirection: 'row', position: 'relative' },
  sourceStripe: { flex: 1, height: '100%' },
  sourceDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 24,
    height: 24,
    marginLeft: -12,
    marginTop: -12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2C3E50',
  },
  controls: { padding: 16 },
});

export default StyleFiltersTestScreen;
