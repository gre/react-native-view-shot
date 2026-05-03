const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const fs = require("fs");
const path = require("path");
const exclusionList = require("metro-config/src/defaults/exclusionList");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "..");

const rnwPath = fs.realpathSync(
  path.resolve(require.resolve("react-native-windows/package.json"), ".."),
);

// Block the lib's own node_modules/{react,react-native} so Metro doesn't bundle
// duplicate copies (the lib's devDeps + this example's deps), which breaks hooks
// in React 19 because only one copy gets its dispatcher set by the renderer.
const blockedParentModule = (name) =>
  new RegExp(
    path
      .resolve(monorepoRoot, "node_modules", name, ".*")
      .replace(/[/\\]/g, "[/\\\\]"),
  );

const config = {
  projectRoot,
  watchFolders: [monorepoRoot],
  resolver: {
    nodeModulesPaths: [path.resolve(projectRoot, "node_modules")],
    alias: {
      "react-native-view-shot": monorepoRoot,
    },
    blockList: exclusionList([
      // run-windows produces files Metro must not crash on
      new RegExp(
        `${path.resolve(__dirname, "windows").replace(/[/\\]/g, "/")}.*`,
      ),
      new RegExp(`${rnwPath}/build/.*`),
      new RegExp(`${rnwPath}/target/.*`),
      /.*\.ProjectImports\.zip/,
      blockedParentModule("react-native"),
      blockedParentModule("react"),
    ]),
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
