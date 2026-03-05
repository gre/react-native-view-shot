import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TestScreenLayout, useViewShotCapture } from '../components/shared';
import Svg, {
  Circle,
  Rect,
  Line,
  Path,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

const SVGTestScreen: React.FC = () => {
  const [svgType, setSvgType] = useState<'shapes' | 'chart' | 'icon'>('shapes');

  const { capturedUri, isCapturing, viewShotRef, startCapture, resetCapture } =
    useViewShotCapture('SVG Captured!');

  const cycleSvgType = () => {
    const types: Array<'shapes' | 'chart' | 'icon'> = [
      'shapes',
      'chart',
      'icon',
    ];
    const currentIndex = types.indexOf(svgType);
    const nextIndex = (currentIndex + 1) % types.length;
    setSvgType(types[nextIndex]);
    resetCapture();
  };

  const renderSVGShapes = () => (
    <Svg height="200" width="280" style={styles.svg}>
      <Defs>
        <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FF6B6B" stopOpacity="1" />
          <Stop offset="100%" stopColor="#4ECDC4" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Circle with gradient */}
      <Circle
        cx="50"
        cy="50"
        r="30"
        fill="url(#grad)"
        stroke="#333"
        strokeWidth="2"
      />

      {/* Rectangle */}
      <Rect
        x="100"
        y="25"
        width="50"
        height="50"
        fill="#45B7D1"
        stroke="#333"
        strokeWidth="2"
        rx="5"
      />

      {/* Triangle (using Path) */}
      <Path
        d="M180 75 L200 25 L220 75 Z"
        fill="#96CEB4"
        stroke="#333"
        strokeWidth="2"
      />

      {/* Star */}
      <Path
        d="M50 150 L55 135 L70 135 L58 125 L63 110 L50 120 L37 110 L42 125 L30 135 L45 135 Z"
        fill="#FECA57"
        stroke="#333"
        strokeWidth="2"
      />

      {/* Lines */}
      <Line
        x1="100"
        y1="150"
        x2="200"
        y2="120"
        stroke="#FF9FF3"
        strokeWidth="3"
      />
      <Line
        x1="100"
        y1="120"
        x2="200"
        y2="150"
        stroke="#FF9FF3"
        strokeWidth="3"
      />

      {/* Text */}
      <SvgText x="140" y="100" fontSize="16" fill="#333" textAnchor="middle">
        SVG Shapes
      </SvgText>
    </Svg>
  );

  const renderSVGChart = () => (
    <Svg height="200" width="280" style={styles.svg}>
      {/* Chart background */}
      <Rect
        x="40"
        y="20"
        width="200"
        height="150"
        fill="#F8F9FA"
        stroke="#ddd"
        strokeWidth="1"
      />

      {/* Grid lines */}
      {[40, 60, 80, 100, 120, 140].map((y, i) => (
        <Line
          key={i}
          x1="40"
          y1={y}
          x2="240"
          y2={y}
          stroke="#E5E5E5"
          strokeWidth="1"
        />
      ))}

      {/* Y-axis labels */}
      {[100, 80, 60, 40, 20, 0].map((value, i) => (
        <SvgText
          key={i}
          x="35"
          y={40 + i * 20}
          fontSize="10"
          fill="#666"
          textAnchor="end"
        >
          {value}
        </SvgText>
      ))}

      {/* Bars */}
      <Rect x="60" y="110" width="20" height="60" fill="#FF6B6B" />
      <Rect x="90" y="90" width="20" height="80" fill="#4ECDC4" />
      <Rect x="120" y="125" width="20" height="45" fill="#45B7D1" />
      <Rect x="150" y="100" width="20" height="70" fill="#96CEB4" />
      <Rect x="180" y="115" width="20" height="55" fill="#FECA57" />

      {/* X-axis labels */}
      {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, i) => (
        <SvgText
          key={i}
          x={70 + i * 30}
          y="185"
          fontSize="10"
          fill="#666"
          textAnchor="middle"
        >
          {month}
        </SvgText>
      ))}

      <SvgText x="140" y="200" fontSize="14" fill="#333" textAnchor="middle">
        📊 SVG Chart
      </SvgText>
    </Svg>
  );

  const renderSVGIcon = () => (
    <Svg height="200" width="280" style={styles.svg}>
      {/* Heart icon */}
      <G transform="translate(90, 50)">
        <Path
          d="M50,25 C50,15 40,5 25,5 C10,5 0,15 0,25 C0,40 25,65 50,80 C75,65 100,40 100,25 C100,15 90,5 75,5 C60,5 50,15 50,25 Z"
          fill="#E74C3C"
          stroke="#C0392B"
          strokeWidth="2"
        />
      </G>

      {/* Star icon */}
      <G transform="translate(40, 120)">
        <Path
          d="M25,5 L30,20 L45,20 L33,30 L38,45 L25,35 L12,45 L17,30 L5,20 L20,20 Z"
          fill="#F39C12"
          stroke="#E67E22"
          strokeWidth="2"
        />
      </G>

      {/* Gear icon */}
      <G transform="translate(140, 120)">
        <Circle cx="25" cy="25" r="8" fill="#34495E" />
        <Circle
          cx="25"
          cy="25"
          r="15"
          fill="none"
          stroke="#34495E"
          strokeWidth="3"
        />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const x1 = 25 + Math.cos(angle) * 18;
          const y1 = 25 + Math.sin(angle) * 18;
          const x2 = 25 + Math.cos(angle) * 22;
          const y2 = 25 + Math.sin(angle) * 22;
          return (
            <Line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#34495E"
              strokeWidth="3"
            />
          );
        })}
      </G>

      <SvgText x="140" y="180" fontSize="14" fill="#333" textAnchor="middle">
        🎨 SVG Icons
      </SvgText>
    </Svg>
  );

  const renderSVGContent = () => {
    switch (svgType) {
      case 'shapes':
        return renderSVGShapes();
      case 'chart':
        return renderSVGChart();
      case 'icon':
        return renderSVGIcon();
      default:
        return renderSVGShapes();
    }
  };

  return (
    <TestScreenLayout
      emoji="🎨"
      title="SVG Capture Test"
      description="Test capturing real SVG content with react-native-svg"
      scrollViewTestID="svgScrollView"
      infoCards={[
        {
          title: '🎯 What this tests:',
          content:
            '• Real SVG rendering with react-native-svg\n• Vector graphics capture\n• Complex SVG shapes and paths\n• SVG text and gradients',
        },
        {
          title: '✅ Real Implementation:',
          content:
            'Uses actual react-native-svg components: Svg, Circle, Rect, Path, Text, LinearGradient, etc.',
        },
      ]}
      controlButtons={[
        {
          label: `🎨 SVG Type: ${
            svgType.charAt(0).toUpperCase() + svgType.slice(1)
          }`,
          onPress: cycleSvgType,
        },
      ]}
      testSectionTitle={`🎨 Real SVG (${svgType}):`}
      viewShotRef={viewShotRef}
      testContent={
        <View style={styles.svgContainer}>{renderSVGContent()}</View>
      }
      captureContainerStyle={styles.captureContainer}
      captureButton={{
        onPress: () => startCapture(),
        isCapturing,
        captureText: '📸 Capture SVG',
        capturingText: '🎨 Capturing...',
      }}
      capturedUri={capturedUri}
      previewConfig={{
        title: '✅ SVG Captured:',
        noteText: `SVG type: ${svgType}\nReal react-native-svg rendering`,
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
  },
  svg: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  captureContainer: {
    minWidth: 320,
    minHeight: 240,
  },
});

export default SVGTestScreen;
