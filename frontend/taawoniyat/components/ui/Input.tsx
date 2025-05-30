import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { designSystem } from '@/theme/designSystem';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = [
    styles.container,
    style,
  ];

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
    disabled && styles.inputContainerDisabled,
  ];

  const textInputStyle = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    multiline && styles.inputMultiline,
    inputStyle,
  ];

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      <View style={inputContainerStyle}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={error ? designSystem.colors.error[500] : designSystem.colors.neutral[400]} 
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={textInputStyle}
          placeholder={placeholder}
          placeholderTextColor={designSystem.colors.neutral[400]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
        />
        
        {rightIcon && (
          <Ionicons 
            name={rightIcon} 
            size={20} 
            color={designSystem.colors.neutral[400]} 
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: designSystem.spacing.md,
  },
  
  label: {
    fontSize: designSystem.typography.sizes.sm,
    fontWeight: designSystem.typography.weights.medium,
    color: designSystem.colors.neutral[700],
    marginBottom: designSystem.spacing.xs,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: designSystem.colors.neutral[300],
    borderRadius: designSystem.borderRadius.md,
    paddingHorizontal: designSystem.spacing.md,
  },
  
  inputContainerFocused: {
    borderColor: designSystem.colors.primary[500],
    ...designSystem.shadows.sm,
  },
  
  inputContainerError: {
    borderColor: designSystem.colors.error[500],
  },
  
  inputContainerDisabled: {
    backgroundColor: designSystem.colors.neutral[100],
    opacity: 0.6,
  },
  
  input: {
    flex: 1,
    fontSize: designSystem.typography.sizes.base,
    color: designSystem.colors.neutral[900],
    paddingVertical: designSystem.spacing.sm + 4,
  },
  
  inputWithLeftIcon: {
    marginLeft: designSystem.spacing.sm,
  },
  
  inputWithRightIcon: {
    marginRight: designSystem.spacing.sm,
  },
  
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  
  leftIcon: {
    marginRight: designSystem.spacing.xs,
  },
  
  rightIcon: {
    marginLeft: designSystem.spacing.xs,
  },
  
  errorText: {
    fontSize: designSystem.typography.sizes.xs,
    color: designSystem.colors.error[500],
    marginTop: designSystem.spacing.xs,
  },
});
