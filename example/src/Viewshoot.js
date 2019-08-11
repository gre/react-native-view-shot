import React, { useCallback, useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import Btn from './Btn';

const Viewshoot = () => {
  const full = useRef();
  const [preview, setPreview] = useState(null);
  const [itemsCount, setItemsCount] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  const onCapture = useCallback(() => {
    full.current.capture().then(uri => setPreview({ uri }));
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.root}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setTimeout(() => {
              setItemsCount(itemsCount + 10);
              setRefreshing(false);
            }, 5000);
          }}
        />
      }
    >
      <SafeAreaView>
        <ViewShot ref={full} style={styles.container}>
          <Btn onPress={onCapture} label="Shoot Me" />

          <Image
            fadeDuration={0}
            resizeMode="contain"
            style={styles.previewImage}
            source={preview}
          />

          {Array(itemsCount)
            .fill(null)
            .map((_, index) => ({
              key: index,
              text: `${index + 1}`,
              color: `hsl(${(index * 13) % 360}, 50%, 80%)`,
            }))
            .map(({ key, text, color }) => {
              return (
                <View style={[styles.item, { backgroundColor: color }]} key={key}>
                  <Text style={styles.itemText}>{text}</Text>
                </View>
              );
            })}
        </ViewShot>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  root: {
    paddingVertical: 20,
  },
  content: {
    backgroundColor: '#fff',
  },
  item: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 22,
    color: '#666',
  },
  previewImage: {
    height: 200,
    backgroundColor: 'black',
  },
});

Viewshoot.navigationProps = {
  title: 'Viewshoot',
};

export default Viewshoot;
