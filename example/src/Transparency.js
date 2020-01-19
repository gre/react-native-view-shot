/* eslint-disable react-native/no-inline-styles */
//@flow
import React, { useCallback, useState } from 'react';
import { View, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';

const Transparency = () => {
  const [source, setSource] = useState(null);
  const onCapture = useCallback(uri => setSource({ uri }), []);
  return (
    <View
      style={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        flex: 1,
        backgroundColor: '#ccc',
      }}
    >
      <ViewShot onCapture={onCapture} captureMode="mount" style={{ width: 100, height: 100 }}>
        <View
          style={{
            borderRadius: 50,
            padding: 10,
            width: 100,
            height: 100,
            backgroundColor: 'cyan',
            borderWidth: 2,
            borderColor: 'blue',
          }}
        />
      </ViewShot>
      <View
        style={{
          backgroundColor: '#f00',
          width: 150,
          height: 150,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image fadeDuration={0} source={source} style={{ width: 100, height: 100 }} />
      </View>
    </View>
  );
};

Transparency.navigationProps = {
  title: 'Transparency',
};

export default Transparency;
