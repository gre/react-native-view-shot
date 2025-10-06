import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CaptureButtonProps {
  onPress: () => void;
  isCapturing: boolean;
  disabled?: boolean;
  captureText?: string;
  capturingText?: string;
  disabledText?: string;
  icon?: string;
}

export const CaptureButton: React.FC<CaptureButtonProps> = ({
  onPress,
  isCapturing,
  disabled = false,
  captureText = '📸 Capture',
  capturingText = '📸 Capturing...',
  disabledText = '⏳ Loading...',
  icon = '📸',
}) => {
  const getButtonText = () => {
    if (isCapturing) return capturingText;
    if (disabled) return disabledText;
    return captureText;
  };

  const getButtonColor = () => {
    if (isCapturing || disabled) return '#999';
    return '#007AFF';
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: getButtonColor() }]}
      onPress={onPress}
      disabled={isCapturing || disabled}
      testID="capture-button"
      accessible={true}
      accessibilityLabel="capture-button"
    >
      <Text style={styles.buttonText}>{getButtonText()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CaptureButton;
