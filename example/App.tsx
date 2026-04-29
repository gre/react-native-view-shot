/**
 * React Native ViewShot Example App with New Architecture
 * Testing Fabric + TurboModules support
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Define navigation types
export type RootStackParamList = {
  Home: undefined;
  // Basic tests
  BasicTest: undefined;
  FullScreen: undefined;
  Transparency: undefined;
  ScrollView: undefined;
  // Media tests
  Video: undefined;
  Image: undefined;
  WebView: undefined;
  // Advanced tests
  // MapView: undefined; // Disabled
  SVG: undefined;
  SVGUri: undefined;
  // Canvas: undefined; // Temp disabled
  Modal: undefined;
  // Edge cases
  FS: undefined;
  // Rendering correctness
  Rendering: undefined;
};

// Import all test screens
import HomeScreen from './src/screens/HomeScreen';
import BasicTestScreen from './src/screens/BasicTestScreen';
import FullScreenTestScreen from './src/screens/FullScreenTestScreen';
import TransparencyTestScreen from './src/screens/TransparencyTestScreen';
import VideoTestScreen from './src/screens/VideoTestScreen';
import ImageTestScreen from './src/screens/ImageTestScreen';
import WebViewTestScreen from './src/screens/WebViewTestScreen';
import SVGTestScreen from './src/screens/SVGTestScreen';
import SVGUriTestScreen from './src/screens/SVGUriTestScreen';
import ModalTestScreen from './src/screens/ModalTestScreen';
import FSTestScreen from './src/screens/FSTestScreen';
import ScrollViewTestScreen from './src/screens/ScrollViewTestScreen';
import RenderingTestScreen from './src/screens/RenderingTestScreen';

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: 'Back',
          headerBackAccessibilityLabel: 'Back',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'react-native-view-shot 4.0.3',
            headerStyle: {
              backgroundColor: '#007AFF',
            },
          }}
        />

        {/* BASIC Test Cases */}
        <Stack.Screen
          name="BasicTest"
          component={BasicTestScreen}
          options={{ title: '📸 Basic ViewShot Test' }}
        />
        <Stack.Screen
          name="FullScreen"
          component={FullScreenTestScreen}
          options={{ title: '🖥️ Full Screen Capture' }}
        />
        <Stack.Screen
          name="Transparency"
          component={TransparencyTestScreen}
          options={{ title: '⚪ Transparency Test' }}
        />
        <Stack.Screen
          name="ScrollView"
          component={ScrollViewTestScreen}
          options={{ title: '📜 ScrollView & Lists' }}
        />

        {/* MEDIA Test Cases */}
        <Stack.Screen
          name="Video"
          component={VideoTestScreen}
          options={{ title: '📹 Video Capture' }}
        />
        <Stack.Screen
          name="Image"
          component={ImageTestScreen}
          options={{ title: '🖼️ Image Capture' }}
        />
        <Stack.Screen
          name="WebView"
          component={WebViewTestScreen}
          options={{ title: '🌐 WebView Capture (Bug #577)' }}
        />

        {/* ADVANCED Test Cases */}
        <Stack.Screen
          name="SVG"
          component={SVGTestScreen}
          options={{ title: '🎨 SVG Capture' }}
        />
        <Stack.Screen
          name="SVGUri"
          component={SVGUriTestScreen}
          options={{ title: '🔗 SVG URI Capture' }}
        />
        <Stack.Screen
          name="Modal"
          component={ModalTestScreen}
          options={{ title: '📱 Modal Capture' }}
        />

        {/* EDGE CASES */}
        <Stack.Screen
          name="FS"
          component={FSTestScreen}
          options={{ title: '💾 File System Test' }}
        />

        {/* RENDERING CORRECTNESS */}
        <Stack.Screen
          name="Rendering"
          component={RenderingTestScreen}
          options={{ title: '🧪 Rendering correctness' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
