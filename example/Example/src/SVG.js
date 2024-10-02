/* eslint-disable react-native/no-inline-styles */
//@flow
import React, { useState, useCallback } from "react";
import { SafeAreaView, Image, View } from "react-native";
import ViewShot from "react-native-view-shot";
import { Svg, Path } from "react-native-svg";
import Desc from "./Desc";

const dimension = { width: 300, height: 300 };

const SVGExample = () => {
  const [source, setSource] = useState(null);
  const onCapture = useCallback(uri => setSource({ uri }), []);
  return (
    <SafeAreaView>
      <ViewShot onCapture={onCapture} captureMode="mount" style={dimension}>
        <View
          style={{
            height: 100,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "blue",
          }}
        >
          <Svg width={200} height={100}>
            <Path d="M 0,50 L 320,60" stroke="red" strokeWidth={10} />
          </Svg>
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: "orange",
              position: "absolute",
              top: 50,
            }}
          />
        </View>
      </ViewShot>

      <Desc desc="ART overlapping test" />

      <Image fadeDuration={0} source={source} style={dimension} />
    </SafeAreaView>
  );
};

SVGExample.navigationOptions = {
  title: "react-native-svg",
};

export default SVGExample;
