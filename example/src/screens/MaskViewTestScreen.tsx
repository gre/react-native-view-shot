import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import ViewShot, {
  captureRef,
  captureScreen,
  MaskView,
  type ViewShotRef,
} from 'react-native-view-shot';
import Video from 'react-native-video';
import { PreviewContainer } from '../components/shared';

const sampleVideo = require('../broadchurch.mp4');

const MaskViewTestScreen: React.FC = () => {
  // Capture view refs
  const basicColorsRef = useRef<ViewShotRef>(null);
  const alphaColorsRef = useRef<ViewShotRef>(null);
  const overflowRef = useRef<ViewShotRef>(null);
  const scrollViewCaptureRef = useRef<ViewShotRef>(null);
  const innerScrollRef = useRef<any>(null);
  const clippedContainerRef = useRef<ViewShotRef>(null);
  const textureViewRef = useRef<ViewShotRef>(null);

  // Capture preview states
  const [basicUri, setBasicUri] = useState<string | null>(null);
  const [alphaUri, setAlphaUri] = useState<string | null>(null);
  const [overflowUri, setOverflowUri] = useState<string | null>(null);
  const [scrollNormalUri, setScrollNormalUri] = useState<string | null>(null);
  const [scrollFullUri, setScrollFullUri] = useState<string | null>(null);
  const [clippedUri, setClippedUri] = useState<string | null>(null);
  const [textureUri, setTextureUri] = useState<string | null>(null);
  const [animatedScreenUri, setAnimatedScreenUri] = useState<string | null>(
    null,
  );

  // Continuous animation for Scenario 7 (captureScreen during motion)
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animValue]);

  // Capture handlers
  const captureBasic = async () => {
    try {
      if (basicColorsRef.current) {
        const uri = await captureRef(basicColorsRef.current, { format: 'png' });
        setBasicUri(uri);
      }
    } catch (err) {
      console.warn('captureBasic error:', err);
    }
  };

  const captureAlpha = async () => {
    try {
      if (alphaColorsRef.current) {
        const uri = await captureRef(alphaColorsRef.current, { format: 'png' });
        setAlphaUri(uri);
      }
    } catch (err) {
      console.warn('captureAlpha error:', err);
    }
  };

  const captureOverflow = async () => {
    try {
      if (overflowRef.current) {
        const uri = await captureRef(overflowRef.current, { format: 'png' });
        setOverflowUri(uri);
      }
    } catch (err) {
      console.warn('captureOverflow error:', err);
    }
  };

  const captureScrollNormal = async () => {
    try {
      if (scrollViewCaptureRef.current) {
        const uri = await captureRef(scrollViewCaptureRef.current, {
          format: 'png',
          snapshotContentContainer: false,
        });
        setScrollNormalUri(uri);
      }
    } catch (err) {
      console.warn('captureScrollNormal error:', err);
    }
  };

  const captureScrollFull = async () => {
    try {
      const target = innerScrollRef.current || scrollViewCaptureRef.current;
      if (target) {
        const uri = await captureRef(target, {
          format: 'png',
          snapshotContentContainer: true,
        });
        setScrollFullUri(uri);
      }
    } catch (err) {
      console.warn('captureScrollFull error:', err);
    }
  };

  const captureClipped = async () => {
    try {
      if (clippedContainerRef.current) {
        const uri = await captureRef(clippedContainerRef.current, {
          format: 'png',
        });
        setClippedUri(uri);
      }
    } catch (err) {
      console.warn('captureClipped error:', err);
    }
  };

  const captureTexture = async () => {
    try {
      if (textureViewRef.current) {
        const uri = await captureRef(textureViewRef.current, { format: 'png' });
        setTextureUri(uri);
      }
    } catch (err) {
      console.warn('captureTexture error:', err);
    }
  };

  const captureAnimatedScreen = async () => {
    try {
      const uri = await captureScreen({ format: 'png' });
      setAnimatedScreenUri(uri);
    } catch (err) {
      console.warn('captureAnimatedScreen error:', err);
    }
  };

  // Auto-run all captures on mount so all previews are rendered and verifiable
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        await captureBasic();
        await captureAlpha();
        await captureOverflow();
        await captureScrollNormal();
        await captureScrollFull();
        await captureClipped();
        await captureTexture();
        await captureAnimatedScreen();
      } catch (err) {
        console.warn('Auto-capture error:', err);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const animatedTranslate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageContent}
      >
        <Text style={styles.screenHeader}>🛡️ MaskView Verification Suite</Text>
        <Text style={styles.screenSubtitle}>
          Verifies masking of synthetic confidential UI across opaque colors,
          alpha transparency, bounds overflow, scrolling, clipping, hardware
          surfaces, and active animations.
        </Text>

        {/* 1. Primary Security: Fully Opaque Mask Colors */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            1. Primary Security: Fully Opaque Masks
          </Text>
          <Text style={styles.cardDesc}>
            Guaranteed 100% redaction with opaque masks over synthetic
            confidential tokens:
          </Text>

          <ViewShot ref={basicColorsRef} style={styles.testContainer}>
            <View style={styles.colorRow}>
              <Text style={styles.colorLabel}>
                Default Opaque Black (#000000):
              </Text>
              <MaskView maskColor="#000000" style={styles.maskContainer}>
                <Text style={styles.sensitiveText}>
                  SYNTHETIC_SECURITY_TOKEN_01
                </Text>
              </MaskView>
            </View>

            <View style={styles.colorRow}>
              <Text style={styles.colorLabel}>Named Opaque Red (red):</Text>
              <MaskView maskColor="red" style={styles.maskContainer}>
                <Text style={styles.sensitiveText}>
                  CONFIDENTIAL_PIN_CODE_XYZ
                </Text>
              </MaskView>
            </View>

            <View style={styles.colorRow}>
              <Text style={styles.colorLabel}>3-Digit Hex Blue (#00F):</Text>
              <MaskView maskColor="#00F" style={styles.maskContainer}>
                <Text style={styles.sensitiveText}>
                  SYNTHETIC_ACCOUNT_NUM_9999
                </Text>
              </MaskView>
            </View>

            <View style={styles.colorRow}>
              <Text style={styles.colorLabel}>6-Digit Hex Navy (#1E88E5):</Text>
              <MaskView maskColor="#1E88E5" style={styles.maskContainer}>
                <Text style={styles.sensitiveText}>
                  SAMPLE_RESTRICTED_PAYLOAD_KEY
                </Text>
              </MaskView>
            </View>
          </ViewShot>

          <TouchableOpacity style={styles.button} onPress={captureBasic}>
            <Text style={styles.buttonText}>📸 Capture Opaque Colors</Text>
          </TouchableOpacity>
          {basicUri && (
            <PreviewContainer
              capturedUri={basicUri}
              imageHeight={80}
              title="Opaque Colors Capture Output"
            />
          )}
        </View>

        {/* 2. Alpha & Transparency (Underlying Content Intentionally Visible) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            2. Alpha & Transparency (Non-Secure Demonstration)
          </Text>
          <Text style={styles.cardDesc}>
            Demonstrates that alpha &lt; 255 intentionally permits underlying
            content to show through:
          </Text>

          <ViewShot ref={alphaColorsRef} style={styles.testContainer}>
            <View style={styles.colorRow}>
              <Text style={styles.colorLabel}>
                Semi-Transparent Orange (rgba(255, 165, 0, 0.45)):
              </Text>
              <MaskView
                maskColor="rgba(255, 165, 0, 0.45)"
                style={styles.maskContainer}
              >
                <Text style={styles.nonSensitiveText}>
                  PUBLIC_TEXT_SEEN_THROUGH_ALPHA
                </Text>
              </MaskView>
              <Text style={styles.alphaNotice}>
                ⚠️ Notice: Underlying text is intentionally visible through 45%
                alpha.
              </Text>
            </View>

            <View style={styles.colorRow}>
              <Text style={styles.colorLabel}>
                Transparent Mask (transparent):
              </Text>
              <MaskView
                maskColor="transparent"
                style={styles.maskContainerTransparent}
              >
                <Text style={styles.nonSensitiveTextDark}>
                  PUBLIC_CONTENT_100_PERCENT_VISIBLE
                </Text>
              </MaskView>
              <Text style={styles.alphaNotice}>
                ⚠️ Notice: Content is 100% visible through transparent mask.
              </Text>
            </View>
          </ViewShot>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF9800' }]}
            onPress={captureAlpha}
          >
            <Text style={styles.buttonText}>
              📸 Capture Alpha Demonstration
            </Text>
          </TouchableOpacity>
          {alphaUri && (
            <PreviewContainer
              capturedUri={alphaUri}
              imageHeight={80}
              title="Alpha Demonstration Capture Output"
            />
          )}
        </View>

        {/* 3. Overflow Protection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            3. Overflow Protection (overflow: "hidden")
          </Text>
          <Text style={styles.cardDesc}>
            Ensures that child content extending outside MaskView bounds cannot
            leak into the snapshot:
          </Text>

          <ViewShot ref={overflowRef} style={styles.testContainer}>
            <Text style={styles.note}>
              MaskView size: 160x36. Child text width: 320px.
            </Text>
            <View style={styles.overflowWrapper}>
              <MaskView maskColor="#000000" style={styles.overflowMask}>
                <Text style={styles.overflowChild}>
                  SYNTHETIC_SECRET_KEY_EXCEEDING_MASK_BOUNDS_LEAK_CHECK
                </Text>
              </MaskView>
            </View>
          </ViewShot>

          <TouchableOpacity style={styles.button} onPress={captureOverflow}>
            <Text style={styles.buttonText}>📸 Capture Overflow Test</Text>
          </TouchableOpacity>
          {overflowUri && (
            <PreviewContainer
              capturedUri={overflowUri}
              imageHeight={80}
              title="Overflow Prevention Capture Output"
            />
          )}
        </View>

        {/* 4. ScrollView Tracking (Normal & Full Container) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            4. ScrollView Coordinate Tracking
          </Text>
          <Text style={styles.cardDesc}>
            Verifies accurate mask positioning for both visible viewport scroll
            and snapshotContentContainer expansion:
          </Text>

          <ViewShot ref={scrollViewCaptureRef} style={styles.scrollViewWrapper}>
            <ScrollView
              ref={innerScrollRef}
              style={styles.innerScrollView}
              contentContainerStyle={styles.innerScrollContent}
              nestedScrollEnabled
            >
              <View style={styles.scrollItem}>
                <Text style={styles.itemLabel}>
                  Item 1: General Header (Public)
                </Text>
              </View>
              <View style={styles.scrollItem}>
                <Text style={styles.itemLabel}>Item 2: Masked Secret</Text>
                <MaskView maskColor="#1E88E5" style={styles.maskContainer}>
                  <Text style={styles.sensitiveText}>
                    SYNTHETIC_SCROLL_SECRET_ITEM_2
                  </Text>
                </MaskView>
              </View>
              <View style={styles.scrollItem}>
                <Text style={styles.itemLabel}>
                  Item 3: Middle Content (Public)
                </Text>
              </View>
              <View style={styles.scrollItem}>
                <Text style={styles.itemLabel}>Item 4: Masked Secret</Text>
                <MaskView maskColor="#E53935" style={styles.maskContainer}>
                  <Text style={styles.sensitiveText}>
                    SYNTHETIC_SCROLL_SECRET_ITEM_4
                  </Text>
                </MaskView>
              </View>
              <View style={styles.scrollItem}>
                <Text style={styles.itemLabel}>
                  Item 5: Footer Content (Public)
                </Text>
              </View>
            </ScrollView>
          </ViewShot>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.flex1]}
              onPress={captureScrollNormal}
            >
              <Text style={styles.buttonText}>Normal Viewport</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.flex1,
                { backgroundColor: '#4CAF50' },
              ]}
              onPress={captureScrollFull}
            >
              <Text style={styles.buttonText}>snapshotContentContainer</Text>
            </TouchableOpacity>
          </View>

          {scrollNormalUri && (
            <PreviewContainer
              capturedUri={scrollNormalUri}
              imageHeight={80}
              title="Normal Viewport Scroll Capture"
            />
          )}
          {scrollFullUri && (
            <PreviewContainer
              capturedUri={scrollFullUri}
              imageHeight={90}
              title="Full Scroll Container (Expanded) Capture"
            />
          )}
        </View>

        {/* 5. Ancestor Clipping (overflow: hidden container) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            5. Ancestor Clipping (overflow: hidden)
          </Text>
          <Text style={styles.cardDesc}>
            Verifies that masks partially outside an ancestor with overflow:
            hidden do not bleed or paint outside parent bounds:
          </Text>

          <ViewShot ref={clippedContainerRef} style={styles.testContainer}>
            <View style={styles.clippedAncestor}>
              <Text style={styles.clippedAncestorText}>
                Ancestor Container (height: 70, overflow: hidden)
              </Text>
              <MaskView maskColor="#8E24AA" style={styles.clippedMask}>
                <Text style={styles.sensitiveText}>
                  SYNTHETIC_CONTAINER_SECRET_KEY
                </Text>
              </MaskView>
            </View>
            <View style={styles.adjacentBox}>
              <Text style={styles.adjacentBoxText}>
                Adjacent Content (Must NOT be covered by purple mask)
              </Text>
            </View>
          </ViewShot>

          <TouchableOpacity style={styles.button} onPress={captureClipped}>
            <Text style={styles.buttonText}>
              📸 Capture Clipped Ancestor Test
            </Text>
          </TouchableOpacity>
          {clippedUri && (
            <PreviewContainer
              capturedUri={clippedUri}
              imageHeight={80}
              title="Ancestor Clipping Capture Output"
            />
          )}
        </View>

        {/* 6. Hardware Surface (TextureView / Video) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            6. Hardware Surface (TextureView / Video)
          </Text>
          <Text style={styles.cardDesc}>
            Verifies that hardware video layers composite cleanly beside
            MaskView without GPU bleeding:
          </Text>

          <ViewShot ref={textureViewRef} style={styles.testContainer}>
            <View style={styles.splitRow}>
              <View style={styles.videoBox}>
                <Video
                  source={sampleVideo}
                  style={styles.videoPlayer}
                  resizeMode="cover"
                  repeat
                  muted
                  paused={false}
                />
              </View>
              <View style={styles.maskSideBox}>
                <Text style={styles.videoSideLabel}>High-Contrast Token:</Text>
                <MaskView maskColor="#000000" style={styles.maskInSplit}>
                  <Text style={styles.sensitiveText}>
                    SYNTHETIC_SECURE_TOKEN_55
                  </Text>
                </MaskView>
              </View>
            </View>
          </ViewShot>

          <TouchableOpacity style={styles.button} onPress={captureTexture}>
            <Text style={styles.buttonText}>📸 Capture Video & Mask View</Text>
          </TouchableOpacity>
          {textureUri && (
            <PreviewContainer
              capturedUri={textureUri}
              imageHeight={80}
              title="TextureView & Mask Capture Output"
            />
          )}
        </View>

        {/* 7. Active Animation (captureScreen) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            7. Active Animation (captureScreen)
          </Text>
          <Text style={styles.cardDesc}>
            Tests PixelCopy frame alignment during active continuous
            translation:
          </Text>

          <View style={styles.animationContainer}>
            <Animated.View
              style={[
                styles.animatedBox,
                { transform: [{ translateX: animatedTranslate }] },
              ]}
            >
              <MaskView maskColor="#D81B60" style={styles.animatedMask}>
                <Text style={styles.sensitiveText}>
                  [ANIMATED_SYNTHETIC_TOKEN]
                </Text>
              </MaskView>
            </Animated.View>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF9800' }]}
            onPress={captureAnimatedScreen}
          >
            <Text style={styles.buttonText}>
              🖥️ captureScreen() During Animation
            </Text>
          </TouchableOpacity>
          {animatedScreenUri && (
            <PreviewContainer
              capturedUri={animatedScreenUri}
              imageHeight={100}
              title="captureScreen Active Animation Output"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  pageScroll: {
    flex: 1,
  },
  pageContent: {
    padding: 16,
    paddingBottom: 40,
  },
  screenHeader: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 16,
    lineHeight: 19,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 18,
  },
  testContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    marginBottom: 12,
  },
  colorRow: {
    marginBottom: 12,
  },
  colorLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
  },
  maskContainer: {
    alignSelf: 'flex-start',
    borderRadius: 5,
  },
  maskContainerTransparent: {
    alignSelf: 'flex-start',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderStyle: 'dashed',
  },
  sensitiveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  nonSensitiveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  nonSensitiveTextDark: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  alphaNotice: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600',
    marginTop: 4,
  },
  note: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  overflowWrapper: {
    width: 200,
    height: 50,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 4,
    borderRadius: 4,
  },
  overflowMask: {
    width: 160,
    height: 36,
    backgroundColor: '#000000',
    borderRadius: 4,
  },
  overflowChild: {
    width: 320,
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollViewWrapper: {
    height: 190,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    marginBottom: 12,
  },
  innerScrollView: {
    flex: 1,
  },
  innerScrollContent: {
    padding: 8,
  },
  scrollItem: {
    padding: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    marginVertical: 4,
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  clippedAncestor: {
    height: 70,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    padding: 8,
    position: 'relative',
  },
  clippedAncestorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  clippedMask: {
    position: 'absolute',
    top: 40,
    left: 10,
    width: 240,
    height: 60,
    backgroundColor: '#8E24AA',
    borderRadius: 4,
  },
  adjacentBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FEF08A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FACC15',
  },
  adjacentBoxText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#854D0E',
  },
  splitRow: {
    flexDirection: 'row',
    height: 110,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  videoBox: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  maskSideBox: {
    flex: 1.1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 10,
  },
  videoSideLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  maskInSplit: {
    borderRadius: 4,
  },
  animationContainer: {
    height: 60,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  animatedBox: {
    width: 170,
  },
  animatedMask: {
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

export default MaskViewTestScreen;
