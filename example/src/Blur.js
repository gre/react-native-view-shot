//@flow
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SafeAreaView, View, Image, findNodeHandle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import ViewShot from 'react-native-view-shot';
import Desc from './Desc';

const dimension = { width: 300, height: 300 };

const BlurExample = () => {
  const [source, setSource] = useState(null);
  const [viewHandle, setRefHandle] = useState(null);
  const onCapture = useCallback(uri => setSource({ uri }), []);
  const viewRef = useRef();
  const ref = useRef();
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (ref.current) ref.current.capture();
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);
  const absoluteDimension = { ...dimension, position: 'absolute' };
  return (
    <SafeAreaView>
      <ViewShot ref={ref} captureMode="mount" onCapture={onCapture} style={dimension}>
        <Image
          source={require('./bg.jpg')}
          style={absoluteDimension}
          ref={ref => setRefHandle(findNodeHandle(ref))}
        />
        <BlurView blurType="light" blurAmount={10} style={absoluteDimension} viewRef={viewHandle} />
      </ViewShot>

      <Desc desc="above is a blurred image and below is a screenshot of it" />

      <Image fadeDuration={0} source={source} style={dimension} />
    </SafeAreaView>
  );
};

BlurExample.navigationOptions = {
  title: 'react-native-community/blur',
};

export default BlurExample;
