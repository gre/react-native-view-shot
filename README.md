
# react-native-view-shot ![](https://img.shields.io/npm/v/react-native-view-shot.svg) ![](https://img.shields.io/badge/react--native-%2040+-05F561.svg)

Capture a React Native view to an image.

<img src="https://github.com/gre/react-native-view-shot-example/raw/master/docs/recursive.gif" width=300 />

> iOS: For React Native version between `0.30.x` and `0.39.x`, you should use `react-native-view-shot@1.5.1`.

## Usage

```js
import { takeSnapshot } from "react-native-view-shot";

takeSnapshot(viewRef, {
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

### `takeSnapshot(view, options)`

Returns a Promise of the image URI.

- **`view`** is a reference to a React Native component.
- **`options`** may include:
 - **`width`** / **`height`** *(number)*: the width and height of the final image (resized from the View bound. don't provide it if you want the original pixel size).
 - **`format`** *(string)*: either `png` or `jpg`/`jpeg` or `webm` (Android). Defaults to `png`.
 - **`quality`** *(number)*: the quality. 0.0 - 1.0 (default). (only available on lossy formats like jpeg)
 - **`result`** *(string)*, the method you want to use to save the snapshot, one of:
    - `"file"` (default): save to a temporary file *(that will only exist for as long as the app is running)*.
    - `"base64"`: encode as base64 and returns the raw string. Use only with small images as this may result of lags (the string is sent over the bridge). *N.B. This is not a data uri, use `data-uri` instead*.
    - `"data-uri"`: same as `base64` but also includes the [Data URI scheme](https://en.wikipedia.org/wiki/Data_URI_scheme) header.
 - **`path`** *(string)*: The absolute path where the file get generated. See *`dirs` constants* for more information.
 - **`snapshotContentContainer`** *(bool)*: if true and when view is a ScrollView, the "content container" height will be evaluated instead of the container height.

### `dirs` constants

By default, takeSnapshot will export in a temporary folder and the snapshot file will be deleted as soon as the app leaves. If you use the `path` option, you make the snapshot file more permanent and at a specific file location. To make file location more 'universal', the library exports some classic directory constants:

> If you use the `path` option, you own the file and manage its lifecycle: it won't get cleaned so be careful not leaking files on user's phone.

```js
import { takeSnapshot, dirs } from "react-native-view-shot";
// cross platform dirs:
const { CacheDir, DocumentDir, MainBundleDir, MovieDir, MusicDir, PictureDir } = dirs;
// only available Android:
const { DCIMDir, DownloadDir, RingtoneDir, SDCardDir } = dirs;

takeSnapshot(viewRef, { path: PictureDir+"/foo.png" })
.then(
  uri => console.log("Image saved to", uri),
  error => console.error("Oops, snapshot failed", error)
);
```

## Interoperability Table

Model tested: iPhone 6 (iOS), Nexus 5 (Android).

| System             | iOS                | Android           | Windows           |
|--------------------|--------------------|-------------------|-------------------|
| View,Text,Image,.. | YES                | YES               | YES               |                    
| WebView            | YES                | YES<sup>1</sup>   | YES               |
| gl-react v2        | YES                | NO<sup>2</sup>    | NO<sup>3</sup>    |
| react-native-video | NO                 | NO                | NO
| react-native-maps  | YES                | NO<sup>4</sup> | NO<sup>3</sup>

>
1. Only supported by wrapping a `<View collapsable={false}>` parent and snapshotting it.
2. It returns an empty image (not a failure Promise).
3. Component itself lacks platform support.
4. But you can just use the react-native-maps snapshot function: https://github.com/airbnb/react-native-maps#take-snapshot-of-map

## Caveats

Snapshots are not guaranteed to be pixel perfect. It also depends on the platform. Here is some difference we have noticed and how to workaround.

- Support of special components like Video / GL views is not guaranteed to work. In case of failure, the `takeSnapshot` promise gets rejected (the library won't crash).
- It's preferable to **use a background color on the view you rasterize** to avoid transparent pixels and potential weirdness that some border appear around texts.

### specific to Android implementation

- you need to make sure `collapsable` is set to `false` if you want to snapshot a **View**. Some content might even need to be wrapped into such `<View collapsable={false}>` to actually make them snapshotable! Otherwise that view won't reflect any UI View. ([found by @gaguirre](https://github.com/gre/react-native-view-shot/issues/7#issuecomment-245302844))
-  if you implement a third party library and want to get back a File, you must first resolve the `Uri`. (the `file` result returns an `Uri` so it's consistent with iOS and can be given to APIs like `Image.getSize`)

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
 - Add `import fr.greweb.reactnativeviewshot.RNViewShotPackage;` to the imports at the top of the file
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

1. In Visual Studio, in the solution explorer, right click on your solution then select `Add` ➜ `ExisitingProject`
2. Go to `node_modules` ➜ `react-native-view-shot` and add `RNViewShot.csproj` (UWP) or optionally `RNViewShot.Net46.csproj` (WPF)
3. In Visual Studio, in the solution explorer, right click on your Application project then select `Add` ➜ `Reference`
4. Under the projects tab select `RNViewShot` (UWP) or `RNViewShot.Net46` (WPF)

## Thanks

- To initial iOS work done by @jsierles in https://github.com/jsierles/react-native-view-snapshot
- To React Native implementation of takeSnapshot in iOS by @nicklockwood
- To Windows implementation by @ryanlntn
