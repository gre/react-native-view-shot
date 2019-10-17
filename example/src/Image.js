//@flow
import React, { Fragment, useState, useCallback, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, Text, Image, Modal } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import Btn from './Btn';
import Desc from './Desc';

const styles = StyleSheet.create({
  root: {
    padding: 50,
  },
  preview: {
    marginTop: 20,
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: '#aaa',
  },
  modal: {
    alignSelf: 'flex-end',
    padding: 20,
    backgroundColor: '#eee',
  },
  buttons: {
    flexDirection: 'row',
  },
});

const ImageExample = () => {
  const [source, setSource] = useState(null);
  const imageRef = useRef();

  const onCapture = useCallback(base64 => {
    setSource({ uri: "data:image/jpg;base64," + base64 });
  }, []);

  const onPressCapture = useCallback(() => {
    captureRef(imageRef, {
      result: 'base64',
      format: 'jpg'
    }).then(onCapture);
  }, [onCapture]);

  return (
    <Fragment>
      <SafeAreaView>
        <View style={styles.root}>
          <Btn onPress={onPressCapture} label="Capture Image" />
          <Image ref={imageRef} source={require('./cat.jpg')} style={styles.preview} resizeMode="contain" />
          <Image source={source} style={styles.preview} resizeMode="contain" />
        </View>
      </SafeAreaView>

    </Fragment>
  );
};

ImageExample.navigationOptions = {
  title: 'Image',
};

export default ImageExample;
