import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import {
  TestScreenLayout,
  InfoCard,
  ControlsCard,
  useViewShotCapture,
} from '../components/shared';

const FSTestScreen: React.FC = () => {
  const [saveFormat, setSaveFormat] = useState<'png' | 'jpg' | 'webm'>('png');
  const [quality, setQuality] = useState<number>(0.8);

  const {
    capturedUri,
    isCapturing,
    viewShotRef,
    startCapture: baseStartCapture,
    resetCapture,
  } = useViewShotCapture();

  const startCapture = async () => {
    await baseStartCapture({
      format: saveFormat,
      quality: quality,
      result: 'tmpfile', // Force file system save
    });
  };

  const cycleFormat = () => {
    const formats: Array<'png' | 'jpg' | 'webm'> = ['png', 'jpg', 'webm'];
    const currentIndex = formats.indexOf(saveFormat);
    const nextIndex = (currentIndex + 1) % formats.length;
    setSaveFormat(formats[nextIndex]);
    resetCapture();
  };

  const cycleQuality = () => {
    const qualities = [0.3, 0.5, 0.8, 1.0];
    const currentIndex = qualities.indexOf(quality);
    const nextIndex = (currentIndex + 1) % qualities.length;
    setQuality(qualities[nextIndex]);
    resetCapture();
  };

  return (
    <TestScreenLayout
      title="File System Test"
      description="Test file system operations with different formats and quality settings"
      emoji="💾"
      scrollViewTestID="fsScrollView"
      infoCards={[
        {
          title: '🎯 What this tests:',
          content:
            '• File system save (tmpfile)\n• Different image formats\n• Quality compression\n• File path handling',
        },
        {
          title: '📱 Platform info:',
          content: `Platform: ${Platform.OS}\nVersion: ${Platform.Version}\nTest shows actual file paths and sizes`,
        },
      ]}
      controlButtons={[
        {
          label: `📄 Format: ${saveFormat.toUpperCase()}`,
          onPress: cycleFormat,
          backgroundColor: '#007AFF',
        },
        {
          label: `🎚️ Quality: ${Math.round(quality * 100)}%`,
          onPress: cycleQuality,
          backgroundColor: '#28a745',
        },
      ]}
      testSectionTitle={`💾 File System Test (${saveFormat} @ ${Math.round(
        quality * 100,
      )}%):`}
      viewShotRef={viewShotRef}
      testContent={
        <View style={styles.testContent}>
          <Text style={styles.testTitle}>📄 Test Document</Text>
          <View style={styles.documentHeader}>
            <Text style={styles.docInfo}>Format: {saveFormat}</Text>
            <Text style={styles.docInfo}>
              Quality: {Math.round(quality * 100)}%
            </Text>
            <Text style={styles.docInfo}>Platform: {Platform.OS}</Text>
          </View>

          <View style={styles.documentContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔍 Details:</Text>
              <Text style={styles.sectionText}>
                This test captures content to the file system using different
                formats and quality settings.
              </Text>
            </View>

            <View style={styles.colorSamples}>
              <Text style={styles.samplesTitle}>🎨 Color Samples:</Text>
              <View style={styles.colorRow}>
                <View
                  style={[styles.colorSample, { backgroundColor: '#FF6B6B' }]}
                />
                <View
                  style={[styles.colorSample, { backgroundColor: '#4ECDC4' }]}
                />
                <View
                  style={[styles.colorSample, { backgroundColor: '#45B7D1' }]}
                />
                <View
                  style={[styles.colorSample, { backgroundColor: '#96CEB4' }]}
                />
                <View
                  style={[styles.colorSample, { backgroundColor: '#FECA57' }]}
                />
              </View>
            </View>

            <View style={styles.textSample}>
              <Text style={styles.sampleTitle}>📝 Text Sample:</Text>
              <Text style={styles.sampleText}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quality
                setting affects compression.
              </Text>
            </View>
          </View>
        </View>
      }
      captureButton={{
        onPress: startCapture,
        isCapturing: isCapturing,
        captureText: '💾 Save to File System',
        capturingText: '💾 Saving...',
      }}
      capturedUri={capturedUri}
      previewConfig={{
        title: '✅ File Saved:',
        noteText: `Format: ${saveFormat} | Quality: ${Math.round(
          quality * 100,
        )}%\nFile saved to temporary directory`,
      }}
    />
  );
};

const styles = StyleSheet.create({
  testContent: {
    padding: 20,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  documentHeader: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  docInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  documentContent: {
    gap: 15,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  colorSamples: {
    alignItems: 'center',
  },
  samplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorSample: {
    width: 25,
    height: 25,
    borderRadius: 4,
  },
  textSample: {
    backgroundColor: '#F0F8FF',
    padding: 10,
    borderRadius: 6,
  },
  sampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  sampleText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 15,
  },
});

export default FSTestScreen;
