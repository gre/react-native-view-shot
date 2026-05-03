import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  BasicTest: undefined;
  FullScreen: undefined;
  Transparency: undefined;
  ScrollView: undefined;
  Image: undefined;
  Modal: undefined;
  FS: undefined;
  Rendering: undefined;
  StyleFilters: undefined;
};

import HomeScreen from './src/screens/HomeScreen';
import BasicTestScreen from './src/screens/BasicTestScreen';
import FullScreenTestScreen from './src/screens/FullScreenTestScreen';
import TransparencyTestScreen from './src/screens/TransparencyTestScreen';
import ImageTestScreen from './src/screens/ImageTestScreen';
import ModalTestScreen from './src/screens/ModalTestScreen';
import FSTestScreen from './src/screens/FSTestScreen';
import ScrollViewTestScreen from './src/screens/ScrollViewTestScreen';
import RenderingTestScreen from './src/screens/RenderingTestScreen';
import StyleFiltersTestScreen from './src/screens/StyleFiltersTestScreen';

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

        <Stack.Screen
          name="Image"
          component={ImageTestScreen}
          options={{ title: '🖼️ Image Capture' }}
        />

        <Stack.Screen
          name="Modal"
          component={ModalTestScreen}
          options={{ title: '📱 Modal Capture' }}
        />

        <Stack.Screen
          name="FS"
          component={FSTestScreen}
          options={{ title: '💾 File System Test' }}
        />

        <Stack.Screen
          name="Rendering"
          component={RenderingTestScreen}
          options={{ title: '🧪 Rendering correctness' }}
        />
        <Stack.Screen
          name="StyleFilters"
          component={StyleFiltersTestScreen}
          options={{ title: '🎨 Style filters (Bug #578)' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
