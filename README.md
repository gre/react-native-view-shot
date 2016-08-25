
# react-native-view-shot ![](https://img.shields.io/npm/v/react-native-view-shot.svg?maxAge=2592000) ![](https://img.shields.io/badge/react--native-%2030+-05F561.svg)

Snapshot a React Native view and save it to an image.

<img src="https://github.com/gre/react-native-view-shot-example/raw/master/docs/recursive.gif" width=300 />

## Usage

```js
import RNViewShot from "react-native-view-shot";

RNViewShot.takeSnapshot(viewRef, {
  format: "jpeg",
  quality: 0.8
})
.then(
  uri => console.log("Image saved to", uri),
  error => console.error("Oops, snapshot failed", error)
);
```

### Example

[Checkout react-native-view-shot-example](https://github.com/gre/react-native-view-shot-example)

## Full API

### `RNViewShot.takeSnapshot(view, options)`

Returns a Promise of the image URI.

- **`view`** is a reference to a React Native component.
- **`options`** may include:
 - **`width`** / **`height`** *(number)*: the width and height of the image to capture.
 - **`format`** *(string)*: either `png` or `jpg`/`jpeg` or `webm` (Android). Defaults to `png`.
 - **`quality`** *(number)*: the quality. 0.0 - 1.0 (default). (only available on lossy formats like jpeg)
 - **`result`** *(string)*, the method you want to use to save the snapshot, one of:
    - `"file"` (default): save to a temporary file *(that will only exist for as long as the app is running)*.
    - `"base64"`: encode as base64 and returns the raw string. Use only with small images as this may result of lags (the string is sent over the bridge). *N.B. This is not a data uri, use `data-uri` instead*.
    - `"data-uri"`: same as `base64` but also includes the [Data URI scheme](https://en.wikipedia.org/wiki/Data_URI_scheme) header.

## Getting started

```
npm install --save react-native-view-shot
```

### Mostly automatic installation

```
react-native link react-native-view-shot
```

### Manual installation

#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-view-shot` and add `RNViewShot.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNViewShot.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
 - Add `import com.reactlibrary.RNViewShotPackage;` to the imports at the top of the file
 - Add `new RNViewShotPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
 	```
 	include ':react-native-view-shot'
 	project(':react-native-view-shot').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-view-shot/android')
 	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
 	```
     compile project(':react-native-view-shot')
 	```

#### Windows

No support yet. Feel free to PR.

## Notes

Snapshots are not guaranteed to be pixel perfect. It also depends on the platform. Here is some difference we have noticed and how to workaround.

- Support of special components like Video / GL views remains untested.
- It's preferable to **use a background color on the view you rasterize** to avoid transparent pixels and potential weirdness that some border appear around texts.

## Thanks

- To initial iOS work done by @jsierles in https://github.com/jsierles/react-native-view-snapshot
- To React Native implementation of takeSnapshot in iOS by @nicklockwood
