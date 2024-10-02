//@flow
import React, { useState, useCallback } from "react";
import { SafeAreaView, Image } from "react-native";
import ViewShot from "react-native-view-shot";
import { SvgUri } from "react-native-svg";
import Desc from "./Desc";

const dimension = { width: 300, height: 300 };

const SvgUriExample = () => {
  const [source, setSource] = useState(null);
  const onCapture = useCallback(uri => setSource({ uri }), []);
  return (
    <SafeAreaView>
      <ViewShot
        onCapture={onCapture}
        captureMode="continuous"
        style={dimension}
      >
        <SvgUri
          width="100%"
          height="100%"
          uri="https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/heliocentric.svg"
        />
      </ViewShot>

      <Desc desc="above is an SVG view and below is a continuous screenshot of it" />

      <Image fadeDuration={0} source={source} style={dimension} />
    </SafeAreaView>
  );
};

SvgUriExample.navigationOptions = {
  title: "react-native-svg-uri",
};

export default SvgUriExample;
