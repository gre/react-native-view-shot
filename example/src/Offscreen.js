//@flow
import React, { useState, useCallback } from 'react';
import { SafeAreaView, Image, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import SvgUri from 'react-native-svg-uri';
import Desc from './Desc';

const OffscreenViewShot = ({ width, height, ...rest }) => (
  <ViewShot {...rest} style={{ width, height, position: 'absolute', right: -width - 5 }} />
);

const OffscreenExample = () => {
  const [source, setSource] = useState(null);
  const onCapture = useCallback(uri => setSource({ uri }), []);

  const width = 300;
  const height = 300;

  return (
    <SafeAreaView>
      <Desc desc="We have rendered this SVG as image offscreen:" />
      <Image fadeDuration={0} source={source} style={{ width, height }} />

      <OffscreenViewShot
        captureMode="continuous"
        onCapture={onCapture}
        width={width}
        height={height}
      >
        <SvgUri width={200} height={200} source={require('./homer-simpson.svg')} />
      </OffscreenViewShot>
    </SafeAreaView>
  );
};

OffscreenExample.navigationOptions = {
  title: 'Offscreen',
};

export default OffscreenExample;
