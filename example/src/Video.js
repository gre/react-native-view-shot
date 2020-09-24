//@flow
import React, { useState, useCallback } from 'react';
import { SafeAreaView, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Video from 'react-native-video';
import Desc from './Desc';

const dimension = { width: 300, height: 300 };

const VideoExample = () => {
  const [source, setSource] = useState(null);
  const onCapture = useCallback(uri => setSource({ uri }), []);
  return (
    <SafeAreaView>
      <ViewShot onCapture={onCapture} captureMode="continuous" style={dimension}>
        <Video style={dimension} source={require('./broadchurch.mp4')} volume={0} repeat />
      </ViewShot>

      <Desc desc="above is a video and below is a continuous screenshot of it" />

      <Image fadeDuration={0} source={source} style={dimension} />
    </SafeAreaView>
  );
};

VideoExample.navigationOptions = {
  title: 'react-native-video',
};

export default VideoExample;
