// @flow
import React, { Fragment } from 'react';
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';

// To add a screen, import it and add it in screens

import FullScreen from './Full';
import ViewshootScreen from './Viewshoot';
import TransparencyScreen from './Transparency';
import VideoScreen from './Video';
import WebViewScreen from './WebView';
import MapViewScreen from './MapView';
import CanvasScreen from './Canvas';
import GLReactV2Screen from './GLReactV2';
import SVGUriScreen from './SVGUri';
import ARTScreen from './ART';
import ModalScreen from './Modal';

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
  Canvas: {
    screen: CanvasScreen,
  },
  MapView: {
    screen: MapViewScreen,
  },
  GLReactV2: {
    screen: GLReactV2Screen,
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
};

///////////////////////////////////////////////////

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Home',
  };
  render() {
    const { navigation } = this.props;
    return (
      <Fragment>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          {Object.keys(screens).map(key => (
            <TouchableOpacity key={key} onPress={() => navigation.navigate(key)}>
              <View style={styles.entry}>
                <Text style={styles.entryText}>
                  {(screens[key].screen.navigationOptions &&
                    screens[key].screen.navigationOptions.title) ||
                    key}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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

const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
  },
  ...screens,
});

export default createAppContainer(AppNavigator);
