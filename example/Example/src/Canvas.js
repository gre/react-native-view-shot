//@flow
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { SafeAreaView, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Canvas from 'react-native-canvas';

const dimension = { width: 300, height: 300 };

const CanvasRendering = ({ onDrawn }) => {
  const ref = useRef();
  useEffect(() => {
    const ctx = ref.current.getContext('2d');
    ctx.fillStyle = '#eee';
    ctx.fillRect(0, 0, ref.current.width, ref.current.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(120, 30, 60, 60);
    ctx.fillStyle = 'blue';
    ctx.fillRect(140, 50, 60, 60);
    const timeout = setTimeout(onDrawn, 1000); // hack. react-native-canvas have no way to tell when it's executed
    return () => clearTimeout(timeout);
  }, [onDrawn]);
  return <Canvas ref={ref} style={dimension} />;
};

const CanvasExample = () => {
  const [source, setSource] = useState(null);
  const viewShotRef = useRef();
  const onCapture = useCallback(() => {
    viewShotRef.current.capture().then(uri => setSource({ uri }));
  }, []);
  return (
    <SafeAreaView>
      <ViewShot ref={viewShotRef} style={dimension}>
        <CanvasRendering onDrawn={onCapture} />
      </ViewShot>

      <Image fadeDuration={0} source={source} style={dimension} />
    </SafeAreaView>
  );
};

CanvasExample.navigationOptions = {
  title: 'react-native-canvas',
};

export default CanvasExample;
