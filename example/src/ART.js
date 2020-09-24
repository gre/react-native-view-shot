/* eslint-disable react-native/no-inline-styles */
//@flow
import React, { useState, useCallback } from 'react';
import { SafeAreaView, Image, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { Surface, Group, Shape } from '@react-native-community/art';
import Desc from './Desc';

const dimension = { width: 300, height: 300 };

const ARTExample = () => {
  const [source, setSource] = useState(null);
  const onCapture = useCallback(uri => setSource({ uri }), []);
  return (
    <SafeAreaView>
      <ViewShot onCapture={onCapture} captureMode="mount" style={dimension}>
        <View
          style={{
            height: 100,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'blue',
          }}
        >
          <Surface width={200} height={100}>
            <Group>
              <Shape d="M 0,50 L 320,60" stroke="red" strokeWidth={10} />
            </Group>
          </Surface>
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: 'orange',
              position: 'absolute',
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

ARTExample.navigationOptions = {
  title: '@react-native-community/art',
};

export default ARTExample;
