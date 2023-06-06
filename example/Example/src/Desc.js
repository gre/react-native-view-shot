//@flow
import React from 'react';
import { StyleSheet, Text } from 'react-native';

const styles = StyleSheet.create({
  desc: {
    marginHorizontal: 10,
    marginVertical: 20,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
  },
});

const Desc = ({ desc }: { desc: string }) => {
  return <Text style={styles.desc}>{desc}</Text>;
};

export default Desc;
