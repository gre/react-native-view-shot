import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { captureRef, type CaptureOptions } from 'react-native-view-shot';
import { Skia, AlphaType, ColorType } from '@shopify/react-native-skia';
import { CaptureButton } from '../components/shared/CaptureButton';

const SOURCE_WIDTH = 200;
const SOURCE_HEIGHT = 100;

// Top-left, top-right, bottom-left, bottom-right.
const QUADRANTS = ['red', 'blue', 'green', 'yellow'] as const;
const QUADRANT_COLORS: Record<(typeof QUADRANTS)[number], string> = {
  red: '#FF0000',
  blue: '#0000FF',
  green: '#00FF00',
  yellow: '#FFFF00',
};

interface ResizeCase {
  id: string;
  label: string;
  options: CaptureOptions;
}

/**
 * `width` / `height` must scale the whole view into the output, for every
 * capture strategy. `useRenderInContext` is iOS-only; Android ignores it, so
 * those cases double as a cross-platform consistency check.
 */
const CASES: ResizeCase[] = [
  { id: 'default-natural', label: 'default', options: {} },
  {
    id: 'default-smaller',
    label: 'default 100x50',
    options: { width: 100, height: 50 },
  },
  {
    id: 'default-larger',
    label: 'default 400x200',
    options: { width: 400, height: 200 },
  },
  {
    id: 'ric-natural',
    label: 'useRenderInContext',
    options: { useRenderInContext: true },
  },
  {
    id: 'ric-smaller',
    label: 'useRenderInContext 100x50',
    options: { useRenderInContext: true, width: 100, height: 50 },
  },
  {
    id: 'ric-larger',
    label: 'useRenderInContext 400x200',
    options: { useRenderInContext: true, width: 400, height: 200 },
  },
];

interface CaseResult {
  uri: string;
  width: number;
  height: number;
  quadrants: string[];
  pass: boolean;
}

const QUADRANT_RGB: Record<(typeof QUADRANTS)[number], number[]> = {
  red: [255, 0, 0],
  blue: [0, 0, 255],
  green: [0, 255, 0],
  yellow: [255, 255, 0],
};

// Nearest quadrant color: iOS captures are tagged Display P3, and the raw
// bytes Skia returns are not converted back to sRGB (pure green reads about
// rgb(117,252,76)), so exact thresholds don't work.
const colorName = (r: number, g: number, b: number, a: number): string => {
  if (a < 32) return 'transparent';
  let best = `rgba(${r},${g},${b},${a})`;
  let bestDistance = 160;
  for (const q of QUADRANTS) {
    const [qr, qg, qb] = QUADRANT_RGB[q];
    const distance = Math.hypot(r - qr, g - qg, b - qb);
    if (distance < bestDistance) {
      best = q;
      bestDistance = distance;
    }
  }
  return best;
};

// Decodes the PNG and samples the center of each of its four quadrants.
const analyze = (base64: string): CaseResult => {
  const image = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(base64));
  if (!image) throw new Error('could not decode capture');
  const width = image.width();
  const height = image.height();
  const pixels = image.readPixels(0, 0, {
    width,
    height,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  });
  if (!pixels) throw new Error('could not read capture pixels');
  const quadrants = [
    [0.25, 0.25],
    [0.75, 0.25],
    [0.25, 0.75],
    [0.75, 0.75],
  ].map(([fx, fy]) => {
    const i = (Math.floor(fy * height) * width + Math.floor(fx * width)) * 4;
    return colorName(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]);
  });
  const ratio = width / height;
  const pass =
    Math.abs(ratio - SOURCE_WIDTH / SOURCE_HEIGHT) < 0.05 &&
    quadrants.every((q, i) => q === QUADRANTS[i]);
  return {
    uri: `data:image/png;base64,${base64}`,
    width,
    height,
    quadrants,
    pass,
  };
};

const ResizeTestScreen: React.FC = () => {
  const sourceRef = useRef<React.ComponentRef<typeof View>>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [results, setResults] = useState<
    Record<string, CaseResult | { error: string }>
  >({});
  const done = Object.keys(results).length === CASES.length;

  const captureAll = async () => {
    setIsCapturing(true);
    setResults({});
    const next: Record<string, CaseResult | { error: string }> = {};
    for (const c of CASES) {
      try {
        const base64 = await captureRef(sourceRef, {
          format: 'png',
          result: 'base64',
          ...c.options,
        });
        next[c.id] = analyze(base64);
      } catch (e) {
        next[c.id] = { error: e instanceof Error ? e.message : String(e) };
      }
    }
    setResults(next);
    setIsCapturing(false);
  };

  const allPass =
    done &&
    CASES.every(c => {
      const r = results[c.id];
      return 'pass' in r && r.pass;
    });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} testID="resizeTestScrollView">
        <View style={styles.intro}>
          <Text style={styles.introTitle}>📐 Resize (width / height)</Text>
          <Text style={styles.introBody}>
            Each capture of the source must contain all four quadrants, scaled
            to the requested size, whatever the capture strategy. A cropped
            (smaller size) or padded (larger size) capture fails.
          </Text>
        </View>

        <View style={styles.sourceWrapper}>
          <View ref={sourceRef} collapsable={false} style={styles.source}>
            {QUADRANTS.map(q => (
              <View
                key={q}
                style={[
                  styles.quadrant,
                  { backgroundColor: QUADRANT_COLORS[q] },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.controls}>
          <CaptureButton
            onPress={captureAll}
            isCapturing={isCapturing}
            captureText="📸 Capture all sizes"
          />
          {done && (
            <Text
              testID="resize-summary"
              style={[styles.summary, allPass ? styles.pass : styles.fail]}
            >
              {allPass ? 'ALL PASS' : 'SOME FAILED'}
            </Text>
          )}
        </View>

        <View style={styles.grid}>
          {CASES.map(c => {
            const r = results[c.id];
            return (
              <View key={c.id} style={styles.cell}>
                <Text style={styles.cellLabel}>{c.label}</Text>
                {r && 'error' in r && (
                  <Text testID={`resize-${c.id}-status`} style={styles.fail}>
                    ERROR {r.error}
                  </Text>
                )}
                {r && 'pass' in r && (
                  <>
                    <Image
                      source={{ uri: r.uri }}
                      style={styles.preview}
                      resizeMode="contain"
                    />
                    <Text
                      testID={`resize-${c.id}-status`}
                      style={r.pass ? styles.pass : styles.fail}
                    >
                      {r.pass ? 'PASS' : 'FAIL'}
                    </Text>
                    <Text style={styles.details}>
                      {r.width}x{r.height}px {r.quadrants.join(' ')}
                    </Text>
                  </>
                )}
              </View>
            );
          })}
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
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B3D6B',
    marginBottom: 4,
  },
  introBody: { fontSize: 12, color: '#1B4F72', lineHeight: 17 },
  sourceWrapper: { alignItems: 'center', paddingVertical: 8 },
  source: {
    width: SOURCE_WIDTH,
    height: SOURCE_HEIGHT,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quadrant: { width: SOURCE_WIDTH / 2, height: SOURCE_HEIGHT / 2 },
  controls: { padding: 16 },
  summary: { textAlign: 'center', fontSize: 16, marginTop: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingBottom: 32,
  },
  cell: { width: '50%', padding: 8 },
  cellLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  preview: { width: 150, height: 75, backgroundColor: '#CCC' },
  details: { fontSize: 10, color: '#777', marginTop: 2 },
  pass: { color: '#1E8449', fontWeight: '700' },
  fail: { color: '#C0392B', fontWeight: '700' },
});

export default ResizeTestScreen;
