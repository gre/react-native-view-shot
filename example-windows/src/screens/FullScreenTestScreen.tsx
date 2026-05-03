import React, {useState} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  useColorScheme,
} from "react-native";
import {captureScreen} from "react-native-view-shot";

const FullScreenTestScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === "dark";
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const captureFullScreen = async () => {
    setIsCapturing(true);
    try {
      const uri = await captureScreen({
        format: "png",
        quality: 0.8,
      });
      setImageUri(uri);
      setIsCapturing(false);
      console.log("Full Screen Captured:", uri);
    } catch (error) {
      setIsCapturing(false);
      console.error("Capture error:", error);
    }
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? "#1C1C1E" : "#F2F2F7",
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={styles.scrollView} testID="fullScreenScrollView">
        <View style={styles.content}>
          <Text style={styles.emoji}>🖥️</Text>
          <Text style={styles.title}>Full Screen Capture Test</Text>
          <Text style={styles.description}>
            Test capturing the entire screen using captureScreen() instead of
            captureRef()
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>🎯 What this captures:</Text>
            <Text style={styles.cardText}>
              • Status bar and navigation{"\n"}• All visible content{"\n"}•
              System UI elements{"\n"}• Only what's currently on screen
            </Text>
          </View>

          <View style={[styles.infoCard, {backgroundColor: "#FFF3CD"}]}>
            <Text style={styles.cardTitle}>⚠️ Important:</Text>
            <Text style={styles.cardText}>
              ScrollViews will NOT be captured entirely - only visible portions
            </Text>
          </View>

          <View style={[styles.infoCard, {backgroundColor: "#D4EDDA"}]}>
            <Text style={styles.cardTitle}>✅ New Architecture:</Text>
            <Text style={styles.cardText}>
              captureScreen() working with Fabric + TurboModules
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              {backgroundColor: isCapturing ? "#999" : "#007AFF"},
            ]}
            onPress={captureFullScreen}
            disabled={isCapturing}
            testID="capture-button"
            accessible={true}
            accessibilityLabel="capture-button"
          >
            <Text style={styles.buttonText}>
              {isCapturing ? "📸 Capturing..." : "📸 Capture Full Screen"}
            </Text>
          </TouchableOpacity>

          {imageUri && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>✅ Full Screen Captured:</Text>
              <Image
                source={{uri: imageUri}}
                style={styles.previewImage}
                resizeMode="contain"
              />
              <Text style={styles.uriText} numberOfLines={2}>
                {imageUri}
              </Text>
              <Text style={styles.noteText}>
                Note: This should include the navigation bar and status bar
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
    alignItems: "center",
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  cardText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  previewContainer: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    shadowColor: "#000",
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
    fontWeight: "600",
    marginBottom: 10,
    color: "#28a745",
  },
  previewImage: {
    width: 200,
    height: 350,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  uriText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    fontFamily: "monospace",
    marginBottom: 10,
  },
  noteText: {
    fontSize: 12,
    color: "#007AFF",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default FullScreenTestScreen;
