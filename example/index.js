/**
 * @format
 */

import { AppRegistry, LogBox, Platform, Settings } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Under Detox, LogBox toasts cover the bottom of the screen and swallow taps
// on buttons there. Detox launch args reach NSUserDefaults (read by Settings).
if (Platform.OS === 'ios' && Settings.get('detoxServer')) {
  LogBox.ignoreAllLogs();
}

AppRegistry.registerComponent(appName, () => App);
