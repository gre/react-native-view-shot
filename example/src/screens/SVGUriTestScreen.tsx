import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TestScreenLayout, useViewShotCapture } from '../components/shared';
import { SvgUri } from 'react-native-svg';

const SVGUriTestScreen: React.FC = () => {
  const [svgSource, setSvgSource] = useState<'w3c' | 'simple' | 'complex'>(
    'simple',
  );

  const { capturedUri, isCapturing, viewShotRef, startCapture, resetCapture } =
    useViewShotCapture('SVG URI Captured!');

  const cycleSvgSource = () => {
    const sources: Array<'w3c' | 'simple' | 'complex'> = [
      'simple',
      'w3c',
      'complex',
    ];
    const currentIndex = sources.indexOf(svgSource);
    const nextIndex = (currentIndex + 1) % sources.length;
    setSvgSource(sources[nextIndex]);
    resetCapture();
  };

  const getSvgUri = () => {
    switch (svgSource) {
      case 'simple':
        // Simple SVG logo
        return 'https://www.w3.org/Icons/SVG/svg-logo-v.svg';
      case 'w3c':
        // Complex astronomical SVG
        return 'https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/heliocentric.svg';
      case 'complex':
        // GitHub logo SVG
        return 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.svg';
      default:
        return 'https://www.w3.org/Icons/SVG/svg-logo-v.svg';
    }
  };

  const getSvgDescription = () => {
    switch (svgSource) {
      case 'simple':
        return 'W3C SVG Logo (simple)';
      case 'w3c':
        return 'Heliocentric System (complex)';
      case 'complex':
        return 'GitHub Logo (monochrome)';
      default:
        return 'SVG from URI';
    }
  };

  const renderSVGContent = () => (
    <View style={styles.svgContainer}>
      <Text style={styles.sourceLabel}>{getSvgDescription()}</Text>
      <Text style={styles.uriLabel} numberOfLines={2}>
        {getSvgUri()}
      </Text>

      <View style={styles.svgWrapper}>
        <SvgUri
          width="250"
          height="200"
          uri={getSvgUri()}
          onError={error => {
            console.log('SVG URI Error:', error);
          }}
          onLoad={() => {
            console.log('SVG URI Loaded successfully');
          }}
        />
      </View>

      <Text style={styles.noteText}>
        🌐 Loaded from remote URI using SvgUri
      </Text>
    </View>
  );

  return (
    <TestScreenLayout
      emoji="🔗"
      title="SVG URI Capture Test"
      description="Test capturing SVG content loaded from remote URLs with react-native-svg"
      scrollViewTestID="svgUriScrollView"
      infoCards={[
        {
          title: '🎯 What this tests:',
          content:
            '• Real SVG URI loading with SvgUri\n• Remote SVG file capture\n• Network-based SVG rendering\n• Different SVG complexities',
        },
        {
          title: '⚠️ Network Required:',
          content:
            'This test loads SVG files from remote URLs. Make sure you have internet connectivity.',
        },
        {
          title: '✅ Real Implementation:',
          content:
            'Uses actual SvgUri component from react-native-svg to load and render remote SVG files.',
        },
      ]}
      controlButtons={[
        {
          label: `🔄 Source: ${
            svgSource.charAt(0).toUpperCase() + svgSource.slice(1)
          }`,
          onPress: cycleSvgSource,
        },
      ]}
      testSectionTitle={`🔗 SVG from URI (${svgSource}):`}
      viewShotRef={viewShotRef}
      testContent={renderSVGContent()}
      captureContainerStyle={styles.captureContainer}
      captureButton={{
        onPress: () => startCapture(),
        isCapturing,
        captureText: '📸 Capture SVG URI',
        capturingText: '🔗 Capturing...',
      }}
      capturedUri={capturedUri}
      previewConfig={{
        title: '✅ SVG URI Captured:',
        noteText: `Source: ${svgSource}\nReal SvgUri from: ${getSvgUri()}`,
        imageWidth: 220,
        imageHeight: 160,
      }}
    />
  );
};

const styles = StyleSheet.create({
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  sourceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  uriLabel: {
    fontSize: 10,
    color: '#007AFF',
    fontFamily: 'monospace',
    marginBottom: 15,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  svgWrapper: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    minWidth: 250,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
  captureContainer: {
    minWidth: 320,
    minHeight: 320,
  },
});

export default SVGUriTestScreen;
