import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import type {Screen} from "../types";

interface Props {
  navigate: (screen: Screen) => void;
}

interface TestCase {
  key: Screen;
  title: string;
  description: string;
  emoji: string;
}

const testCases: TestCase[] = [
  {
    key: "BasicTest",
    title: "Basic ViewShot",
    description: "Simple view capture using html2canvas on web",
    emoji: "📸",
  },
  {
    key: "Image",
    title: "Image Capture",
    description: "Capture views containing images",
    emoji: "🖼️",
  },
  {
    key: "ComplexLayout",
    title: "Complex Layout",
    description: "Capture complex nested layouts with various styles",
    emoji: "🎨",
  },
  {
    key: "CORSImage",
    title: "CORS Image Capture",
    description: "Capture views with cross-origin images (useCORS)",
    emoji: "🌍",
  },
  {
    key: "ViewShotComponent",
    title: "ViewShot Component",
    description: "Test ViewShot component with ref.capture() and captureMode",
    emoji: "🔧",
  },
];

const HomeScreen: React.FC<Props> = ({navigate}) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌐 React Native View Shot</Text>
        <Text style={styles.subtitle}>Web Example with html2canvas</Text>
        <View style={styles.architectureBadge}>
          <Text style={styles.architectureText}>
            ✅ React Native Web Support
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📚 About This Example</Text>
        <Text style={styles.infoText}>
          This web example demonstrates how react-native-view-shot works in web
          browsers using html2canvas. The library automatically detects the web
          platform and uses the appropriate implementation.
        </Text>
        <View style={styles.infoFeatures}>
          <Text style={styles.featureItem}>
            ✓ Cross-platform API compatibility
          </Text>
          <Text style={styles.featureItem}>
            ✓ Multiple image formats (PNG, JPG)
          </Text>
          <Text style={styles.featureItem}>✓ Quality control</Text>
          <Text style={styles.featureItem}>✓ Base64 and Data URI support</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Test Cases</Text>
        {testCases.map(testCase => (
          <TouchableOpacity
            key={testCase.key}
            style={styles.testCase}
            onPress={() => navigate(testCase.key)}
          >
            <View style={styles.testCaseContent}>
              <Text style={styles.testEmoji}>{testCase.emoji}</Text>
              <View style={styles.testInfo}>
                <Text style={styles.testTitle}>{testCase.title}</Text>
                <Text style={styles.testDescription}>
                  {testCase.description}
                </Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Click any test case to see react-native-view-shot in action on the web
        </Text>
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
    padding: 40,
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  architectureBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  architectureText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1976D2",
  },
  infoCard: {
    margin: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 16,
  },
  infoFeatures: {
    paddingLeft: 10,
  },
  featureItem: {
    fontSize: 15,
    color: "#555",
    lineHeight: 28,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  testCase: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  testCaseContent: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
  },
  testEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  arrow: {
    fontSize: 24,
    color: "#007AFF",
  },
  footer: {
    padding: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default HomeScreen;
