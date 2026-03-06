import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface PreviewContainerProps {
  capturedUri: string;
  title?: string;
  noteText?: string;
  imageWidth?: number;
  imageHeight?: number;
}

export const PreviewContainer: React.FC<PreviewContainerProps> = ({
  capturedUri,
  title = '✅ Captured:',
  noteText,
  imageWidth = 200,
  imageHeight = 150,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Image
        source={{ uri: capturedUri }}
        style={[styles.image, { width: imageWidth, height: imageHeight }]}
        fadeDuration={0}
      />
      <Text style={styles.uriText} numberOfLines={2}>
        {capturedUri}
      </Text>
      {noteText && <Text style={styles.noteText}>{noteText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#28a745',
  },
  image: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  uriText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  noteText: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PreviewContainer;
