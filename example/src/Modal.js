//@flow
import React, { Fragment, useState, useCallback, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, Text, Image, Modal } from 'react-native';
import { captureScreen, captureRef } from 'react-native-view-shot';
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

const ModalExample = () => {
  const [opened, setOpened] = useState(false);
  const [source, setSource] = useState(null);
  const modalRef = useRef();

  const onOpenModal = useCallback(() => setOpened(true), []);

  const onCapture = useCallback(uri => {
    setSource({ uri });
    setOpened(false);
  }, []);

  const onPressCapture = useCallback(() => {
    captureScreen().then(onCapture);
  }, [onCapture]);

  const onPressCaptureModalContent = useCallback(() => {
    captureRef(modalRef).then(onCapture);
  }, [onCapture]);

  return (
    <Fragment>
      <SafeAreaView>
        <View style={styles.root}>
          <Desc
            desc="We can notice that, in current implementation, react-native-view-shot does not
            screenshot Modal as part of a captureScreen."
          />
          <Btn onPress={onOpenModal} label="Open Modal" />
          <Image fadeDuration={0} source={source} style={styles.preview} resizeMode="contain" />
        </View>
      </SafeAreaView>

      <Modal transparent animated animationType="slide" visible={opened}>
        <SafeAreaView>
          <View ref={modalRef} style={styles.modal}>
            <Text>This is a modal</Text>
            <View style={styles.buttons}>
              <Btn onPress={onPressCapture} label="Capture Screen" />
              <Btn onPress={onPressCaptureModalContent} label="Capture This" />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </Fragment>
  );
};

ModalExample.navigationOptions = {
  title: 'Modal',
};

export default ModalExample;
