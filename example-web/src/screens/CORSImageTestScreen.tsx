import React, {useRef, useState} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import {captureRef} from "react-native-view-shot";

interface Props {
  goBack: () => void;
}

// Cross-origin image URLs (these servers support CORS)
const CROSS_ORIGIN_IMAGES = [
  {
    uri: "https://picsum.photos/id/237/200/200",
    label: "picsum.photos (CORS enabled)",
  },
  {
    uri: "https://picsum.photos/id/1025/200/200",
    label: "picsum.photos (CORS enabled)",
  },
];

const CORSImageTestScreen: React.FC<Props> = ({goBack}) => {
  const viewShotRef = useRef<View>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

  const allImagesLoaded =
    Object.keys(imagesLoaded).length === CROSS_ORIGIN_IMAGES.length &&
    Object.values(imagesLoaded).every(Boolean);

  const captureView = async () => {
    setIsCapturing(true);
    setError(null);
    try {
      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef.current, {
          format: "png",
          quality: 1.0,
          result: "data-uri",
        });
        setCapturedUri(uri);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error("Failed to capture:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CORS Image Capture Test</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About CORS Image Capture</Text>
          <Text style={styles.infoText}>
            This test verifies that cross-origin images are captured correctly
            using html2canvas with the useCORS option. Without useCORS, images
            from different domains would appear blank in the capture.
          </Text>
        </View>

        <View ref={viewShotRef} style={styles.captureArea}>
          <Text style={styles.title}>Cross-Origin Images</Text>

          {CROSS_ORIGIN_IMAGES.map((img, index) => (
            <View key={img.uri} style={styles.imageCard}>
              <Image
                source={{uri: img.uri}}
                style={styles.testImage}
                resizeMode="cover"
                onLoad={() =>
                  setImagesLoaded(prev => ({...prev, [index]: true}))
                }
              />
              <View style={styles.imageInfo}>
                <Text style={styles.cardText}>{img.label}</Text>
                <Text style={styles.statusText}>
                  {imagesLoaded[index] ? "Loaded" : "Loading..."}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.localImageCard}>
            <Image
              source={{uri: "/images/test-image-1.jpg"}}
              style={styles.testImage}
              resizeMode="cover"
            />
            <View style={styles.imageInfo}>
              <Text style={styles.cardText}>Same-origin (local)</Text>
              <Text style={styles.statusText}>Reference image</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.captureButton,
            !allImagesLoaded && styles.captureButtonDisabled,
          ]}
          onPress={captureView}
          disabled={isCapturing || !allImagesLoaded}
        >
          <Text style={styles.captureButtonText}>
            {isCapturing
              ? "Capturing..."
              : !allImagesLoaded
                ? "Waiting for images to load..."
                : "Capture with CORS images"}
          </Text>
        </TouchableOpacity>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Capture Error:</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {capturedUri && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Captured Result:</Text>
            <Image
              source={{uri: capturedUri}}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E65100",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#BF360C",
    lineHeight: 20,
  },
  captureArea: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  imageCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 12,
  },
  localImageCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    marginBottom: 12,
  },
  testImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: "#e0e0e0",
  },
  imageInfo: {
    flex: 1,
  },
  cardText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#666",
  },
  captureButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  captureButtonDisabled: {
    backgroundColor: "#999",
  },
  captureButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C62828",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: "#B71C1C",
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34C759",
    marginBottom: 12,
  },
  previewImage: {
    width: 300,
    height: 400,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
});

export default CORSImageTestScreen;
