import React from "react";
import {View, Text, StyleSheet} from "react-native";

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  backgroundColor?: string;
  borderColor?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  backgroundColor = "#FFFFFF",
  borderColor = "#ddd",
}) => {
  return (
    <View style={[styles.container, {backgroundColor, borderColor}]}>
      <Text style={styles.title}>{title}</Text>
      <View>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: "100%",
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
});

export default InfoCard;
