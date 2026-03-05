const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  projectRoot: __dirname,
  watchFolders: [
    // Inclure le dossier parent pour pouvoir résoudre react-native-view-shot
    path.resolve(__dirname, '..'),
  ],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, './node_modules'),
      path.resolve(__dirname, '../node_modules'),
    ],
    // Force la résolution vers le dossier parent pour react-native-view-shot
    alias: {
      'react-native-view-shot': path.resolve(__dirname, '..'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
