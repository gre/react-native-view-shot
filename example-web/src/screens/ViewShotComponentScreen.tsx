import React, {useRef, useState} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import ViewShot from "react-native-view-shot";

interface Props {
  goBack: () => void;
}

const ViewShotComponentScreen: React.FC<Props> = ({goBack}) => {
  const viewShotRef = useRef<ViewShot>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [autoUri, setAutoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const captureManual = async () => {
    setError(null);
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        setCapturedUri(uri);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error("Capture failed:", msg);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ViewShot Component Test</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About This Test</Text>
          <Text style={styles.infoText}>
            Tests the ViewShot component (not captureRef). This uses the
            component's ref.capture() method and captureMode="mount" for
            automatic capture on first layout.
          </Text>
        </View>

        {/* Manual capture via ref */}
        <Text style={styles.sectionTitle}>Manual Capture (ref.capture())</Text>
        <ViewShot
          ref={viewShotRef}
          options={{format: "png", quality: 0.9, result: "data-uri"}}
          style={styles.captureArea}
        >
          <View style={styles.captureContent}>
            <Text style={styles.title}>ViewShot Manual</Text>
            <Text style={styles.subtitle}>
              This is captured via viewShotRef.current.capture()
            </Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Card A</Text>
              <Text style={styles.cardText}>
                Content inside a ViewShot component
              </Text>
            </View>
            <View style={[styles.card, {backgroundColor: "#E8F5E9"}]}>
              <Text style={styles.cardTitle}>Card B</Text>
              <Text style={styles.cardText}>
                Should appear in the captured image
              </Text>
            </View>
          </View>
        </ViewShot>

        <TouchableOpacity style={styles.captureButton} onPress={captureManual}>
          <Text style={styles.captureButtonText}>Capture via ref</Text>
        </TouchableOpacity>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Error:</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {capturedUri && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Manual Capture Result:</Text>
            <Image
              source={{uri: capturedUri}}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Auto capture on mount */}
        <Text style={styles.sectionTitle}>
          Auto Capture (captureMode="mount")
        </Text>
        <ViewShot
          captureMode="mount"
          onCapture={(uri: string) => setAutoUri(uri)}
          onCaptureFailure={(err: Error) => setError(err.message)}
          options={{format: "png", quality: 0.9, result: "data-uri"}}
          style={styles.captureArea}
        >
          <View style={styles.captureContent}>
            <Text style={styles.title}>ViewShot Auto</Text>
            <Text style={styles.subtitle}>
              Captured automatically on mount via captureMode="mount"
            </Text>
            <View style={[styles.card, {backgroundColor: "#FFF3E0"}]}>
              <Text style={styles.cardTitle}>Auto Card</Text>
              <Text style={styles.cardText}>
                This should be captured automatically when the screen loads
              </Text>
            </View>
          </View>
        </ViewShot>

        {autoUri ? (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Auto Capture Result:</Text>
            <Image
              source={{uri: autoUri}}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <Text style={styles.waitingText}>
            {error
              ? "Auto capture failed (see error above)"
              : "Waiting for auto capture..."}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#f5f5f5"},
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {marginBottom: 12},
  backButtonText: {fontSize: 16, color: "#007AFF", fontWeight: "600"},
  headerTitle: {fontSize: 24, fontWeight: "700", color: "#333"},
  content: {padding: 20},
  infoCard: {
    backgroundColor: "#E8EAF6",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#283593",
    marginBottom: 8,
  },
  infoText: {fontSize: 14, color: "#3949AB", lineHeight: 20},
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  captureArea: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  captureContent: {padding: 20},
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    color: "#666",
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: {fontSize: 16, fontWeight: "600", marginBottom: 4, color: "#333"},
  cardText: {fontSize: 14, color: "#666"},
  captureButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  captureButtonText: {color: "#fff", fontSize: 16, fontWeight: "600"},
  errorBox: {
    backgroundColor: "#FFEBEE",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C62828",
    marginBottom: 4,
  },
  errorText: {fontSize: 13, color: "#B71C1C"},
  previewContainer: {alignItems: "center", marginBottom: 24},
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34C759",
    marginBottom: 12,
  },
  previewImage: {
    width: 300,
    height: 350,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
  waitingText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
    fontStyle: "italic",
  },
});

export default ViewShotComponentScreen;
