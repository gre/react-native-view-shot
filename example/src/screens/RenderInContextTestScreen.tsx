import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';

/**
 * #677 — iOS `useRenderInContext` drops content of views that carry a border.
 *
 * `captureRef({ useRenderInContext: true })` calls `-[CALayer renderInContext:]`,
 * which walks `sublayers` in array order and IGNORES `zPosition`.
 *
 * Under Fabric, `RCTViewComponentView` stops using `layer.backgroundColor` and
 * appends a `_backgroundColorLayer` sublayer whenever it can't express the
 * border with plain CoreAnimation properties — see
 * `RCTViewComponentView.mm`, `useCoreAnimationBorderRendering`. That layer is
 * kept behind the content purely by `zPosition = -1024`
 * (`BACKGROUND_COLOR_ZPOSITION`), which the live compositor honours and
 * `renderInContext:` does not. Appended last, it is therefore painted last —
 * over the text — and the card comes back as a flat white block.
 *
 * The cards below carry identical content and differ only in what decides
 * which rendering path RN takes. Measured before the fix:
 *
 *  - `plain`           no border                  → fine
 *  - `border`          borderWidth: 1             → captured as a flat block
 *  - `border-clipped`  border + overflow: hidden  → fine (clipsToBounds flips
 *                                                   `useCoreAnimationBorderRendering`
 *                                                   back to true)
 *  - `nested-border`   border on a child of the capture root → flat block too
 *  - `scroll-border`   the reporter's own setup   → does NOT reproduce
 *
 * The last two are controls. `nested-border` rules out "the bordered view must
 * be the capture root". `scroll-border` replicates #677 as filed, and passes —
 * so what is reproduced here shares #677's signature without being provably
 * the same instance of it.
 */

const CARD_WIDTH = 300;
const CARD_HEIGHT = 120;

type ModeKey = 'draw' | 'ric';

const MODES: { key: ModeKey; label: string; useRenderInContext: boolean }[] = [
  {
    key: 'draw',
    label: 'drawViewHierarchyInRect',
    useRenderInContext: false,
  },
  { key: 'ric', label: 'renderInContext', useRenderInContext: true },
];

type CardKey =
  | 'plain'
  | 'border'
  | 'border-clipped'
  | 'nested-border'
  | 'scroll-border';

interface CardSpec {
  key: CardKey;
  label: string;
  style: ViewStyle;
  /** Rendered as a ScrollView captured with `snapshotContentContainer`. */
  scroll?: boolean;
  /** The bordered view is a child of the capture root, not the root itself. */
  nested?: boolean;
}

const CARDS: CardSpec[] = [
  {
    key: 'plain',
    label: 'no border (reference)',
    style: {},
  },
  {
    key: 'border',
    label: 'borderWidth: 1 — minimal repro',
    style: { borderWidth: 1, borderColor: '#F6F6F6' },
  },
  {
    key: 'border-clipped',
    label: "borderWidth: 1 + overflow: 'hidden'",
    style: { borderWidth: 1, borderColor: '#F6F6F6', overflow: 'hidden' },
  },
  {
    key: 'nested-border',
    label: 'borderWidth: 1 on a CHILD of the capture root',
    style: {},
    nested: true,
  },
  {
    key: 'scroll-border',
    label: "the reporter's exact case — ScrollView + snapshotContentContainer",
    style: {},
    scroll: true,
  },
];

/**
 * The reporter captures a vertical ScrollView with `snapshotContentContainer`,
 * whose items carry the border. The minimal `border` card above shows the bug
 * does not need any of that — but this card reproduces #677 as filed, so the
 * fix is verified against the configuration actually reported and not only
 * against our reduction of it.
 */
const SCROLL_ITEMS = [1, 2, 3, 4];

/**
 * Identical in every card. High-contrast black on white, covering a large part
 * of the surface, so that "the content vanished" is measurable rather than a
 * judgement call.
 */
const CardContent: React.FC = () => (
  <>
    <Text style={styles.cardLine}>ABCDEFGHIJ</Text>
    <Text style={styles.cardLine}>0123456789</Text>
    <Text style={styles.cardLine}>KLMNOPQRST</Text>
  </>
);

type Results = Partial<Record<`${ModeKey}-${CardKey}`, string>>;
type Errors = Partial<Record<`${ModeKey}-${CardKey}`, string>>;

const RenderInContextTestScreen: React.FC = () => {
  const refs = useRef<Partial<Record<CardKey, React.Component | null>>>({});
  const [results, setResults] = useState<Results>({});
  const [errors, setErrors] = useState<Errors>({});
  const [capturing, setCapturing] = useState<ModeKey | null>(null);

  const captureAll = useCallback(async (mode: ModeKey) => {
    const modeConfig = MODES.find(m => m.key === mode);
    if (!modeConfig) return;

    setCapturing(mode);
    for (const card of CARDS) {
      const slot = `${mode}-${card.key}` as `${ModeKey}-${CardKey}`;
      const node = refs.current[card.key];
      if (!node) continue;

      try {
        const uri = await captureRef(node, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
          useRenderInContext: modeConfig.useRenderInContext,
          // The reporter's card is a ScrollView captured in full.
          snapshotContentContainer: card.scroll === true,
        });
        setResults(prev => ({ ...prev, [slot]: uri }));
        setErrors(prev => ({ ...prev, [slot]: undefined }));
      } catch (error: any) {
        setErrors(prev => ({
          ...prev,
          [slot]: String(error?.message ?? error),
        }));
      }
    }
    setCapturing(null);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} testID="renderInContextTestScrollView">
        <View style={styles.intro}>
          <Text style={styles.introTitle}>🩹 useRenderInContext (#677)</Text>
          <Text style={styles.introBody}>
            On iOS, `useRenderInContext: true` swaps `drawViewHierarchyInRect`
            for `CALayer.renderInContext:`, which walks sublayers in array order
            and ignores `zPosition`.
          </Text>
          <Text style={styles.introBody}>
            Fabric relies on `zPosition = -1024` to keep the background layer it
            appends for bordered views behind the content. Captured through
            `renderInContext:`, that layer paints last instead — over the text.
          </Text>
          <Text style={styles.introBody}>
            Capture both ways: the three cards should look identical in both
            columns. Any card that comes back as a blank block is the bug.
          </Text>
        </View>

        {/* The capture targets. Identical content, styles differ only in the
            border/overflow combination that flips RN's rendering path. */}
        <View style={styles.cards} testID="ric-cards">
          {CARDS.map(card => (
            <View key={card.key} style={styles.cardSlot}>
              <Text style={styles.cardLabel}>{card.label}</Text>
              {card.nested ? (
                <View
                  testID={`ric-card-${card.key}`}
                  ref={node => {
                    refs.current[card.key] = node;
                  }}
                  collapsable={false}
                  style={styles.card}
                >
                  <View collapsable={false} style={styles.nestedInner}>
                    <CardContent />
                  </View>
                </View>
              ) : card.scroll ? (
                <ScrollView
                  testID={`ric-card-${card.key}`}
                  ref={node => {
                    refs.current[card.key] = node;
                  }}
                  collapsable={false}
                  removeClippedSubviews={false}
                  style={styles.scrollCard}
                >
                  <View collapsable={false}>
                    {SCROLL_ITEMS.map(n => (
                      <View key={n} style={styles.scrollItem}>
                        <Text style={styles.cardLine}>{`ITEM ${n}`}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <View
                  testID={`ric-card-${card.key}`}
                  ref={node => {
                    refs.current[card.key] = node;
                  }}
                  collapsable={false}
                  style={[styles.card, card.style]}
                >
                  <CardContent />
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.buttons}>
          {MODES.map(mode => (
            <TouchableOpacity
              key={mode.key}
              style={[
                styles.button,
                capturing !== null && styles.buttonDisabled,
              ]}
              disabled={capturing !== null}
              onPress={() => captureAll(mode.key)}
              testID={`ric-capture-${mode.key}`}
              accessible={true}
              accessibilityLabel={`ric-capture-${mode.key}`}
            >
              <Text style={styles.buttonText}>
                {capturing === mode.key ? '📸 Capturing…' : `📸 ${mode.label}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results. The URI Text nodes are what the Detox test reads via
            getAttributes() to locate the PNG on the host filesystem. */}
        {MODES.map(mode => (
          <View key={mode.key} style={styles.resultSection}>
            <Text style={styles.resultTitle}>{mode.label}</Text>
            {CARDS.map(card => {
              const slot = `${mode.key}-${card.key}` as `${ModeKey}-${CardKey}`;
              const uri = results[slot];
              const error = errors[slot];
              return (
                <View key={card.key} style={styles.resultRow}>
                  <Text style={styles.resultLabel}>{card.key}</Text>
                  {uri ? (
                    <>
                      <Image
                        testID={`ric-preview-${mode.key}-${card.key}`}
                        source={{ uri }}
                        style={styles.preview}
                        resizeMode="contain"
                        fadeDuration={0}
                      />
                      <Text
                        testID={`ric-uri-${mode.key}-${card.key}`}
                        style={styles.uri}
                      >
                        {uri}
                      </Text>
                    </>
                  ) : error ? (
                    <Text
                      testID={`ric-error-${mode.key}-${card.key}`}
                      style={styles.error}
                    >
                      {error}
                    </Text>
                  ) : (
                    <Text style={styles.pending}>not captured yet</Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { flex: 1 },
  intro: { padding: 16 },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  introBody: { fontSize: 13, color: '#555', lineHeight: 19, marginBottom: 6 },

  cards: { paddingHorizontal: 16 },
  cardSlot: { marginBottom: 16 },
  cardLabel: { fontSize: 12, color: '#666', marginBottom: 6 },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  scrollCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
  },
  nestedInner: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F6F6F6',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  // The reporter's item style, verbatim.
  scrollItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F6F6F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardLine: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 2,
  },

  buttons: { paddingHorizontal: 16, marginTop: 8 },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },

  resultSection: { paddingHorizontal: 16, marginTop: 12 },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  resultRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  preview: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#EEEEEE',
  },
  uri: { fontSize: 9, color: '#888', marginTop: 6 },
  error: { fontSize: 12, color: '#C0392B' },
  pending: { fontSize: 12, color: '#AAA', fontStyle: 'italic' },
});

export default RenderInContextTestScreen;
