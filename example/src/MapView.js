//@flow
import React, { useState, useCallback } from 'react';
import { SafeAreaView, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';
import MapView from 'react-native-maps';
import Desc from './Desc';

const dimension = { width: 300, height: 300 };

const MapViewExample = () => {
  const [source, setSource] = useState(null);
  const onCapture = useCallback(uri => setSource({ uri }), []);
  return (
    <SafeAreaView>
      <ViewShot onCapture={onCapture} captureMode="continuous" style={dimension}>
        <MapView
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          style={dimension}
        />
      </ViewShot>

      <Desc desc="above is a map view and below is a continuous screenshot of it" />

      <Image fadeDuration={0} source={source} style={dimension} />
    </SafeAreaView>
  );
};

MapViewExample.navigationOptions = {
  title: 'react-native-maps',
};

export default MapViewExample;
