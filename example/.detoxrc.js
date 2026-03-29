module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 300000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Debug-iphonesimulator/ViewShotExample.app',
      build:
        'xcodebuild -workspace ios/ViewShotExample.xcworkspace -scheme ViewShotExample -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -PnewArchEnabled=false',
      testBinaryPath:
        'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      reversePorts: [8081],
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: process.env.IOS_SIMULATOR || 'iPhone 16 Pro',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName:
          process.env.ANDROID_AVD_NAME ||
          'pixel_3a_API_30_extension_level_7_x86_64',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
      behavior: {
        init: {
          exposeGlobals: true,
        },
      },
      session: {
        autoStart: true,
        debugSynchronization: 10000,
      },
    },
  },
};
