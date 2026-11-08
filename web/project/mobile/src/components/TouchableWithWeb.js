import React from 'react';
import { TouchableOpacity, Platform, StyleSheet } from 'react-native';

const flattenStyle = (style) => {
  if (!style) return {};
  const flattened = StyleSheet.flatten(style);
  return typeof flattened === 'object' && flattened !== null ? flattened : {};
};

// Composant qui fonctionne à la fois avec tactile et souris
export default function TouchableWithWeb({ 
  children, 
  onPress, 
  style, 
  disabled = false,
  activeOpacity = 0.7,
  onPressIn,
  onPressOut,
  ...props 
}) {
  if (Platform.OS === 'web') {
    const webStyle = {
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'opacity 0.2s',
      ...flattenStyle(style),
    };

    return (
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={disabled ? undefined : onPress}
        onKeyPress={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPress?.();
          }
        }}
        onMouseDown={disabled ? undefined : onPressIn}
        onMouseUp={disabled ? undefined : onPressOut}
        style={webStyle}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={style}
      disabled={disabled}
      activeOpacity={activeOpacity}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}