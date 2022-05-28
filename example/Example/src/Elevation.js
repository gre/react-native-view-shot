//@flow
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SafeAreaView, View, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Desc from './Desc';

const dimension = { width: 200, height: 200 };

const ElevationExample = () => {
  const [source, setSource] = useState(null);
  const [viewHandle, setRefHandle] = useState(null);
  const onCapture = useCallback(uri => setSource({ uri }), []);
  const viewRef = useRef();
  const ref = useRef();
  return (
    <SafeAreaView>
      <ViewShot ref={ref} captureMode="mount" onCapture={onCapture} style={dimension}>
        <View
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            width: 80,
            height: 80,
            top: 40,
            left: 40,
            elevation: 1,
          }}
        />
        <View
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            width: 80,
            height: 80,
            top: 80,
            left: 80,
            elevation: 4,
          }}
        />

        <View
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            width: 10,
            height: 10,
            top: 20,
            left: 140,
            elevation: 1,
          }}
        />
        <View
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            width: 10,
            height: 10,
            top: 40,
            left: 140,
            elevation: 2,
          }}
        />
        <View
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            width: 10,
            height: 10,
            top: 60,
            left: 140,
            elevation: 3,
          }}
        />
      </ViewShot>

      <Desc desc="" />

      <Image fadeDuration={0} source={source} style={dimension} />
    </SafeAreaView>
  );
};

ElevationExample.navigationOptions = {
  title: 'Elevation',
};

export default ElevationExample;
