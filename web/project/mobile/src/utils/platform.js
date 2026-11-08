import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isMobile = Platform.OS !== 'web';

export const getTouchProps = () => {
  if (isWeb) {
    return {
      onMouseDown: () => {},
      onMouseUp: () => {},
      onMouseEnter: () => {},
      onMouseLeave: () => {},
    };
  }
  return {};
};

// Pour les événements souris sur web
export const getCursorStyle = () => {
  if (isWeb) {
    return { cursor: 'pointer' };
  }
  return {};
};