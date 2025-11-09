/**
 * Centralized styles and theme system
 * Export all style-related constants and StyleSheet objects
 */

export { colors } from './colors';
export { spacing, typography, borderRadius, shadows } from './spacing';
export { commonStyles } from './commonStyles';
export { modalStyles } from './modalStyles';

// Re-export everything for convenience
import { colors } from './colors';
import { spacing, typography, borderRadius, shadows } from './spacing';
import { commonStyles } from './commonStyles';
import { modalStyles } from './modalStyles';

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  commonStyles,
  modalStyles,
};

