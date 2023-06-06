// @flow
import React, {Component, Fragment} from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import libPkg from 'react-native-view-shot/package.json';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// To add a screen, import it and add it in screens

import FullScreen from './Full';
import ViewshootScreen from './Viewshoot';
import TransparencyScreen from './Transparency';
import VideoScreen from './Video';
import WebViewScreen from './WebView';
import MapViewScreen from './MapView';
import CanvasScreen from './Canvas';
import SVGUriScreen from './SVGUri';
import ARTScreen from './ART';
import FSScreen from './FS';
import ModalScreen from './Modal';
import OffscreenScreen from './Offscreen';
import ElevationScreen from './Elevation';

const screens = {
  Full: {
    screen: FullScreen,
  },
  Video: {
    screen: VideoScreen,
  },
  WebView: {
    screen: WebViewScreen,
  },
  SVGUri: {
    screen: SVGUriScreen,
  },
  ART: {
    screen: ARTScreen,
  },
  FS: {
    screen: FSScreen,
  },
  Canvas: {
    screen: CanvasScreen,
  },
  MapView: {
    screen: MapViewScreen,
  },
  Modal: {
    screen: ModalScreen,
  },
  Viewshoot: {
    screen: ViewshootScreen,
  },
  Transparency: {
    screen: TransparencyScreen,
  },
  Offscreen: {
    screen: OffscreenScreen,
  },
  Elevation: {
    screen: ElevationScreen,
  },
};

///////////////////////////////////////////////////

class HomeScreen extends Component {
  static navigationOptions = {
    title: 'react-native-view-shot ' + libPkg.version,
  };
  render() {
    const {navigation} = this.props;
    return (
      <Fragment>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView>
            {Object.keys(screens).map(key => (
              <TouchableOpacity
                key={key}
                onPress={() => navigation.navigate(key)}>
                <View style={styles.entry}>
                  <Text style={styles.entryText}>
                    {(screens[key].screen.navigationOptions &&
                      screens[key].screen.navigationOptions.title) ||
                      key}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  entry: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  entryText: {
    fontSize: 22,
    color: '#36f',
  },
});

const Stack = createNativeStackNavigator();

export function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        {Object.keys(screens).map(key => (
          <Stack.Screen key={key} name={key} component={screens[key].screen} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
