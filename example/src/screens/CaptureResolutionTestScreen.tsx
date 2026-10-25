import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  PixelRatio,
  type LayoutChangeEvent,
} from 'react-native';
import { captureRef, type CaptureOptions } from 'react-native-view-shot';
import { Skia, AlphaType, ColorType } from '@shopify/react-native-skia';
import { CaptureButton } from '../components/shared/CaptureButton';

/**
 * Capture resolution / sharpness (#537, #505).
 *
 * Reports of blurry Android captures, notably "when the height exceeds 1000".
 * Each case captures a high-detail source (1dp black/white stripes, 2dp
 * checkerboard, small text) and checks:
 *  - dimensions: image px == source layout dp x PixelRatio.get() (+/-1px for
 *    layout rounding), i.e. the capture is at full device resolution;
 *  - sharpness: in each stripe band, the fraction of pixels that are close
 *    to pure black or pure white. A downscaled (then re-upscaled) capture
 *    turns 1dp stripes grey.
 *
 * `explicit-dp` passes the source's own dp size as width/height. iOS treats
 * width/height as points (output = points x scale); this case asserts that
 * same contract so the two platforms agree.
 */

const PR = PixelRatio.get();
const SOURCE_WIDTH = 300;
const NORMAL_HEIGHT = 200;
const TALL_HEIGHT = 1500; // > 1000dp, the threshold reported in #505
const SCROLL_VIEWPORT_HEIGHT = 300;
const SCROLL_CONTENT_HEIGHT = 2000;
const BAND_HEIGHT = 20;
const STRIPE_COUNT = SOURCE_WIDTH; // 1dp stripes
const SHARPNESS_MIN = 0.8;

type SourceId = 'normal' | 'tall' | 'scroll';

interface ResolutionCase {
  id: string;
  label: string;
  source: SourceId;
  options: CaptureOptions;
  /** Requested size in dp (iOS semantics), when width/height are passed. */
  requestedDp?: { width: number; height: number };
}

const CASES: ResolutionCase[] = [
  {
    id: 'normal',
    label: `normal ${SOURCE_WIDTH}x${NORMAL_HEIGHT}dp`,
    source: 'normal',
    options: {},
  },
  {
    id: 'tall',
    label: `tall ${SOURCE_WIDTH}x${TALL_HEIGHT}dp`,
    source: 'tall',
    options: {},
  },
  {
    id: 'scroll',
    label: `ScrollView snapshotContentContainer ${SOURCE_WIDTH}x${SCROLL_CONTENT_HEIGHT}dp`,
    source: 'scroll',
    options: { snapshotContentContainer: true },
  },
  {
    id: 'explicit-dp',
    label: `normal, width/height = ${SOURCE_WIDTH}x${NORMAL_HEIGHT} (dp)`,
    source: 'normal',
    options: { width: SOURCE_WIDTH, height: NORMAL_HEIGHT },
    requestedDp: { width: SOURCE_WIDTH, height: NORMAL_HEIGHT },
  },
];

interface Size {
  width: number;
  height: number;
}

interface CaseResult {
  uri: string;
  width: number;
  height: number;
  expected: Size;
  sharpness: number[];
  dimsOk: boolean;
  sharpOk: boolean;
  pass: boolean;
}

const near = (a: number, b: number) => Math.abs(a - b) <= 1;

/**
 * Fraction of near-black / near-white pixels along the middle row of a stripe
 * band located at `bandTopDp` within a source of `sourceHeightDp`.
 */
const bandSharpness = (
  pixels: ArrayLike<number>,
  width: number,
  height: number,
  bandTopDp: number,
  sourceHeightDp: number,
): number => {
  const y = Math.floor(
    ((bandTopDp + BAND_HEIGHT / 2) / sourceHeightDp) * height,
  );
  let crisp = 0;
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    const l = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    if (l < 40 || l > 215) crisp++;
  }
  return crisp / width;
};

/** Stripe bands (top dp offsets) present in each source. */
const bandsFor = (source: SourceId): number[] => {
  switch (source) {
    case 'normal':
      return [0, NORMAL_HEIGHT - BAND_HEIGHT];
    case 'tall':
      return [0, TALL_HEIGHT / 2, TALL_HEIGHT - BAND_HEIGHT];
    case 'scroll':
      return [
        0,
        SCROLL_CONTENT_HEIGHT / 2,
        SCROLL_CONTENT_HEIGHT - BAND_HEIGHT,
      ];
  }
};

const analyze = (
  base64: string,
  c: ResolutionCase,
  sourceDp: Size,
): CaseResult => {
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
  const expectedDp = c.requestedDp ?? sourceDp;
  const expected = {
    width: Math.round(expectedDp.width * PR),
    height: Math.round(expectedDp.height * PR),
  };
  const sharpness = bandsFor(c.source).map(top =>
    bandSharpness(pixels, width, height, top, sourceDp.height),
  );
  const dimsOk = near(width, expected.width) && near(height, expected.height);
  const sharpOk = sharpness.every(s => s >= SHARPNESS_MIN);
  return {
    uri: `data:image/png;base64,${base64}`,
    width,
    height,
    expected,
    sharpness,
    dimsOk,
    sharpOk,
    pass: dimsOk && sharpOk,
  };
};

const StripeBand: React.FC = () => (
  <View style={styles.band}>
    {Array.from({ length: STRIPE_COUNT }, (_, i) => (
      <View
        key={i}
        style={[styles.stripe, i % 2 ? styles.white : styles.black]}
      />
    ))}
  </View>
);

const Checker: React.FC<{ rows: number }> = ({ rows }) => (
  <View>
    {Array.from({ length: rows }, (_, r) => (
      <View key={r} style={styles.checkerRow}>
        {Array.from({ length: SOURCE_WIDTH / 4 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.checkerCell,
              (i + r) % 2 ? styles.white : styles.black,
            ]}
          />
        ))}
      </View>
    ))}
  </View>
);

/** Filler with small text + checkerboard, `height` dp tall. */
const Detail: React.FC<{ height: number; label: string }> = ({
  height,
  label,
}) => (
  <View style={[styles.detail, { height }]}>
    <Text style={styles.tiny} numberOfLines={2}>
      {label} — The quick brown fox jumps over the lazy dog 0123456789
      ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz
    </Text>
    <Checker rows={4} />
  </View>
);

/** A source of `height` dp, made of stripe bands at bandsFor() + detail. */
const Pattern: React.FC<{ source: SourceId; height: number }> = ({
  source,
  height,
}) => {
  const bands = bandsFor(source);
  const children: React.ReactNode[] = [];
  let y = 0;
  bands.forEach((top, i) => {
    if (top > y) {
      children.push(
        <Detail key={`d${i}`} height={top - y} label={`${source} y=${y}dp`} />,
      );
    }
    children.push(<StripeBand key={`b${i}`} />);
    y = top + BAND_HEIGHT;
  });
  if (y < height) {
    children.push(
      <Detail key="dend" height={height - y} label={`${source} y=${y}dp`} />,
    );
  }
  return <>{children}</>;
};

const CaptureResolutionTestScreen: React.FC = () => {
  const normalRef = useRef<View>(null);
  const tallRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);
  const layouts = useRef<Partial<Record<SourceId, Size>>>({});
  const [isCapturing, setIsCapturing] = useState(false);
  const [results, setResults] = useState<
    Record<string, CaseResult | { error: string }>
  >({});
  const done = Object.keys(results).length === CASES.length;

  const onLayout = (id: SourceId) => (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    layouts.current[id] = { width, height };
  };

  const refFor = (id: SourceId) =>
    id === 'normal' ? normalRef : id === 'tall' ? tallRef : scrollRef;

  const captureAll = async () => {
    setIsCapturing(true);
    setResults({});
    const next: Record<string, CaseResult | { error: string }> = {};
    for (const c of CASES) {
      try {
        const sourceDp = layouts.current[c.source];
        if (!sourceDp) throw new Error('source not laid out');
        const base64 = await captureRef(refFor(c.source), {
          format: 'png',
          result: 'base64',
          ...c.options,
        });
        const analyzed = analyze(base64, c, sourceDp);
        // Also write a tmpfile (the reporters' result type) so the encoded
        // file can be pulled with adb for side-by-side inspection.
        const uri = await captureRef(refFor(c.source), {
          format: 'png',
          result: 'tmpfile',
          fileName: `resolution-${c.id}`,
          ...c.options,
        });
        console.log(`[CaptureResolution] ${c.id} tmpfile ${uri}`);
        // Preview the tmpfile (what apps typically display / share).
        next[c.id] = { ...analyzed, uri };
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
      <ScrollView style={styles.scroll} testID="captureResolutionScrollView">
        <View style={styles.intro}>
          <Text style={styles.introTitle}>🔍 Capture resolution</Text>
          <Text style={styles.introBody}>
            PixelRatio {PR}. Each capture must be source dp x PixelRatio pixels
            and keep 1dp stripes crisp (#537, #505: blurry on Android, tall
            views).
          </Text>
        </View>

        <View style={styles.controls}>
          <CaptureButton
            onPress={captureAll}
            isCapturing={isCapturing}
            captureText="📸 Capture all"
          />
          {done && (
            <Text
              testID="resolution-summary"
              style={[styles.summary, allPass ? styles.pass : styles.fail]}
            >
              {allPass ? 'ALL PASS' : 'SOME FAILED'}
            </Text>
          )}
        </View>

        <View style={styles.results}>
          {CASES.map(c => {
            const r = results[c.id];
            return (
              <View key={c.id} style={styles.cell}>
                <Text style={styles.cellLabel}>{c.label}</Text>
                {r && 'error' in r && (
                  <Text
                    testID={`resolution-${c.id}-status`}
                    style={styles.fail}
                  >
                    ERROR {r.error}
                  </Text>
                )}
                {r && 'pass' in r && (
                  <>
                    <Text
                      testID={`resolution-${c.id}-status`}
                      style={r.pass ? styles.pass : styles.fail}
                    >
                      {r.pass ? 'PASS' : 'FAIL'}
                    </Text>
                    <Text
                      testID={`resolution-${c.id}-details`}
                      style={styles.details}
                    >
                      {`got ${r.width}x${r.height}px, expected ${
                        r.expected.width
                      }x${r.expected.height}px ${
                        r.dimsOk ? 'OK' : 'MISMATCH'
                      }; sharpness ${r.sharpness
                        .map(s => s.toFixed(2))
                        .join('/')} ${r.sharpOk ? 'OK' : 'BLURRY'}`}
                    </Text>
                    {/*
                      The tmpfile shown 1:1 at the source dp width (top
                      only), with RN <Image>'s default resizeMethod ("auto")
                      and with "scale". On Android, "auto" + a file:// uri
                      makes Fresco resize/downsample, and Fresco caps decoded
                      bitmaps at 2048px: tall captures (> 2048px, i.e.
                      > ~1000dp on a 2x device) then *display* blurry even
                      though the captured file is full resolution.
                    */}
                    {(['auto', 'scale'] as const).map(method => (
                      <View key={method}>
                        <Text style={styles.details}>
                          {`<Image resizeMethod="${method}">`}
                        </Text>
                        <View style={styles.previewClip}>
                          <Image
                            source={{ uri: r.uri }}
                            resizeMethod={method}
                            style={{
                              width: SOURCE_WIDTH,
                              height: (SOURCE_WIDTH * r.height) / r.width,
                            }}
                          />
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Sources</Text>
        <View style={styles.sourceWrapper}>
          <View
            ref={normalRef}
            collapsable={false}
            style={[styles.source, { height: NORMAL_HEIGHT }]}
            onLayout={onLayout('normal')}
          >
            <Pattern source="normal" height={NORMAL_HEIGHT} />
          </View>
        </View>
        <View style={styles.sourceWrapper}>
          <View
            ref={tallRef}
            collapsable={false}
            style={[styles.source, { height: TALL_HEIGHT }]}
            onLayout={onLayout('tall')}
          >
            <Pattern source="tall" height={TALL_HEIGHT} />
          </View>
        </View>
        <View style={styles.sourceWrapper}>
          <ScrollView
            ref={scrollRef}
            nestedScrollEnabled
            style={[styles.source, { height: SCROLL_VIEWPORT_HEIGHT }]}
            onContentSizeChange={(width, height) => {
              layouts.current.scroll = { width, height };
            }}
          >
            <View style={{ height: SCROLL_CONTENT_HEIGHT }}>
              <Pattern source="scroll" height={SCROLL_CONTENT_HEIGHT} />
            </View>
          </ScrollView>
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
  controls: { paddingHorizontal: 16 },
  summary: { textAlign: 'center', fontSize: 16, marginTop: 4 },
  results: { padding: 16 },
  cell: { marginBottom: 12 },
  cellLabel: { fontSize: 11, fontWeight: '600', color: '#555' },
  details: { fontSize: 10, color: '#777', marginVertical: 2 },
  previewClip: {
    width: SOURCE_WIDTH,
    maxHeight: 60,
    overflow: 'hidden',
    backgroundColor: '#CCC',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 8,
  },
  sourceWrapper: { alignItems: 'center', paddingVertical: 8 },
  source: { width: SOURCE_WIDTH, backgroundColor: '#FFFFFF' },
  band: { flexDirection: 'row', height: BAND_HEIGHT },
  stripe: { width: 1, height: BAND_HEIGHT },
  black: { backgroundColor: '#000000' },
  white: { backgroundColor: '#FFFFFF' },
  detail: { overflow: 'hidden', padding: 2 },
  tiny: { fontSize: 7, color: '#000' },
  checkerRow: { flexDirection: 'row' },
  checkerCell: { width: 4, height: 4 },
  pass: { color: '#1E8449', fontWeight: '700' },
  fail: { color: '#C0392B', fontWeight: '700' },
});

export default CaptureResolutionTestScreen;
