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
  // Capture refs
  const basicColorsRef = useRef<ViewShotRef>(null);
  const overflowRef = useRef<ViewShotRef>(null);
  const scrollViewCaptureRef = useRef<ViewShotRef>(null);
  const clippedContainerRef = useRef<ViewShotRef>(null);
  const textureViewRef = useRef<ViewShotRef>(null);

  // Capture preview states
  const [basicUri, setBasicUri] = useState<string | null>(null);
  const [overflowUri, setOverflowUri] = useState<string | null>(null);
  const [scrollNormalUri, setScrollNormalUri] = useState<string | null>(null);
  const [scrollFullUri, setScrollFullUri] = useState<string | null>(null);
  const [clippedUri, setClippedUri] = useState<string | null>(null);
  const [textureUri, setTextureUri] = useState<string | null>(null);
  const [animatedScreenUri, setAnimatedScreenUri] = useState<string | null>(
    null,
  );

  // Animation for scenario 6: captureScreen during animation
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
    if (basicColorsRef.current) {
      const uri = await captureRef(basicColorsRef.current, { format: 'png' });
      setBasicUri(uri);
    }
  };

  const captureOverflow = async () => {
    if (overflowRef.current) {
      const uri = await captureRef(overflowRef.current, { format: 'png' });
      setOverflowUri(uri);
    }
  };

  const captureScrollNormal = async () => {
    if (scrollViewCaptureRef.current) {
      const uri = await captureRef(scrollViewCaptureRef.current, {
        format: 'png',
        snapshotContentContainer: false,
      });
      setScrollNormalUri(uri);
    }
  };

  const captureScrollFull = async () => {
    if (scrollViewCaptureRef.current) {
      const uri = await captureRef(scrollViewCaptureRef.current, {
        format: 'png',
        snapshotContentContainer: true,
      });
      setScrollFullUri(uri);
    }
  };

  const captureClipped = async () => {
    if (clippedContainerRef.current) {
      const uri = await captureRef(clippedContainerRef.current, {
        format: 'png',
      });
      setClippedUri(uri);
    }
  };

  const captureTexture = async () => {
    if (textureViewRef.current) {
      const uri = await captureRef(textureViewRef.current, { format: 'png' });
      setTextureUri(uri);
    }
  };

  const captureAnimatedScreen = async () => {
    const uri = await captureScreen({ format: 'png' });
    setAnimatedScreenUri(uri);
  };

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
          Verifies masking of sensitive content across colors, overflow,
          scrolling, clipping, hardware surfaces, and animations.
        </Text>

        {/* 1. Basic masked text with named, #RGB, #RRGGBBAA and rgb() colors */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            1. Color Normalization (Named, #RGB, #RRGGBBAA, rgb())
          </Text>
          <Text style={styles.cardDesc}>
            Sensitive content covered with solid masks using different color
            formats:
          </Text>

          <ViewShot ref={basicColorsRef} style={styles.testContainer}>
            <View style={styles.row}>
              <Text style={styles.label}>Named (red): </Text>
              <MaskView maskColor="red">
                <Text style={styles.sensitiveText}>SSN: 123-45-6789</Text>
              </MaskView>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>#RGB (#00F): </Text>
              <MaskView maskColor="#00F">
                <Text style={styles.sensitiveText}>PIN: 9876</Text>
              </MaskView>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>#RRGGBBAA (#00800080): </Text>
              <MaskView maskColor="#00800080">
                <Text style={styles.sensitiveText}>
                  Credit Card: 4111-2222-3333-4444
                </Text>
              </MaskView>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>rgb() (rgba(255, 165, 0, 0.9)): </Text>
              <MaskView maskColor="rgba(255, 165, 0, 0.9)">
                <Text style={styles.sensitiveText}>Password: secretP@ss!</Text>
              </MaskView>
            </View>
          </ViewShot>

          <TouchableOpacity style={styles.button} onPress={captureBasic}>
            <Text style={styles.buttonText}>📸 Capture Color Test</Text>
          </TouchableOpacity>
          {basicUri && (
            <PreviewContainer capturedUri={basicUri} title="Colors Capture" />
          )}
        </View>

        {/* 2. Children overflowing MaskView bounds */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            2. Children Overflowing MaskView Bounds
          </Text>
          <Text style={styles.cardDesc}>
            Ensures that child content extending outside the MaskView bounds
            cannot leak into the snapshot:
          </Text>

          <ViewShot ref={overflowRef} style={styles.testContainer}>
            <Text style={styles.note}>
              MaskView size: 140x35. Child width: 280px.
            </Text>
            <View style={styles.overflowWrapper}>
              <MaskView maskColor="#000000" style={styles.overflowMask}>
                <Text style={styles.overflowChild}>
                  LEAK_CHECK_SECRET_THAT_MUST_NOT_BE_VISIBLE_IN_CAPTURE
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
              title="Overflow Capture"
            />
          )}
        </View>

        {/* 3. MaskView inside ScrollView (Normal scroll & snapshotContentContainer) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>3. MaskView Inside ScrollView</Text>
          <Text style={styles.cardDesc}>
            Tests coordinate calculation both for normal visible scroll view and
            with snapshotContentContainer:
          </Text>

          <ViewShot ref={scrollViewCaptureRef} style={styles.scrollViewWrapper}>
            <ScrollView
              style={styles.innerScrollView}
              contentContainerStyle={styles.innerScrollContent}
              nestedScrollEnabled
            >
              <View style={styles.scrollItem}>
                <Text>Item 1 (Visible Content)</Text>
              </View>
              <View style={styles.scrollItem}>
                <MaskView maskColor="#1E88E5">
                  <Text style={styles.sensitiveText}>
                    Masked Secret in Item 2
                  </Text>
                </MaskView>
              </View>
              <View style={styles.scrollItem}>
                <Text>Item 3 (Middle Content)</Text>
              </View>
              <View style={styles.scrollItem}>
                <MaskView maskColor="#E53935">
                  <Text style={styles.sensitiveText}>
                    Masked Secret in Item 4
                  </Text>
                </MaskView>
              </View>
              <View style={styles.scrollItem}>
                <Text>Item 5 (Lower Content)</Text>
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
              title="Normal Scroll Capture"
            />
          )}
          {scrollFullUri && (
            <PreviewContainer
              capturedUri={scrollFullUri}
              title="Full Scroll Container Capture"
            />
          )}
        </View>

        {/* 4. MaskView inside overflow: hidden clipped container */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            4. Ancestor Clipping (overflow: hidden)
          </Text>
          <Text style={styles.cardDesc}>
            Verifies that masks partially outside an ancestor with overflow:
            hidden do not paint outside the container:
          </Text>

          <ViewShot ref={clippedContainerRef} style={styles.testContainer}>
            <View style={styles.clippedAncestor}>
              <Text style={styles.clippedAncestorText}>
                Ancestor Container (height: 70, overflow: hidden)
              </Text>
              <MaskView maskColor="#8E24AA" style={styles.clippedMask}>
                <Text style={styles.sensitiveText}>
                  Partially Visible Masked Content
                </Text>
              </MaskView>
            </View>
            <View style={styles.adjacentBox}>
              <Text>Adjacent Content (Must NOT be covered by purple mask)</Text>
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
              title="Clipped Ancestor Capture"
            />
          )}
        </View>

        {/* 5. MaskView beside TextureView / Hardware Surface */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            5. MaskView Beside TextureView / Video
          </Text>
          <Text style={styles.cardDesc}>
            Verifies that hardware surfaces (TextureView) composite correctly
            beside MaskViews without bleeding:
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
                <MaskView maskColor="#000000" style={styles.maskInSplit}>
                  <Text style={styles.sensitiveText}>
                    Private Info Beside Video
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
              title="TextureView & Mask Capture"
            />
          )}
        </View>

        {/* 6. captureScreen during animation */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            6. captureScreen During Active Animation
          </Text>
          <Text style={styles.cardDesc}>
            Tests PixelCopy frame alignment during an active continuous
            animation:
          </Text>

          <View style={styles.animationContainer}>
            <Animated.View
              style={[
                styles.animatedBox,
                { transform: [{ translateX: animatedTranslate }] },
              ]}
            >
              <MaskView maskColor="#D81B60" style={styles.animatedMask}>
                <Text style={styles.sensitiveText}>Animated Secret</Text>
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
              title="captureScreen Result"
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
    backgroundColor: '#F5F7FA',
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
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 12,
  },
  testContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
    minWidth: 120,
  },
  sensitiveText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  note: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 6,
  },
  overflowWrapper: {
    width: 200,
    height: 50,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 4,
  },
  overflowMask: {
    width: 140,
    height: 35,
    backgroundColor: '#000000',
  },
  overflowChild: {
    width: 280,
    color: '#FF0000',
    fontSize: 12,
  },
  scrollViewWrapper: {
    height: 180,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E0',
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
    padding: 12,
    backgroundColor: '#EDF2F7',
    borderRadius: 6,
    marginVertical: 4,
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
    color: '#4A5568',
    marginBottom: 4,
  },
  clippedMask: {
    position: 'absolute',
    top: 40,
    left: 10,
    width: 220,
    height: 60,
    backgroundColor: '#8E24AA',
  },
  adjacentBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFF9C4',
    borderRadius: 6,
  },
  splitRow: {
    flexDirection: 'row',
    height: 100,
    borderRadius: 6,
    overflow: 'hidden',
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
    flex: 1,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  maskInSplit: {
    padding: 8,
    borderRadius: 4,
  },
  animationContainer: {
    height: 60,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  animatedBox: {
    width: 140,
  },
  animatedMask: {
    borderRadius: 4,
    padding: 6,
  },
  button: {
    backgroundColor: '#007AFF',
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
    fontWeight: '600',
    fontSize: 13,
  },
});

export default MaskViewTestScreen;
