import React, {useState, useCallback} from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
  useColorScheme,
} from "react-native";
import ViewShot from "react-native-view-shot";

const TransparencyTestScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === "dark";
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  const onCapture = useCallback((uri: string) => {
    setCapturedUri(uri);
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? "#1C1C1E" : "#F2F2F7",
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={styles.scrollView} testID="transparencyScrollView">
        <View style={styles.content}>
          <Text style={styles.emoji}>⚪</Text>
          <Text style={styles.title}>Transparency Test</Text>
          <Text style={styles.description}>
            Test capturing views with transparent backgrounds using ViewShot
            without backgroundColor
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>🎯 How it works:</Text>
            <Text style={styles.cardText}>
              • ViewShot without backgroundColor → transparent background{"\n"}•
              PNG format preserves alpha channel{"\n"}• captureMode="mount"
              captures automatically{"\n"}• Red background shows transparency
              effect
            </Text>
          </View>

          <View style={styles.testContainer}>
            <Text style={styles.sectionTitle}>
              📸 Captured View (auto-capture):
            </Text>

            <ViewShot
              onCapture={onCapture}
              captureMode="mount"
              style={styles.captureView}
              options={{
                format: "png",
                quality: 0.9,
              }}
            >
              <View style={styles.circleContainer}>
                <View style={styles.circle} />
              </View>
            </ViewShot>
          </View>

          <View style={styles.resultContainer}>
            <Text style={styles.sectionTitle}>
              🔍 Transparency Test Result:
            </Text>

            {/* Display captured image on red background to show transparency */}
            <View style={styles.redBackground}>
              {capturedUri ? (
                <Image
                  source={{uri: capturedUri}}
                  style={styles.capturedImage}
                  fadeDuration={0}
                />
              ) : (
                <Text style={styles.waitingText}>Capturing...</Text>
              )}
            </View>

            {capturedUri && (
              <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>✅ Transparency Working!</Text>
                <Text style={styles.statusText}>
                  If you see the red background through the transparent parts,
                  then transparency is working correctly with New Architecture!
                </Text>
                <Text style={styles.uriText} numberOfLines={2}>
                  {capturedUri}
                </Text>
              </View>
            )}
          </View>
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
    marginBottom: 30,
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
  testContainer: {
    alignItems: "center",
    marginBottom: 30,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  captureView: {
    width: 220,
    height: 220,
  },
  circleContainer: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "cyan",
    borderWidth: 2,
    borderColor: "blue",
  },
  resultContainer: {
    alignItems: "center",
    width: "100%",
  },
  redBackground: {
    backgroundColor: "#ff0000",
    width: 320,
    height: 320,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 20,
  },
  capturedImage: {
    width: 220,
    height: 220,
  },
  waitingText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  statusCard: {
    backgroundColor: "#d4edda",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: "#c3e6cb",
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#155724",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#155724",
    lineHeight: 20,
    marginBottom: 10,
  },
  uriText: {
    fontSize: 12,
    color: "#6c757d",
    fontFamily: "monospace",
  },
});

export default TransparencyTestScreen;
