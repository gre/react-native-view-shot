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
} from 'react-native';
import { captureRef } from 'react-native-view-shot';

const localImage = require('../cat.jpg');
const remoteImage = { uri: 'https://i.imgur.com/5EOyTDQ.jpg' };

const ImageTestScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [useRemoteImage, setUseRemoteImage] = useState(false);
  const [captureFormat, setCaptureFormat] = useState<'png' | 'jpg'>('jpg');
  const [isCapturing, setIsCapturing] = useState(false);

  const imageRef = useRef<Image>(null);

  const onCapture = useCallback(
    (base64: string) => {
      const uri = `data:image/${captureFormat};base64,${base64}`;
      setCapturedUri(uri);
      setIsCapturing(false);
    },
    [captureFormat],
  );

  const onCaptureFailure = useCallback((error: Error) => {
    setIsCapturing(false);
    // Alert removed for E2E testing
  }, []);

  const handleCapture = useCallback(() => {
    if (!imageRef.current) {
      // Alert removed for E2E testing
      return;
    }

    setIsCapturing(true);
    setCapturedUri(null);

    captureRef(imageRef, {
      result: 'base64',
      format: captureFormat,
      quality: 0.8,
    })
      .then(onCapture)
      .catch(onCaptureFailure);
  }, [onCapture, onCaptureFailure, captureFormat]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1C1C1E' : '#F2F2F7',
  };

  const currentImageSource = useRemoteImage ? remoteImage : localImage;

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={styles.scrollView} testID="imageScrollView">
        <View style={styles.content}>
          <Text style={styles.emoji}>🖼️</Text>
          <Text style={styles.title}>Image Capture Test</Text>
          <Text style={styles.description}>
            Test capturing views containing images with different formats and
            sources
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>🎯 What this tests:</Text>
            <Text style={styles.cardText}>
              • Local vs remote image capture{'\n'}• PNG vs JPG format output
              {'\n'}• Base64 result handling{'\n'}• Image component capture with
              captureRef
            </Text>
          </View>

          <View style={styles.controlsCard}>
            <Text style={styles.cardTitle}>⚙️ Controls:</Text>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                { backgroundColor: useRemoteImage ? '#007AFF' : '#999' },
              ]}
              onPress={() => setUseRemoteImage(!useRemoteImage)}
            >
              <Text style={styles.toggleText}>
                {useRemoteImage ? '🌐 Remote Image' : '📱 Local Image'}
              </Text>
            </TouchableOpacity>

            <View style={styles.formatButtons}>
              <TouchableOpacity
                style={[
                  styles.formatButton,
                  {
                    backgroundColor:
                      captureFormat === 'jpg' ? '#007AFF' : '#999',
                  },
                ]}
                onPress={() => setCaptureFormat('jpg')}
              >
                <Text style={styles.toggleText}>JPG</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.formatButton,
                  {
                    backgroundColor:
                      captureFormat === 'png' ? '#007AFF' : '#999',
                  },
                ]}
                onPress={() => setCaptureFormat('png')}
              >
                <Text style={styles.toggleText}>PNG</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>
              📸 Source Image ({useRemoteImage ? 'Remote' : 'Local'}):
            </Text>

            <Image
              ref={imageRef}
              source={currentImageSource}
              style={styles.sourceImage}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isCapturing ? '#999' : '#007AFF' },
            ]}
            onPress={handleCapture}
            disabled={isCapturing}
          >
            <Text style={styles.buttonText}>
              {isCapturing
                ? '📸 Capturing...'
                : `📸 Capture as ${captureFormat.toUpperCase()}`}
            </Text>
          </TouchableOpacity>

          {capturedUri && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>✅ Captured Image:</Text>
              <Image
                source={{ uri: capturedUri }}
                style={styles.capturedImage}
                resizeMode="contain"
              />
              <Text style={styles.formatText}>
                Format: {captureFormat.toUpperCase()} | Result: Base64
              </Text>
              <Text style={styles.uriText} numberOfLines={3}>
                {capturedUri.substring(0, 100)}...
              </Text>
              <Text style={styles.noteText}>
                Note: Captured using captureRef() with base64 result
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
    marginBottom: 10,
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  formatButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formatButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  imageContainer: {
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
  sourceImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
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
  capturedImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  formatText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 5,
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

export default ImageTestScreen;
