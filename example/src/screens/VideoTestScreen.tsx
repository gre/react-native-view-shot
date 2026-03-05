import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
  useColorScheme,
  Alert,
  Platform,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { captureRef } from 'react-native-view-shot';
import Video from 'react-native-video';

const sample = require('../broadchurch.mp4');

const VideoTestScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [useGLSurface, setUseGLSurface] = useState(false);
  const [useTextureView, setUseTextureView] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const viewShotRef = useRef<any>(null);

  const onCapture = useCallback((uri: string) => {
    setCapturedUri(uri);
    setIsCapturing(false);
    // Alert removed for E2E testing
  }, []);

  const onCaptureFailure = useCallback((error: Error) => {
    setIsCapturing(false);
    // Alert removed for E2E testing
  }, []);

  const startCapture = useCallback(async () => {
    if (!viewShotRef.current || !videoLoaded) {
      // Alert removed for E2E testing
      return;
    }

    setIsCapturing(true);
    setCapturedUri(null);

    try {
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 0.8,
        ...(useGLSurface && Platform.OS === 'android'
          ? { handleGLSurfaceViewOnAndroid: true }
          : {}),
      });
      onCapture(uri);
    } catch (error) {
      onCaptureFailure(error as Error);
    }
  }, [videoLoaded, useGLSurface, onCapture, onCaptureFailure]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1C1C1E' : '#F2F2F7',
  };

  const captureOptions = useGLSurface
    ? { handleGLSurfaceViewOnAndroid: true }
    : undefined;

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={styles.scrollView} testID="videoScrollView">
        <View style={styles.content}>
          <Text style={styles.emoji}>📹</Text>
          <Text style={styles.title}>Video Capture Test</Text>
          <Text style={styles.description}>
            Test capturing video players with different surface types and
            continuous capture mode
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>🎯 What this tests:</Text>
            <Text style={styles.cardText}>
              • Video player capture{'\n'}• TextureView vs SurfaceView (Android)
              {'\n'}• Continuous capture mode{'\n'}• GL Surface handling option
            </Text>
          </View>

          <View style={styles.controlsCard}>
            <Text style={styles.cardTitle}>⚙️ Controls:</Text>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                { backgroundColor: useGLSurface ? '#007AFF' : '#999' },
              ]}
              onPress={() => setUseGLSurface(!useGLSurface)}
            >
              <Text style={styles.toggleText}>
                {useGLSurface ? '✅' : '❌'} GL Surface Handling (Android)
              </Text>
            </TouchableOpacity>

            {Platform.OS === 'android' && (
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  { backgroundColor: useTextureView ? '#007AFF' : '#17a2b8' },
                ]}
                onPress={() => {
                  setUseTextureView(!useTextureView);
                  setVideoLoaded(false);
                  setCapturedUri(null);
                }}
              >
                <Text style={styles.toggleText}>
                  {useTextureView ? '📱 TextureView' : '🖥️ SurfaceView'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.videoContainer}>
            <Text style={styles.sectionTitle}>
              📹 Video Player (
              {Platform.OS === 'android'
                ? useTextureView
                  ? 'TextureView'
                  : 'SurfaceView'
                : 'AVPlayerLayer'}
              ):
            </Text>

            <ViewShot ref={viewShotRef} style={styles.videoCapture}>
              <View style={styles.videoWrapper}>
                <Text style={styles.videoLabel}>
                  {!videoLoaded ? '⏳ Loading...' : '▶️ Playing'}
                </Text>
                <Video
                  source={sample}
                  style={styles.video}
                  volume={0}
                  repeat
                  resizeMode="cover"
                  paused={false}
                  onLoad={() => setVideoLoaded(true)}
                  onError={error => {
                    console.log('Video error:', error);
                    // Alert removed for E2E testing
                  }}
                  {...(Platform.OS === 'android' ? { useTextureView } : {})}
                />
              </View>
            </ViewShot>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isCapturing
                  ? '#999'
                  : !videoLoaded
                    ? '#6c757d'
                    : '#007AFF',
              },
            ]}
            onPress={startCapture}
            disabled={isCapturing || !videoLoaded}
            testID="capture-button"
            accessible={true}
            accessibilityLabel="capture-button"
          >
            <Text style={styles.buttonText}>
              {isCapturing
                ? '📹 Capturing...'
                : !videoLoaded
                  ? '⏳ Video Loading...'
                  : '📹 Capture Video Frame'}
            </Text>
          </TouchableOpacity>

          {capturedUri && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>✅ Video Frame Captured:</Text>
              <Image
                source={{ uri: capturedUri }}
                style={styles.previewImage}
                fadeDuration={0}
              />
              <Text style={styles.uriText} numberOfLines={2}>
                {capturedUri}
              </Text>
              <Text style={styles.noteText}>
                Note: This should show the current video frame{'\n'}
                {useGLSurface && Platform.OS === 'android'
                  ? 'With GL Surface handling enabled'
                  : 'With standard surface handling'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  controlsCard: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  toggleButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  videoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  videoCapture: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 10,
  },
  videoWrapper: {
    marginBottom: 10,
    alignItems: 'center',
  },
  videoLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  video: {
    width: 180,
    height: 90,
    borderRadius: 4,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#28a745',
  },
  previewImage: {
    width: 200,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  uriText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  noteText: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default VideoTestScreen;
