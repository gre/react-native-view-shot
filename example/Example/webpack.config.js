const path = require('path');
const webpack = require('webpack');

// This is needed for webpack to compile JavaScript.
// Many OSS React Native packages are not compiled to ES5 before being
// published. If you depend on uncompiled packages they may cause webpack build
// errors. To fix this webpack can be configured to compile to the necessary
// `node_module`.
const babelLoaderConfiguration = {
  test: /\.m?js$/,
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      // The "react-native" preset is recommended to match React Native"s packager
      presets: ['module:metro-react-native-babel-preset'],
      // Re-write paths to import only the modules needed by the app
      plugins: ['react-native-web'],
    },
  },
};

// This is needed for webpack to import static images in JavaScript files.
const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: '[name].[ext]',
    },
  },
};

// This is needed for webpack to import files like mp4s
const fileLoaderConfiguration = {
  test: /\.(mp4)$/,
  use: {
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
    },
  },
};

module.exports = {
  entry: [
    // load any web API polyfills if you have e.g.
    // path.resolve(__dirname, "polyfills-web.js"),
    // your web-specific entry file
    path.resolve(__dirname, 'index.web.js'),
  ],

  // configures where the build ends up
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'web'),
  },

  // ...the rest of your config

  module: {
    rules: [
      babelLoaderConfiguration,
      imageLoaderConfiguration,
      fileLoaderConfiguration,
    ],
  },

  plugins: [
    // `process.env.NODE_ENV === "production"` must be `true` for production
    // builds to eliminate development checks and reduce build size. You may
    // wish to include additional optimizations.
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development',
      ),
      __DEV__: process.env.NODE_ENV === 'production' || true,
    }),
  ],

  resolve: {
    // This will only alias the exact import "react-native"
    alias: {
      'react-native$': 'react-native-web',
    },
    // If you"re working on a multi-platform React Native app, web-specific
    // module implementations should be written in files using the extension
    // `.web.js`.
    extensions: ['.web.js', '.js'],
  },

  devServer: {
    compress: true,
    port: 9001,
    hot: true,
  },
};
