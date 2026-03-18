const {getDefaultConfig} = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Watch the parent directory so Metro can follow the symlink to the lib
config.watchFolders = [monorepoRoot];

// Block react-native and react from resolving in the parent's node_modules.
// This prevents the lib's devDependency react-native@0.76 from conflicting
// with Expo's react-native@0.83.
config.resolver.blockList = [
  new RegExp(
    path
      .resolve(monorepoRoot, "node_modules", "react-native", ".*")
      .replace(/[/\\]/g, "[/\\\\]"),
  ),
  new RegExp(
    path
      .resolve(monorepoRoot, "node_modules", "react", ".*")
      .replace(/[/\\]/g, "[/\\\\]"),
  ),
];

// Ensure all shared deps resolve from this project
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];

module.exports = config;
