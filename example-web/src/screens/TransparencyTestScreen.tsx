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

const TransparencyTestScreen: React.FC<Props> = ({goBack}) => {
  const solidRef = useRef<View>(null);
  const transparentRef = useRef<View>(null);
  const [solidUri, setSolidUri] = useState<string | null>(null);
  const [transparentUri, setTransparentUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const captureSolid = async () => {
    setIsCapturing(true);
    try {
      if (solidRef.current) {
        const uri = await captureRef(solidRef.current, {
          format: "png",
          quality: 1,
          result: "data-uri",
        });
        setSolidUri(uri);
      }
    } catch (err) {
      console.error("Failed to capture solid:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  const captureTransparent = async () => {
    setIsCapturing(true);
    try {
      if (transparentRef.current) {
        const uri = await captureRef(transparentRef.current, {
          format: "png",
          quality: 1,
          result: "data-uri",
        });
        setTransparentUri(uri);
      }
    } catch (err) {
      console.error("Failed to capture transparent:", err);
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
        <Text style={styles.headerTitle}>⚪ Transparency Test</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ About Transparency</Text>
          <Text style={styles.infoText}>
            PNG format supports transparency. This test demonstrates capturing
            views with and without background colors. Note: html2canvas on web
            has some limitations with transparency.
          </Text>
        </View>

        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>With Background Color</Text>
          <View ref={solidRef} style={styles.solidView}>
            <Text style={styles.solidText}>🎨 Solid Background</Text>
            <Text style={styles.solidSubtext}>
              This view has a white background color
            </Text>
          </View>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={captureSolid}
            disabled={isCapturing}
          >
            <Text style={styles.captureButtonText}>
              {isCapturing ? "⏳ Capturing..." : "📸 Capture Solid"}
            </Text>
          </TouchableOpacity>
          {solidUri && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Result (on checkered bg):</Text>
              <View style={styles.checkerboard}>
                <Image source={{uri: solidUri}} style={styles.resultImage} />
              </View>
            </View>
          )}
        </View>

        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Without Background Color</Text>
          <View style={styles.transparentContainer}>
            <View ref={transparentRef} style={styles.transparentView}>
              <Text style={styles.transparentText}>✨ Transparent</Text>
              <Text style={styles.transparentSubtext}>
                This view has no background color
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.captureButton, styles.captureButtonSecondary]}
            onPress={captureTransparent}
            disabled={isCapturing}
          >
            <Text style={styles.captureButtonText}>
              {isCapturing ? "⏳ Capturing..." : "📸 Capture Transparent"}
            </Text>
          </TouchableOpacity>
          {transparentUri && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Result (on checkered bg):</Text>
              <View style={styles.checkerboard}>
                <Image
                  source={{uri: transparentUri}}
                  style={styles.resultImage}
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>📝 Note</Text>
          <Text style={styles.noteText}>
            On web, html2canvas may render some elements with a default
            background. For best results with transparency, use PNG format and
            ensure parent containers don't have opaque backgrounds.
          </Text>
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
    marginBottom: 24,
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
  testSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  solidView: {
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  solidText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 8,
  },
  solidSubtext: {
    fontSize: 14,
    color: "#666",
  },
  transparentContainer: {
    backgroundColor: "#e0e0e0",
    padding: 2,
    borderRadius: 12,
    marginBottom: 12,
  },
  transparentView: {
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
  },
  transparentText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF6B35",
    marginBottom: 8,
  },
  transparentSubtext: {
    fontSize: 14,
    color: "#333",
  },
  captureButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  captureButtonSecondary: {
    backgroundColor: "#FF6B35",
  },
  captureButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    marginTop: 16,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  checkerboard: {
    backgroundColor: "#ffffff",
    backgroundImage:
      "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  resultImage: {
    width: 250,
    height: 150,
  },
  noteCard: {
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E65100",
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#EF6C00",
    lineHeight: 20,
  },
});

export default TransparencyTestScreen;
