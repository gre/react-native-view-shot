import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StatusBar,
  useColorScheme,
  StyleSheet,
} from "react-native";
import ViewShot from "react-native-view-shot";
import {InfoCard} from "./InfoCard";
import {ControlsCard} from "./ControlsCard";
import {CaptureButton} from "./CaptureButton";
import {PreviewContainer} from "./PreviewContainer";

interface TestScreenLayoutProps {
  emoji: string;
  title: string;
  description: string;
  scrollViewTestID?: string;
  infoCards?: Array<{
    title: string;
    content: string;
    backgroundColor?: string;
    borderColor?: string;
  }>;
  controlButtons?: Array<{
    label: string;
    onPress: () => void;
    backgroundColor?: string;
  }>;
  testSectionTitle: string;
  viewShotRef: React.RefObject<any>;
  testContent: React.ReactNode;
  captureContainerStyle?: object;
  captureButton: {
    onPress: () => void;
    isCapturing: boolean;
    disabled?: boolean;
    captureText?: string;
    capturingText?: string;
  };
  capturedUri?: string | null;
  previewConfig?: {
    title?: string;
    noteText?: string;
    imageWidth?: number;
    imageHeight?: number;
  };
}

export const TestScreenLayout: React.FC<TestScreenLayoutProps> = ({
  emoji,
  title,
  description,
  scrollViewTestID,
  infoCards = [],
  controlButtons = [],
  testSectionTitle,
  viewShotRef,
  testContent,
  captureContainerStyle,
  captureButton,
  capturedUri,
  previewConfig,
}) => {
  const isDarkMode = useColorScheme() === "dark";

  const backgroundStyle = {
    backgroundColor: isDarkMode ? "#1C1C1E" : "#F2F2F7",
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={styles.scrollView} testID={scrollViewTestID}>
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          {/* Info Cards */}
          {infoCards.map((card, index) => (
            <InfoCard
              key={index}
              title={card.title}
              backgroundColor={card.backgroundColor}
              borderColor={card.borderColor}
            >
              <Text style={styles.cardText}>{card.content}</Text>
            </InfoCard>
          ))}

          {/* Controls */}
          {controlButtons.length > 0 && (
            <ControlsCard buttons={controlButtons} />
          )}

          {/* Test Section */}
          <View style={styles.testContainer}>
            <Text style={styles.sectionTitle}>{testSectionTitle}</Text>
            <ViewShot
              ref={viewShotRef}
              style={[styles.testCapture, captureContainerStyle]}
            >
              {testContent}
            </ViewShot>
          </View>

          {/* Capture Button */}
          <CaptureButton
            onPress={captureButton.onPress}
            isCapturing={captureButton.isCapturing}
            disabled={captureButton.disabled}
            captureText={captureButton.captureText}
            capturingText={captureButton.capturingText}
          />

          {/* Preview */}
          {capturedUri && (
            <PreviewContainer
              capturedUri={capturedUri}
              title={previewConfig?.title}
              noteText={previewConfig?.noteText}
              imageWidth={previewConfig?.imageWidth}
              imageHeight={previewConfig?.imageHeight}
            />
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
  testCapture: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TestScreenLayout;
