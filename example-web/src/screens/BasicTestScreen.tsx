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

const BasicTestScreen: React.FC<Props> = ({goBack}) => {
  const viewShotRef = useRef<View>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureScreenshot = async (
    format: "png" | "jpg",
    result: "base64" | "data-uri",
  ) => {
    setIsCapturing(true);
    setError(null);
    try {
      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef.current, {
          format,
          quality: 0.9,
          result,
        });
        if (result === "base64") {
          const mime = format === "jpg" ? "jpeg" : format;
          setImageUri(`data:image/${mime};base64,${uri}`);
        } else {
          setImageUri(uri);
        }
        console.log(
          "Screenshot captured successfully:",
          uri.substring(0, 100) + "...",
        );
      }
    } catch (err) {
      console.error("Failed to capture screenshot:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadImage = () => {
    if (!imageUri) return;

    const link = document.createElement("a");
    link.href = imageUri;
    link.download = `viewshot-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📸 Basic ViewShot Test</Text>
      </View>

      <View style={styles.content}>
        <View ref={viewShotRef} style={styles.captureArea}>
          <View style={styles.captureContent}>
            <Text style={styles.title}>Hello from View Shot! 👋</Text>
            <Text style={styles.subtitle}>
              This view is being captured using html2canvas on the web
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>✅ Web Support</Text>
              <Text style={styles.cardText}>
                The library automatically detects web platform and uses
                html2canvas
              </Text>
            </View>

            <View style={[styles.card, {backgroundColor: "#E3F2FD"}]}>
              <Text style={styles.cardTitle}>📸 High Quality</Text>
              <Text style={styles.cardText}>
                Supports PNG and JPG formats with quality control
              </Text>
            </View>

            <View style={[styles.card, {backgroundColor: "#F3E5F5"}]}>
              <Text style={styles.cardTitle}>🎨 Styled Content</Text>
              <Text style={styles.cardText}>
                Captures all React Native Web styles accurately
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          <Text style={styles.controlsTitle}>Capture Options:</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={() => captureScreenshot("png", "data-uri")}
              disabled={isCapturing}
            >
              <Text style={styles.buttonText}>
                {isCapturing ? "⏳ Capturing..." : "📸 PNG (Data URI)"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => captureScreenshot("jpg", "data-uri")}
              disabled={isCapturing}
            >
              <Text style={styles.buttonText}>
                {isCapturing ? "⏳ Capturing..." : "📸 JPG (Data URI)"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonOutline]}
              onPress={() => captureScreenshot("png", "base64")}
              disabled={isCapturing}
            >
              <Text style={styles.buttonTextOutline}>PNG (Base64)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonOutline]}
              onPress={() => captureScreenshot("jpg", "base64")}
              disabled={isCapturing}
            >
              <Text style={styles.buttonTextOutline}>JPG (Base64)</Text>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ Error: {error}</Text>
            </View>
          )}

          {imageUri && !error && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>✅ Capture Success!</Text>
              <Image
                source={{uri: imageUri}}
                style={styles.previewImage}
                resizeMode="contain"
              />
              <Text style={styles.uriText} numberOfLines={3}>
                {imageUri.substring(0, 150)}...
              </Text>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={downloadImage}
              >
                <Text style={styles.downloadButtonText}>⬇️ Download Image</Text>
              </TouchableOpacity>
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
  captureArea: {
    marginBottom: 20,
  },
  captureContent: {
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
    lineHeight: 24,
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  cardText: {
    fontSize: 14,
    color: "#666",
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
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#007AFF",
  },
  buttonSecondary: {
    backgroundColor: "#34C759",
  },
  buttonOutline: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonTextOutline: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#ffebee",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ef5350",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
  },
  previewContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#34C759",
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
  uriText: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    fontFamily: "monospace",
    marginBottom: 12,
    maxWidth: 300,
  },
  downloadButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default BasicTestScreen;
