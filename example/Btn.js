//@flow
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  root: {
    margin: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: "#36f",
    borderWidth: 1,
    borderColor: "#36f",
    fontSize: 12
  }
});

export default class Btn extends Component {
  static propTypes = {
    onPress: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired
  };
  render() {
    const { onPress, label } = this.props;
    return (
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.root}>{label}</Text>
      </TouchableOpacity>
    );
  }
}
