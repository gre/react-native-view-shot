import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

const BasicTestScreen: React.FC = () => {
  const viewShotRef = useRef(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const captureScreenshot = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef.current, {
          format: 'png',
          quality: 0.8,
        });
        setImageUri(uri);
        console.log('Screenshot saved:', uri);
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} testID="basicTestScrollView">
        <ViewShot ref={viewShotRef} style={styles.captureArea}>
          <View style={styles.content}>
            <Text style={styles.title}>📸 Basic ViewShot Test</Text>
            <Text style={styles.subtitle}>
              Testing core react-native-view-shot functionality with New
              Architecture
            </Text>

            <View style={styles.testCard}>
              <Text style={styles.cardTitle}>✅ New Architecture Working</Text>
              <Text style={styles.cardText}>
                Testing Fabric + TurboModules compatibility
              </Text>
            </View>

            <View style={[styles.testCard, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.cardTitle}>📸 ViewShot Ready</Text>
              <Text style={styles.cardText}>
                react-native-view-shot working with New Architecture
              </Text>
            </View>

            <View style={[styles.testCard, { backgroundColor: '#F3E5F5' }]}>
              <Text style={styles.cardTitle}>🔧 Step by Step Testing</Text>
              <Text style={styles.cardText}>
                Organized navigation to test each use case separately
              </Text>
            </View>
          </View>
        </ViewShot>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.button}
            onPress={captureScreenshot}
            testID="capture-button"
            accessible={true}
            accessibilityLabel="capture-button"
          >
            <Text style={styles.buttonText}>📸 Test ViewShot Capture</Text>
          </TouchableOpacity>

          {imageUri && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>✅ Capture Success:</Text>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <Text style={styles.uriText} numberOfLines={2}>
                {imageUri}
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
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  captureArea: {
    margin: 20,
  },
  content: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 22,
  },
  testCard: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  controls: {
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
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
    height: 300,
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
  },
});

export default BasicTestScreen;
