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
import screens from './screens';

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
