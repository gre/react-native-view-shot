import React, {useRef, useState} from "react";
import {View, Text, StyleSheet, Button, Image} from "react-native";
import ViewShot from "react-native-view-shot";

export default function App() {
  const viewShotRef = useRef<ViewShot>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const captureView = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        setCapturedImage(uri);
        console.log("Captured image:", uri);
      }
    } catch (error) {
      console.error("Capture failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Windows ViewShot Test</Text>

      <ViewShot ref={viewShotRef} style={styles.captureArea}>
        <View style={styles.testContent}>
          <Text style={styles.testText}>Test Content</Text>
          <View style={styles.colorBox} />
        </View>
      </ViewShot>

      <Button title="Capture ViewShot" onPress={captureView} />

      {capturedImage && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>Captured:</Text>
          <Image source={{uri: capturedImage}} style={styles.preview} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  captureArea: {
    marginBottom: 20,
  },
  testContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  testText: {
    fontSize: 18,
    marginBottom: 10,
  },
  colorBox: {
    width: 100,
    height: 100,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
  },
  previewContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  previewText: {
    fontSize: 16,
    marginBottom: 10,
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});
