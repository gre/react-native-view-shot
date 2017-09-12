import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Switch,
  TextInput,
  Picker,
  Slider,
  WebView,
} from "react-native";
import omit from "lodash/omit";
import { takeSnapshot } from "react-native-view-shot";
// import { Surface } from "gl-react-native";
// import GL from "gl-react";
// import MapView from "react-native-maps";
import Video from "react-native-video";
import Btn from "./Btn";

const catsSource = {
  uri: "https://i.imgur.com/5EOyTDQ.jpg",
};

/*const shaders = GL.Shaders.create({
  helloGL: {
    frag: `
precision highp float;
varying vec2 uv;
uniform float blue;
void main () {
  gl_FragColor = vec4(uv.x, uv.y, blue, 1.0);
}`
  }
});

const HelloGL = GL.createComponent(
  ({ blue }) =>
  <GL.Node
    shader={shaders.helloGL}
    uniforms={{ blue }}
  />,
  { displayName: "HelloGL" });*/

export default class App extends Component {
  state = {
    previewSource: catsSource,
    error: null,
    res: null,
    value: {
      format: "png",
      quality: 0.9,
      result: "file",
      snapshotContentContainer: false,
    },
  };

  snapshot = refname => () =>
    takeSnapshot(this.refs[refname], this.state.value)
    .then(res =>
      this.state.value.result !== "file"
      ? res
      : new Promise((success, failure) =>
      // just a test to ensure res can be used in Image.getSize
      Image.getSize(
        res,
        (width, height) => (console.log(res,width,height), success(res)),
        failure)))
    .then(res => this.setState({
      error: null,
      res,
      previewSource: { uri:
        this.state.value.result === "base64"
        ? "data:image/"+this.state.value.format+";base64,"+res
        : res }
    }))
    .catch(error => (console.warn(error), this.setState({ error, res: null, previewSource: null })));

  render() {
    const { value, previewSource, error, res } = this.state;
    const { format, quality, width, height, result, snapshotContentContainer } = value;
    return (
      <ScrollView
        ref="full"
        style={styles.root}
        contentContainerStyle={styles.container}>
        <View
          ref="header"
          style={styles.header}>
          <Text style={styles.title}>
            😃 ViewShot Example 😜
          </Text>
          <View style={styles.p1}>
            <Text style={styles.text}>
              This is a{" "}
            </Text>
            <Text style={styles.code}>
              react-native-view-shot
            </Text>
            <Text style={styles.text}>
            {" "}showcase.
            </Text>
          </View>
          <View style={styles.preview}>
            { error
              ? <Text style={styles.previewError}>
                  {""+(error.message || error)}
                </Text>
              : <Image
                  fadeDuration={0}
                  resizeMode="contain"
                  style={styles.previewImage}
                  source={previewSource}
                /> }
          </View>
          <Text numberOfLines={1} style={styles.previewUriText}>
          {res ? res.slice(0, 200) : ""}
          </Text>
        </View>
        <View
          ref="form"
          style={styles.form}>
          <View style={styles.btns}>
            <Btn label="😻 Reset" onPress={() => this.setState({ previewSource: catsSource })} />
            <Btn label="📷 Head Section" onPress={this.snapshot("header")} />
            <Btn label="📷 Form" onPress={this.snapshot("form")} />
            <Btn label="📷 Experimental Section" onPress={this.snapshot("complex")} />
            <Btn label="📷 All (ScrollView)" onPress={this.snapshot("full")} />
            <Btn label="📷 GL React" onPress={this.snapshot("gl")} />
            <Btn label="📷 MapView" onPress={this.snapshot("mapview")} />
            <Btn label="📷 WebView" onPress={this.snapshot("webview")} />
            <Btn label="📷 Video" onPress={this.snapshot("video")} />
            <Btn label="📷 Empty View (should crash)" onPress={this.snapshot("empty")} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Format</Text>
            <Picker
              style={styles.input}
              selectedValue={format}
              onValueChange={format => this.setState({ value: { ...value, format } })}>
              <Picker.Item label="PNG" value="png" />
              <Picker.Item label="JPEG" value="jpeg" />
              <Picker.Item label="WEBM (android only)" value="webm" />
              <Picker.Item label="INVALID" value="_invalid_" />
            </Picker>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Quality</Text>
            <Slider
              style={styles.input}
              value={quality}
              onValueChange={quality => this.setState({ value: { ...value, quality } })}
            />
            <Text>{(quality*100).toFixed(0)}%</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Size</Text>
            <Switch
              style={styles.switch}
              value={width!==undefined}
              onValueChange={checked => this.setState({
                value: omit({
                  ...value,
                  width: 300,
                  height: 300,
                }, checked ? [] : ["width","height"])
              })}
            />
            { width!==undefined ? <TextInput
              style={styles.inputText}
              value={""+width}
              keyboardType="number-pad"
              onChangeText={txt => !isNaN(txt) && this.setState({
                value: { ...value, width: parseInt(txt, 10) }
              })}
            /> : <Text style={styles.inputText}>(auto)</Text> }
            <Text>x</Text>
            { height!==undefined ? <TextInput
              style={styles.inputText}
              value={""+height}
              keyboardType="number-pad"
              onChangeText={txt => !isNaN(txt) && this.setState({
                value: { ...value, height: parseInt(txt, 10) }
              })}
            /> : <Text style={styles.inputText}>(auto)</Text> }
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Result</Text>
            <Picker
              style={styles.input}
              selectedValue={result}
              onValueChange={result => this.setState({ value: { ...value, result } })}>
              <Picker.Item label="file" value="file" />
              <Picker.Item label="base64" value="base64" />
              <Picker.Item label="data URI" value="data-uri" />
              <Picker.Item label="INVALID" value="_invalid_" />
            </Picker>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>snapshotContentContainer</Text>
            <Switch
              style={styles.switch}
              value={snapshotContentContainer}
              onValueChange={snapshotContentContainer => this.setState({
                value: { ...value, snapshotContentContainer }
              })}
            />
          </View>
        </View>
        <View ref="empty" collapsable={false} />
        <View style={styles.experimental} ref="complex" collapsable={false}>
          <Text style={styles.experimentalTitle}>Experimental Stuff</Text>
          {/*<Surface ref="gl" width={300} height={300}>
            <HelloGL blue={0.5} />
          </Surface>
          <MapView
             ref="mapview"
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            style={{ width: 300, height: 300 }}
          />*/}
          <View
            ref="webview"
            collapsable={false}
            style={{ width: 300, height: 300 }}>
            <WebView
              source={{
                uri: "https://github.com/gre/react-native-view-shot"
              }}
            />
          </View>
          <Video
            ref="video"
            style={{ width: 300, height: 300 }}
            source={require("./broadchurch.mp4")}
            volume={0}
            repeat
          />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  container: {
    paddingVertical: 20,
    backgroundColor: "#f6f6f6",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
  experimental: {
    padding: 10,
    flexDirection: "column",
    alignItems: "center",
  },
  experimentalTitle: {
    fontSize: 16,
    margin: 10,
  },
  p1: {
    marginBottom: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#333",
  },
  code: {
    fontWeight: "bold",
    color: "#000",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  label: {
    minWidth: 80,
    fontStyle: "italic",
    color: "#888",
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
    color: "red",
    textAlign: "center",
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  previewImage: {
    width: 375,
    height: 300,
  },
  previewUriText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
    padding: 10,
    paddingBottom: 0,
  },
  previewError: {
    width: 375,
    height: 300,
    paddingTop: 20,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#c00",
  },
  header: {
    backgroundColor: "#f6f6f6",
    borderColor: "#000",
    borderWidth: 1,
    paddingBottom: 20,
  },
  form: {
    backgroundColor: "#fff",
  },
  btns: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    margin: 4,
  }
});
