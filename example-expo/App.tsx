import React, {useRef, useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import ViewShot, {captureRef} from "react-native-view-shot";

export default function App() {
  const viewRef = useRef<View>(null);
  const viewShotRef = useRef<ViewShot>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"view-ref" | "viewshot">("view-ref");

  const capture = async (
    format: "png" | "jpg",
    resultType: "data-uri" | "base64" | "tmpfile",
  ) => {
    setResult(null);
    setError(null);
    try {
      let uri: string;
      if (mode === "viewshot" && viewShotRef.current) {
        uri = await viewShotRef.current.capture();
      } else {
        uri = await captureRef(viewRef.current!, {
          format,
          quality: 0.9,
          result: resultType,
        });
      }
      console.log(
        `Captured (${mode}, ${format}, ${resultType}):`,
        uri.substring(0, 80) + "...",
      );

      if (resultType === "base64") {
        const mime = format === "jpg" ? "jpeg" : format;
        setResult(`data:image/${mime};base64,${uri}`);
      } else {
        setResult(uri);
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error("Capture failed:", msg);
      setError(msg);
      Alert.alert("Capture Error", msg);
    }
  };

  const content = (
    <View style={styles.captureContent}>
      <Text style={styles.title}>ViewShot Test</Text>
      <Text style={styles.subtitle}>
        Platform: {Platform.OS} | Mode: {mode}
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Card 1</Text>
        <Text style={styles.cardText}>
          Testing capture with Expo + New Architecture
        </Text>
      </View>
      <View style={[styles.card, {backgroundColor: "#E3F2FD"}]}>
        <Text style={styles.cardTitle}>Card 2</Text>
        <Text style={styles.cardText}>
          This content should appear in the captured image
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>react-native-view-shot</Text>
        <Text style={styles.headerSubtitle}>Expo Example</Text>
      </View>

      {/* Mode toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === "view-ref" && styles.modeButtonActive,
          ]}
          onPress={() => setMode("view-ref")}
        >
          <Text
            style={[
              styles.modeText,
              mode === "view-ref" && styles.modeTextActive,
            ]}
          >
            captureRef(View)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === "viewshot" && styles.modeButtonActive,
          ]}
          onPress={() => setMode("viewshot")}
        >
          <Text
            style={[
              styles.modeText,
              mode === "viewshot" && styles.modeTextActive,
            ]}
          >
            ViewShot.capture()
          </Text>
        </TouchableOpacity>
      </View>

      {/* Capture area */}
      {mode === "viewshot" ? (
        <ViewShot
          ref={viewShotRef}
          options={{format: "png", quality: 0.9, result: "tmpfile"}}
          style={styles.captureArea}
        >
          {content}
        </ViewShot>
      ) : (
        <View ref={viewRef} style={styles.captureArea}>
          {content}
        </View>
      )}

      {/* Capture buttons */}
      <View style={styles.buttons}>
        <Text style={styles.sectionTitle}>Capture Options:</Text>

        <TouchableOpacity
          style={[styles.btn, {backgroundColor: "#007AFF"}]}
          onPress={() => capture("png", "data-uri")}
        >
          <Text style={styles.btnText}>PNG (Data URI)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, {backgroundColor: "#34C759"}]}
          onPress={() => capture("jpg", "data-uri")}
        >
          <Text style={styles.btnText}>JPG (Data URI)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, {backgroundColor: "#FF9500"}]}
          onPress={() => capture("png", "base64")}
        >
          <Text style={styles.btnText}>PNG (Base64)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, {backgroundColor: "#FF3B30"}]}
          onPress={() => capture("png", "tmpfile")}
        >
          <Text style={styles.btnText}>PNG (Tmpfile)</Text>
        </TouchableOpacity>
      </View>

      {/* Error display */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Error:</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Result preview */}
      {result && (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Captured:</Text>
          <Image
            source={{uri: result}}
            style={styles.previewImage}
            resizeMode="contain"
          />
          <Text style={styles.previewUri} numberOfLines={2}>
            {result.substring(0, 100)}...
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  modeToggle: {
    flexDirection: "row",
    margin: 16,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#007AFF",
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: "#007AFF",
  },
  modeText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 13,
  },
  modeTextActive: {
    color: "#fff",
  },
  captureArea: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  captureContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  cardText: {
    fontSize: 14,
    color: "#666",
  },
  buttons: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  btn: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  btnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  errorBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
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
  preview: {
    marginHorizontal: 16,
    marginBottom: 40,
    alignItems: "center",
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34C759",
    marginBottom: 12,
  },
  previewImage: {
    width: 280,
    height: 350,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
    marginBottom: 8,
  },
  previewUri: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
