import React from 'react';
import { Platform, View, KeyboardAvoidingView } from 'react-native';

export default function KeyboardAvoidingWrapper({ children, style, behavior, ...props }) {
  if (Platform.OS === 'web') {
    return (
      <View style={style} {...props}>
        {children}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={style} behavior={behavior} {...props}>
      {children}
    </KeyboardAvoidingView>
  );
}
