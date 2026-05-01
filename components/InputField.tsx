import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  icon?: React.ReactNode;
  keyboardType?: 'default' | 'email-address' | 'numeric';
}

export default function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  icon,
  keyboardType = 'default',
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPassword = secureTextEntry;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[styles.input, !icon && { paddingLeft: 16 }]}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                stroke="#8E8E93"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle
                cx="12"
                cy="12"
                r="3"
                stroke="#8E8E93"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {isPasswordVisible && (
                <Path
                  d="M3 3l18 18"
                  stroke="#8E8E93"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3250',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 56,
  },
  inputFocused: {
    borderColor: '#2D3250',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#C55A5A',
    backgroundColor: '#FFF5F5',
  },
  iconContainer: {
    paddingLeft: 16,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#2D3250',
    fontSize: 15,
  },
  eyeIcon: {
    padding: 16,
  },
  errorText: {
    color: '#C55A5A',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});
