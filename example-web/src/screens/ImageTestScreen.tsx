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

const ImageTestScreen: React.FC<Props> = ({goBack}) => {
  const viewShotRef = useRef<View>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [format, setFormat] = useState<"png" | "jpg">("png");

  const captureView = async () => {
    setIsCapturing(true);
    try {
      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef.current, {
          format,
          quality: 1.0, // Maximum quality
          result: "data-uri",
          // For web, we can add pixelRatio for higher resolution
          ...(typeof window !== "undefined" && {pixelRatio: 4}),
        });
        setCapturedUri(uri);
        console.log("Captured with format:", format);
      }
    } catch (err) {
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
        <Text style={styles.headerTitle}>🖼️ Image Capture Test</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📸 About Image Capture</Text>
          <Text style={styles.infoText}>
            This test demonstrates capturing views that contain real images from
            external URLs. The library can capture both inline images and styled
            elements containing images. Test with different formats (PNG/JPG) to
            see how images are rendered in the output.
          </Text>
        </View>

        <View ref={viewShotRef} style={styles.captureArea}>
          <View style={styles.captureContent}>
            <Text style={styles.title}>🖼️ Image Gallery</Text>

            <View style={styles.imageCard}>
              <Image
                source={{uri: "/images/test-image-1.jpg"}}
                style={styles.testImage}
                resizeMode="cover"
              />
              <Text style={styles.cardText}>Test Image 1</Text>
            </View>

            <View style={styles.imageCard}>
              <Image
                source={{uri: "/images/test-image-2.jpg"}}
                style={styles.testImage}
                resizeMode="cover"
              />
              <Text style={styles.cardText}>Test Image 2</Text>
            </View>

            <View style={styles.imageCard}>
              <Image
                source={{uri: "/images/test-image-3.jpg"}}
                style={styles.testImage}
                resizeMode="cover"
              />
              <Text style={styles.cardText}>Test Image 3</Text>
            </View>

            <View style={styles.imageCard}>
              <View style={styles.colorBox} />
              <Text style={styles.cardText}>Colored Box (for comparison)</Text>
            </View>

            <View style={styles.gradientBox}>
              <Text style={styles.gradientText}>Gradient Background</Text>
            </View>

            <View style={styles.textCard}>
              <Text style={styles.cardTitle}>📝 Text Content</Text>
              <Text style={styles.cardDescription}>
                All styled elements including borders, shadows, and backgrounds
                are captured by html2canvas.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          <Text style={styles.controlsTitle}>Format Options:</Text>

          <View style={styles.formatRow}>
            <TouchableOpacity
              style={[
                styles.formatButton,
                format === "png" && styles.formatButtonActive,
              ]}
              onPress={() => setFormat("png")}
            >
              <Text
                style={[
                  styles.formatButtonText,
                  format === "png" && styles.formatButtonTextActive,
                ]}
              >
                PNG
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.formatButton,
                format === "jpg" && styles.formatButtonActive,
              ]}
              onPress={() => setFormat("jpg")}
            >
              <Text
                style={[
                  styles.formatButtonText,
                  format === "jpg" && styles.formatButtonTextActive,
                ]}
              >
                JPG
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={captureView}
            disabled={isCapturing}
          >
            <Text style={styles.captureButtonText}>
              {isCapturing
                ? "⏳ Capturing..."
                : `📸 Capture as ${format.toUpperCase()}`}
            </Text>
          </TouchableOpacity>

          {capturedUri && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>✅ Captured Result:</Text>
              <Image
                source={{uri: capturedUri}}
                style={styles.previewImage}
                resizeMode="contain"
              />
              <Text style={styles.previewInfo}>
                Format: {format.toUpperCase()} | Quality: 0.9
              </Text>
            </View>
          )}
        </View>
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
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1565C0",
    lineHeight: 20,
  },
  captureArea: {
    marginBottom: 20,
  },
  captureContent: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
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
  colorBox: {
    width: 50,
    height: 50,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    marginRight: 16,
  },
  testImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginRight: 16,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  gradientBox: {
    padding: 20,
    borderRadius: 8,
    marginVertical: 12,
    backgroundColor: "#667eea",
    backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    alignItems: "center",
  },
  gradientText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  textCard: {
    padding: 16,
    backgroundColor: "#FFF9C4",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FBC02D",
    marginTop: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F57F17",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#F57F17",
    lineHeight: 20,
  },
  controls: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controlsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  formatRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  formatButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#007AFF",
    alignItems: "center",
  },
  formatButtonActive: {
    backgroundColor: "#007AFF",
  },
  formatButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  formatButtonTextActive: {
    color: "#ffffff",
  },
  captureButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  captureButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  previewContainer: {
    marginTop: 20,
    alignItems: "center",
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
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
  },
  previewInfo: {
    fontSize: 12,
    color: "#666",
  },
});

export default ImageTestScreen;
