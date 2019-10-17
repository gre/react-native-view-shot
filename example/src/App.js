// @flow
import React, { Fragment } from 'react';
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';

// To add a screen, import it and add it in screens

import screens from './screens';

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
