import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ControlButton {
  label: string;
  onPress: () => void;
  backgroundColor?: string;
}

interface ControlsCardProps {
  title?: string;
  buttons: ControlButton[];
}

export const ControlsCard: React.FC<ControlsCardProps> = ({
  title = '⚙️ Controls:',
  buttons,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {buttons.map((button, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.toggleButton,
            { backgroundColor: button.backgroundColor || '#007AFF' },
          ]}
          onPress={button.onPress}
        >
          <Text style={styles.toggleText}>{button.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  toggleButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ControlsCard;
