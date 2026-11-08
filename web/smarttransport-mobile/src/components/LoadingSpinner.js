import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function LoadingSpinner({ visible = true }) {
  if (!visible) return null;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

