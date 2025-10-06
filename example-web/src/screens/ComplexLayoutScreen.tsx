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

const ComplexLayoutScreen: React.FC<Props> = ({goBack}) => {
  const viewShotRef = useRef<View>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const captureView = async () => {
    setIsCapturing(true);
    try {
      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef.current, {
          format: "png",
          quality: 1,
          result: "data-uri",
        });
        setCapturedUri(uri);
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
        <Text style={styles.headerTitle}>🎨 Complex Layout Test</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🎯 About This Test</Text>
          <Text style={styles.infoText}>
            This demonstrates capturing complex nested layouts with multiple
            styles, flexbox arrangements, borders, shadows, and mixed content.
          </Text>
        </View>

        <View ref={viewShotRef} style={styles.captureArea}>
          <View style={styles.captureContent}>
            <View style={styles.banner}>
              <Text style={styles.bannerText}>🚀 Complex Layout Demo</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statBox, {backgroundColor: "#4CAF50"}]}>
                <Text style={styles.statNumber}>142</Text>
                <Text style={styles.statLabel}>Views</Text>
              </View>
              <View style={[styles.statBox, {backgroundColor: "#2196F3"}]}>
                <Text style={styles.statNumber}>89</Text>
                <Text style={styles.statLabel}>Captures</Text>
              </View>
              <View style={[styles.statBox, {backgroundColor: "#FF9800"}]}>
                <Text style={styles.statNumber}>98%</Text>
                <Text style={styles.statLabel}>Success</Text>
              </View>
            </View>

            <View style={styles.featureGrid}>
              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>📸</Text>
                <Text style={styles.featureTitle}>High Quality</Text>
                <Text style={styles.featureDesc}>PNG & JPG support</Text>
              </View>
              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>⚡</Text>
                <Text style={styles.featureTitle}>Fast</Text>
                <Text style={styles.featureDesc}>Optimized rendering</Text>
              </View>
              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>🌐</Text>
                <Text style={styles.featureTitle}>Cross-platform</Text>
                <Text style={styles.featureDesc}>iOS, Android, Web</Text>
              </View>
              <View style={styles.featureCard}>
                <Text style={styles.featureIcon}>🎨</Text>
                <Text style={styles.featureTitle}>Stylish</Text>
                <Text style={styles.featureDesc}>All styles preserved</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <Text style={styles.progressTitle}>Capture Progress</Text>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.progressText}>100% Complete</Text>
            </View>

            <View style={styles.listSection}>
              <Text style={styles.listTitle}>✓ Features Captured:</Text>
              {[
                "Nested Views",
                "Multiple Styles",
                "Flexbox Layouts",
                "Shadows & Borders",
                "Text Formatting",
                "Color Gradients",
              ].map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.listBullet} />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Powered by react-native-view-shot + html2canvas
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={captureView}
            disabled={isCapturing}
          >
            <Text style={styles.captureButtonText}>
              {isCapturing
                ? "⏳ Capturing Complex Layout..."
                : "📸 Capture This Layout"}
            </Text>
          </TouchableOpacity>

          {capturedUri && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>✅ Captured Successfully!</Text>
              <Text style={styles.previewSubtitle}>
                All nested elements and styles preserved
              </Text>
              <Image
                source={{uri: capturedUri}}
                style={styles.previewImage}
                resizeMode="contain"
              />
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
  banner: {
    backgroundColor: "#667eea",
    backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  bannerText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  featureCard: {
    width: "calc(50% - 6px)",
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  progressSection: {
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    width: "100%",
    backgroundColor: "#4CAF50",
  },
  progressText: {
    fontSize: 12,
    color: "#666",
  },
  listSection: {
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  listBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginRight: 12,
  },
  listText: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
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
    fontSize: 18,
    fontWeight: "600",
    color: "#34C759",
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  previewImage: {
    width: 350,
    height: 500,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
});

export default ComplexLayoutScreen;
