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
  Modal,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { captureRef } from 'react-native-view-shot';

const ModalTestScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<
    'alert' | 'overlay' | 'fullscreen'
  >('alert');

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
    if (!viewShotRef.current) {
      // Alert removed for E2E testing
      return;
    }

    setIsCapturing(true);
    setCapturedUri(null);

    try {
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 0.8,
      });
      onCapture(uri);
    } catch (error) {
      onCaptureFailure(error as Error);
    }
  }, [onCapture, onCaptureFailure]);

  const cycleModalType = () => {
    const types: Array<'alert' | 'overlay' | 'fullscreen'> = [
      'alert',
      'overlay',
      'fullscreen',
    ];
    const currentIndex = types.indexOf(modalType);
    const nextIndex = (currentIndex + 1) % types.length;
    setModalType(types[nextIndex]);
    setCapturedUri(null);
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'alert':
        return (
          <View style={styles.alertModal}>
            <Text style={styles.alertTitle}>⚠️ Alert Modal</Text>
            <Text style={styles.alertMessage}>
              This is a simulated alert modal with important information.
            </Text>
            <View style={styles.alertButtons}>
              <TouchableOpacity style={styles.alertButton}>
                <Text style={styles.alertButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertButton, styles.primaryButton]}
              >
                <Text
                  style={[styles.alertButtonText, styles.primaryButtonText]}
                >
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'overlay':
        return (
          <View style={styles.overlayModal}>
            <View style={styles.overlayHeader}>
              <Text style={styles.overlayTitle}>📋 Overlay Modal</Text>
              <TouchableOpacity style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.overlayContent}>
              <Text style={styles.overlayText}>
                This is an overlay modal with custom content.
              </Text>
              <View style={styles.overlayItems}>
                {['Item 1', 'Item 2', 'Item 3'].map((item, index) => (
                  <View key={index} style={styles.overlayItem}>
                    <Text style={styles.overlayItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );

      case 'fullscreen':
        return (
          <View style={styles.fullscreenModal}>
            <View style={styles.fullscreenHeader}>
              <Text style={styles.fullscreenTitle}>📱 Fullscreen Modal</Text>
              <TouchableOpacity style={styles.fullscreenClose}>
                <Text style={styles.fullscreenCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.fullscreenContent}>
              <Text style={styles.fullscreenText}>
                This is a fullscreen modal with scrollable content.
              </Text>
              {Array.from({ length: 5 }).map((_, index) => (
                <View key={index} style={styles.fullscreenSection}>
                  <Text style={styles.smallSectionTitle}>
                    Section {index + 1}
                  </Text>
                  <Text style={styles.sectionContent}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        );

      default:
        return null;
    }
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
      <ScrollView style={styles.scrollView} testID="modalScrollView">
        <View style={styles.content}>
          <Text style={styles.emoji}>📱</Text>
          <Text style={styles.title}>Modal Capture Test</Text>
          <Text style={styles.description}>
            Test capturing modal overlays and different modal types
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>🎯 What this tests:</Text>
            <Text style={styles.cardText}>
              • Modal overlay capture{'\n'}• Different modal types{'\n'}•
              Z-index and layering{'\n'}• Complex UI compositions
            </Text>
          </View>

          <View style={styles.controlsCard}>
            <Text style={styles.cardTitle}>⚙️ Controls:</Text>

            <TouchableOpacity
              style={[styles.toggleButton, { backgroundColor: '#007AFF' }]}
              onPress={cycleModalType}
            >
              <Text style={styles.toggleText}>
                📱 Modal:{' '}
                {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                { backgroundColor: modalVisible ? '#FF3B30' : '#28a745' },
              ]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.toggleText}>
                {modalVisible ? '🔴 Hide Modal' : '🟢 Show Modal'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContainer}>
            <Text style={styles.sectionTitle}>
              📱 Modal Test ({modalType}):
            </Text>

            <ViewShot ref={viewShotRef} style={styles.modalCapture}>
              <View style={styles.backgroundContent}>
                <Text style={styles.backgroundText}>Background Content</Text>
                <View style={styles.backgroundElements}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.backgroundElement,
                        {
                          backgroundColor:
                            index % 2 === 0 ? '#E3F2FD' : '#F3E5F5',
                        },
                      ]}
                    >
                      <Text style={styles.elementText}>
                        Element {index + 1}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {modalVisible && (
                <View style={styles.modalOverlay}>{renderModalContent()}</View>
              )}
            </ViewShot>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isCapturing ? '#999' : '#007AFF' },
            ]}
            onPress={startCapture}
            disabled={isCapturing}
          >
            <Text style={styles.buttonText}>
              {isCapturing ? '📱 Capturing...' : '📸 Capture Modal'}
            </Text>
          </TouchableOpacity>

          {capturedUri && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>✅ Modal Captured:</Text>
              <Image
                source={{ uri: capturedUri }}
                style={styles.previewImage}
                fadeDuration={0}
              />
              <Text style={styles.uriText} numberOfLines={2}>
                {capturedUri}
              </Text>
              <Text style={styles.noteText}>
                Modal type: {modalType} ({modalVisible ? 'visible' : 'hidden'})
                {'\n'}This tests modal overlay capture
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
  modalContainer: {
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
  modalCapture: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: 300,
    height: 200,
    position: 'relative',
  },
  backgroundContent: {
    padding: 20,
    height: '100%',
  },
  backgroundText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  backgroundElements: {
    flex: 1,
    justifyContent: 'space-around',
  },
  backgroundElement: {
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  elementText: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  alertButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  alertButtonText: {
    fontSize: 14,
    color: '#333',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  overlayModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 30,
    maxHeight: 140,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  overlayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  overlayContent: {
    padding: 15,
  },
  overlayText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  overlayItems: {
    gap: 5,
  },
  overlayItem: {
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 4,
  },
  overlayItemText: {
    fontSize: 12,
    color: '#333',
  },
  fullscreenModal: {
    backgroundColor: '#FFFFFF',
    margin: 10,
    borderRadius: 8,
    flex: 1,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  fullscreenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  fullscreenClose: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  fullscreenCloseText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fullscreenContent: {
    flex: 1,
    padding: 15,
  },
  fullscreenText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  fullscreenSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
  },
  smallSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionContent: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
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
    height: 130,
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

export default ModalTestScreen;
