/* eslint-disable react-native/no-inline-styles */
import React, { Fragment, useState, useRef, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Switch,
  TextInput,
  Picker,
  ScrollView,
  View,
  Text,
  StatusBar,
  Image,
} from 'react-native';

import { Buffer } from 'buffer';
import * as ART from '@react-native-community/art';
import Slider from '@react-native-community/slider';
import omit from 'lodash/omit';
import { captureRef, captureScreen } from 'react-native-view-shot';
import { Surface } from 'gl-react-native';
import GL from 'gl-react';
import MapView from 'react-native-maps';
import WebView from 'react-native-webview';
import Video from 'react-native-video';
import SvgUri from 'react-native-svg-uri';
import Btn from './Btn';

const catsSource = {
  uri: 'https://i.imgur.com/5EOyTDQ.jpg',
};

const shaders = GL.Shaders.create({
  helloGL: {
    frag: `
precision highp float;
varying vec2 uv;
uniform float blue;
void main () {
  gl_FragColor = vec4(uv.x, uv.y, blue, 1.0);
}`,
  },
});

const HelloGL = GL.createComponent(
  ({ blue }) => <GL.Node shader={shaders.helloGL} uniforms={{ blue }} />,
  { displayName: 'HelloGL' },
);

const App = () => {
  const fullRef = useRef();
  const headerRef = useRef();
  const formRef = useRef();
  const emptyRef = useRef();
  const complexRef = useRef();
  const svgRef = useRef();
  const glRef = useRef();
  const mapViewRef = useRef();
  const webviewRef = useRef();
  const videoRef = useRef();
  const transformParentRef = useRef();
  const transformRef = useRef();
  const surfaceRef = useRef();

  const [previewSource, setPreviewSource] = useState(catsSource);

  const [result, setResult] = useState({ error: null, res: null });

  const [config, setConfig] = useState({
    format: 'png',
    quality: 0.9,
    result: 'tmpfile',
    snapshotContentContainer: false,
  });

  const onCapture = useCallback(
    res => {
      if (config.result === 'base64') {
        const b = Buffer.from(res, 'base64');
        console.log('buffer of length ' + b.length);
      }
      setPreviewSource({
        uri: config.result === 'base64' ? 'data:image/' + config.format + ';base64,' + res : res,
      });
      setResult({
        error: null,
        res,
      });
    },
    [config],
  );

  const onCaptureFailure = useCallback(error => {
    console.warn(error);
    setPreviewSource(null);
    setResult({
      error,
      res: null,
    });
  }, []);

  const capture = useCallback(
    ref => {
      (ref ? captureRef(ref, config) : captureScreen(config))
        .then(res =>
          config.result !== 'tmpfile'
            ? res
            : new Promise((success, failure) =>
                // just a test to ensure res can be used in Image.getSize
                Image.getSize(res, (width, height) => success(res), failure),
              ),
        )
        .then(onCapture, onCaptureFailure);
    },
    [config, onCapture, onCaptureFailure],
  );

  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.root}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          ref={fullRef}
          contentContainerStyle={styles.container}
        >
          <View ref={headerRef} style={styles.header}>
            <Text style={styles.title}>😃 ViewShot Example 😜</Text>
            <View style={styles.p1}>
              <Text style={styles.text}>This is a </Text>
              <Text style={styles.code}>react-native-view-shot</Text>
              <Text style={styles.text}> showcase.</Text>
            </View>
            <View style={styles.preview}>
              {result.error ? (
                <Text style={styles.previewError}>
                  {'' + (result.error.message || result.error)}
                </Text>
              ) : (
                <Image
                  fadeDuration={0}
                  resizeMode="contain"
                  style={styles.previewImage}
                  source={previewSource}
                />
              )}
            </View>
            <Text numberOfLines={1} style={styles.previewUriText}>
              {result.res ? result.res.slice(0, 200) : ''}
            </Text>
          </View>

          <View ref={formRef} style={styles.form}>
            <View style={styles.btns}>
              <Btn label="😻 Reset" onPress={() => setPreviewSource(catsSource)} />
              <Btn label="📷 Head Section" onPress={() => capture(headerRef)} />
              <Btn label="📷 Form" onPress={() => capture(formRef)} />
              <Btn label="📷 Experimental Section" onPress={() => capture(complexRef)} />
              <Btn label="📷 All (ScrollView)" onPress={() => capture(fullRef)} />
              <Btn label="📷 SVG" onPress={() => capture(svgRef)} />
              <Btn label="📷 Transform" onPress={() => capture(transformParentRef)} />
              <Btn label="📷 Transform Child" onPress={() => capture(transformRef)} />
              <Btn label="📷 GL React" onPress={() => capture(glRef)} />
              <Btn label="📷 MapView" onPress={() => capture(mapViewRef)} />
              <Btn label="📷 WebView" onPress={() => capture(webviewRef)} />
              <Btn label="📷 Video" onPress={() => capture(videoRef)} />
              <Btn label="📷 Native Screenshot" onPress={() => capture()} />
              <Btn label="📷 Empty View (should crash)" onPress={() => capture(emptyRef)} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Format</Text>
              <Picker
                style={styles.input}
                selectedValue={config.format}
                onValueChange={format => setConfig({ ...config, format })}
              >
                <Picker.Item label="PNG" value="png" />
                <Picker.Item label="JPEG" value="jpg" />
                <Picker.Item label="WEBM (android only)" value="webm" />
                <Picker.Item label="RAW (android only)" value="raw" />
                <Picker.Item label="INVALID" value="_invalid_" />
              </Picker>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Quality</Text>
              <Slider
                style={styles.input}
                value={config.quality}
                onValueChange={quality => setConfig({ ...config, quality })}
              />
              <Text>{(config.quality * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Size</Text>
              <Switch
                style={styles.switch}
                value={config.width !== undefined}
                onValueChange={checked =>
                  setConfig(
                    omit(
                      {
                        ...config,
                        width: 300,
                        height: 300,
                      },
                      checked ? [] : ['width', 'height'],
                    ),
                  )
                }
              />
              {config.width !== undefined ? (
                <TextInput
                  style={styles.inputText}
                  value={'' + config.width}
                  keyboardType="number-pad"
                  onChangeText={txt =>
                    !isNaN(txt) && setConfig({ ...config, width: parseInt(txt, 10) })
                  }
                />
              ) : (
                <Text style={styles.inputText}>(auto)</Text>
              )}
              <Text>x</Text>
              {config.height !== undefined ? (
                <TextInput
                  style={styles.inputText}
                  value={'' + config.height}
                  keyboardType="number-pad"
                  onChangeText={txt =>
                    !isNaN(txt) && setConfig({ ...config, height: parseInt(txt, 10) })
                  }
                />
              ) : (
                <Text style={styles.inputText}>(auto)</Text>
              )}
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Result</Text>
              <Picker
                style={styles.input}
                selectedValue={config.result}
                onValueChange={r => setConfig({ ...config, result: r })}
              >
                <Picker.Item label="tmpfile" value="tmpfile" />
                <Picker.Item label="base64" value="base64" />
                <Picker.Item label="zip-base64 (Android Only)" value="zip-base64" />
                <Picker.Item label="data URI" value="data-uri" />
                <Picker.Item label="INVALID" value="_invalid_" />
              </Picker>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>snapshotContentContainer</Text>
              <Switch
                style={styles.switch}
                value={config.snapshotContentContainer}
                onValueChange={snapshotContentContainer =>
                  setConfig({ ...config, snapshotContentContainer })
                }
              />
            </View>
          </View>
          <View ref={emptyRef} collapsable={false} />
          <View style={styles.experimental} ref={complexRef} collapsable={false}>
            <Text style={styles.experimentalTitle}>Experimental Stuff</Text>
            <View ref={transformParentRef} collapsable={false} style={styles.experimentalRoot}>
              <View collapsable={false} style={styles.experimentalTransform}>
                <Text ref={transformRef}>Transform</Text>
                <ART.Surface ref={surfaceRef} width={20} height={20}>
                  <ART.Text fill="#000000" font={{ fontFamily: 'Arial', fontSize: 6 }}>
                    Sample Text
                  </ART.Text>
                  <ART.Shape
                    d="M2.876,10.6499757 L16.375,18.3966817 C16.715,18.5915989 17.011,18.4606545 17.125,18.3956822 C17.237,18.3307098 17.499,18.1367923 17.499,17.746958 L17.499,2.25254636 C17.499,1.86271212 17.237,1.66879457 17.125,1.6038222 C17.011,1.53884983 16.715,1.4079055 16.375,1.60282262 L2.876,9.34952866 C2.537,9.54544536 2.5,9.86930765 2.5,10.000252 C2.5,10.1301967 2.537,10.4550586 2.876,10.6499757 M16.749,20 C16.364,20 15.98,19.8990429 15.629,19.6971288 L2.13,11.9504227 L2.129,11.9504227 C1.422,11.5445953 1,10.8149056 1,10.000252 C1,9.18459879 1.422,8.45590864 2.129,8.04908162 L15.629,0.302375584 C16.332,-0.10245228 17.173,-0.10045313 17.876,0.306373884 C18.579,0.713200898 18.999,1.44089148 18.999,2.25254636 L18.999,17.746958 C18.999,18.5586129 18.579,19.2863035 17.876,19.6931305 C17.523,19.8970438 17.136,20 16.749,20"
                    fill="blue"
                    stroke="black"
                    strokeWidth={0}
                  />
                </ART.Surface>
              </View>
              <View style={styles.experimentalTransformV2}>
                <ART.Surface width={20} height={20}>
                  <ART.Shape
                    x={0}
                    y={10}
                    d="M2.876,10.6499757 L16.375,18.3966817 C16.715,18.5915989 17.011,18.4606545 17.125,18.3956822 C17.237,18.3307098 17.499,18.1367923 17.499,17.746958 L17.499,2.25254636 C17.499,1.86271212 17.237,1.66879457 17.125,1.6038222 C17.011,1.53884983 16.715,1.4079055 16.375,1.60282262 L2.876,9.34952866 C2.537,9.54544536 2.5,9.86930765 2.5,10.000252 C2.5,10.1301967 2.537,10.4550586 2.876,10.6499757 M16.749,20 C16.364,20 15.98,19.8990429 15.629,19.6971288 L2.13,11.9504227 L2.129,11.9504227 C1.422,11.5445953 1,10.8149056 1,10.000252 C1,9.18459879 1.422,8.45590864 2.129,8.04908162 L15.629,0.302375584 C16.332,-0.10245228 17.173,-0.10045313 17.876,0.306373884 C18.579,0.713200898 18.999,1.44089148 18.999,2.25254636 L18.999,17.746958 C18.999,18.5586129 18.579,19.2863035 17.876,19.6931305 C17.523,19.8970438 17.136,20 16.749,20"
                    fill="red"
                  />
                </ART.Surface>
              </View>
            </View>
            <View ref={svgRef} collapsable={false}>
              <SvgUri width={200} height={200} source={require('./homer-simpson.svg')} />
            </View>
            <View ref={glRef} collapsable={false}>
              <Surface width={300} height={300}>
                <HelloGL blue={0.5} />
              </Surface>
            </View>
            <MapView
              ref={mapViewRef}
              initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              style={{ width: 300, height: 300 }}
            />
            <View ref={webviewRef} collapsable={false} style={{ width: 300, height: 300 }}>
              <WebView
                source={{
                  uri: 'https://github.com/gre/react-native-view-shot',
                }}
              />
            </View>
            <Video
              ref={videoRef}
              style={{ width: 300, height: 300 }}
              source={require('./broadchurch.mp4')}
              volume={0}
              repeat
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#f6f6f6',
  },
  container: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  experimental: {
    padding: 10,
    flexDirection: 'column',
    alignItems: 'center',
  },
  experimentalTitle: {
    fontSize: 16,
    margin: 10,
  },
  experimentalTransform: {
    transform: [{ rotate: '180deg' }],
    backgroundColor: 'powderblue',
  },
  experimentalTransformV2: {
    //    transform: [{ rotate: '180deg' }],
    backgroundColor: 'skyblue',
  },
  p1: {
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#333',
  },
  code: {
    fontWeight: 'bold',
    color: '#000',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  label: {
    minWidth: 80,
    fontStyle: 'italic',
    color: '#888',
  },
  switch: {
    marginRight: 50,
  },
  input: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputText: {
    flex: 1,
    marginHorizontal: 5,
    color: 'red',
    textAlign: 'center',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  previewImage: {
    width: 375,
    height: 300,
  },
  previewUriText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    padding: 10,
    paddingBottom: 0,
  },
  previewError: {
    width: 375,
    height: 300,
    paddingTop: 20,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#c00',
  },
  header: {
    backgroundColor: '#f6f6f6',
    borderColor: '#000',
    borderWidth: 1,
    paddingBottom: 20,
  },
  form: {
    backgroundColor: '#fff',
  },
  btns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    margin: 4,
  },
  experimentalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
});

App.navigationOptions = {
  title: 'Full Example',
};

export default App;
