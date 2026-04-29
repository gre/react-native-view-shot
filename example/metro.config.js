const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

// Block the lib's own node_modules/{react,react-native} so Metro doesn't bundle
// duplicate copies (the lib's devDeps + the example's deps), which breaks hooks
// in React 19 because only one copy gets its dispatcher set by the renderer.
const blockedParentModule = name =>
  new RegExp(
    path
      .resolve(monorepoRoot, 'node_modules', name, '.*')
      .replace(/[/\\]/g, '[/\\\\]'),
  );

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  projectRoot,
  watchFolders: [monorepoRoot],
  resolver: {
    nodeModulesPaths: [path.resolve(projectRoot, 'node_modules')],
    alias: {
      'react-native-view-shot': monorepoRoot,
    },
    blockList: [
      blockedParentModule('react-native'),
      blockedParentModule('react'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
