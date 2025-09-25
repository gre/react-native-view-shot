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
import { WebView } from 'react-native-webview';

const WebViewTestScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [webviewUrl, setWebviewUrl] = useState(
    'https://github.com/gre/react-native-view-shot',
  );
  const [captureMode, setCaptureMode] = useState<'continuous' | 'manual'>(
    'manual',
  );
  const [webviewState, setWebviewState] = useState({
    loading: true,
    error: null as string | null,
    loaded: false,
  });

  const webviewRef = useRef<any>(null);

  const onCapture = useCallback((uri: string) => {
    setCapturedUri(uri);
    setIsCapturing(false);
    // Alert removed for E2E testing
  }, []);

  const onCaptureFailure = useCallback((error: Error) => {
    setIsCapturing(false);
    // Alert removed for E2E testing
  }, []);

  const handleManualCapture = useCallback(() => {
    if (!webviewRef.current) {
      // Alert removed for E2E testing
      return;
    }

    setIsCapturing(true);
    setCapturedUri(null);

    captureRef(webviewRef, {
      format: 'png',
      quality: 0.8,
    })
      .then(onCapture)
      .catch(onCaptureFailure);
  }, [onCapture, onCaptureFailure]);

  const toggleUrl = () => {
    const urls = [
      'https://github.com/gre/react-native-view-shot',
      'https://reactnative.dev',
      'https://google.com',
      'https://example.com', // Simple test page
    ];
    const currentIndex = urls.indexOf(webviewUrl);
    const nextIndex = (currentIndex + 1) % urls.length;
    setWebviewUrl(urls[nextIndex]);
    setCapturedUri(null);
    setWebviewState({ loading: true, error: null, loaded: false });
  };

  const onWebViewLoad = () => {
    console.log('WebView loaded successfully');
    setWebviewState({ loading: false, error: null, loaded: true });
  };

  const onWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log('WebView error:', nativeEvent);
    setWebviewState({
      loading: false,
      error: nativeEvent.description || 'Unknown error',
      loaded: false,
    });
  };

  const onWebViewLoadStart = () => {
    console.log('WebView load start');
    setWebviewState({ loading: true, error: null, loaded: false });
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1C1C1E' : '#F2F2F7',
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={styles.scrollView} testID="webviewScrollView">
        <View style={styles.content}>
          <Text style={styles.emoji}>🌐</Text>
          <Text style={styles.title}>WebView Capture Test</Text>
          <Text style={styles.description}>
            Test capturing WebView content - This should reproduce iOS bug #577!
          </Text>

          {Platform.OS === 'ios' && (
            <View style={[styles.warningCard, { backgroundColor: '#FFF3CD' }]}>
              <Text style={styles.cardTitle}>⚠️ Expected iOS Bug:</Text>
              <Text style={styles.cardText}>
                Issue #577: WebView capture fails on iOS with New Architecture.
                {'\n'}
                This test should reproduce that bug!
              </Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>🎯 What this tests:</Text>
            <Text style={styles.cardText}>
              • WebView content capture{'\n'}• Continuous vs manual capture
              modes{'\n'}• Web content rendering{'\n'}• iOS vs Android
              compatibility
            </Text>
          </View>

          <View style={styles.controlsCard}>
            <Text style={styles.cardTitle}>⚙️ Controls:</Text>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor:
                    captureMode === 'continuous' ? '#FF3B30' : '#007AFF',
                },
              ]}
              onPress={() => {
                const newMode =
                  captureMode === 'continuous' ? 'manual' : 'continuous';
                // Alert removed for E2E testing
                setCaptureMode(newMode);
                setCapturedUri(null);
              }}
            >
              <Text style={styles.toggleText}>
                {captureMode === 'continuous'
                  ? '⚠️ Continuous (iOS Bug!)'
                  : '📸 Manual Capture'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleButton, { backgroundColor: '#6c757d' }]}
              onPress={toggleUrl}
            >
              <Text style={styles.toggleText}>🔄 Change URL</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.webviewContainer}>
            <Text style={styles.sectionTitle}>
              🌐 WebView ({captureMode} mode):
            </Text>
            <Text style={styles.urlText} numberOfLines={1}>
              {webviewUrl}
            </Text>

            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                Status:{' '}
                {webviewState.loading
                  ? '⏳ Loading...'
                  : webviewState.error
                    ? `❌ Error: ${webviewState.error}`
                    : webviewState.loaded
                      ? '✅ Loaded'
                      : '⏸️ Ready'}
              </Text>
            </View>

            <ViewShot
              ref={webviewRef}
              onCapture={captureMode === 'continuous' ? onCapture : undefined}
              onCaptureFailure={
                captureMode === 'continuous' ? onCaptureFailure : undefined
              }
              captureMode={
                captureMode === 'continuous' ? 'continuous' : undefined
              }
              style={styles.webviewCapture}
            >
              <WebView
                source={{ uri: webviewUrl }}
                style={styles.webview}
                startInLoadingState={true}
                scalesPageToFit={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                onLoad={onWebViewLoad}
                onError={onWebViewError}
                onLoadStart={onWebViewLoadStart}
                onHttpError={syntheticEvent => {
                  const { nativeEvent } = syntheticEvent;
                  console.log('WebView HTTP error:', nativeEvent);
                }}
                renderError={errorName => (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>❌ WebView Error</Text>
                    <Text style={styles.errorDetail}>{errorName}</Text>
                  </View>
                )}
                renderLoading={() => (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>
                      ⏳ Loading WebView...
                    </Text>
                  </View>
                )}
              />
            </ViewShot>
          </View>

          {captureMode === 'manual' && (
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: isCapturing ? '#999' : '#007AFF' },
              ]}
              onPress={handleManualCapture}
              disabled={isCapturing}
            >
              <Text style={styles.buttonText}>
                {isCapturing ? '🌐 Capturing...' : '📸 Capture WebView'}
              </Text>
            </TouchableOpacity>
          )}

          {capturedUri && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>✅ WebView Captured:</Text>
              <Image
                source={{ uri: capturedUri }}
                style={styles.previewImage}
                fadeDuration={0}
              />
              <Text style={styles.uriText} numberOfLines={2}>
                {capturedUri}
              </Text>
              <Text style={styles.noteText}>
                {Platform.OS === 'ios'
                  ? '🎉 Success! Bug #577 might be fixed!'
                  : 'Android WebView capture working as expected'}
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
  warningCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ffc107',
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
  webviewContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  urlText: {
    fontSize: 12,
    color: '#007AFF',
    fontFamily: 'monospace',
    marginBottom: 15,
    textAlign: 'center',
  },
  webviewCapture: {
    width: 300,
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  webview: {
    flex: 1,
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
    height: 250,
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
  statusContainer: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    width: '100%',
  },
  statusText: {
    fontSize: 14,
    color: '#495057',
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E53E3E',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 14,
    color: '#C53030',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
});

export default WebViewTestScreen;
