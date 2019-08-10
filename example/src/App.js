// @flow
import React, { Fragment } from 'react';
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import FullScreen from './Full';
import ViewshootScreen from './Viewshoot';
import TransparencyScreen from './Transparency';

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Home',
  };
  render() {
    const { navigation } = this.props;
    return (
      <Fragment>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView contentInsetAdjustmentBehavior="automatic">
          {Object.keys(screens).map(key => (
            <TouchableOpacity key={key} onPress={() => navigation.navigate(key)}>
              <View style={styles.entry}>
                <Text style={styles.entryText}>{key}</Text>
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
    fontSize: 28,
    color: '#36f',
  },
});

const screens = {
  Full: {
    screen: FullScreen,
  },
  Viewshoot: {
    screen: ViewshootScreen,
  },
  Transparency: {
    screen: TransparencyScreen,
  },
};

const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
  },
  ...screens,
});

export default createAppContainer(AppNavigator);
