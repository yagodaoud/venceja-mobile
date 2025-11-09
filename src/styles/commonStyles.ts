import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing, typography, borderRadius, shadows } from './spacing';

/**
 * Common reusable styles for the entire application
 * These styles are used across multiple components to ensure consistency
 */

export const commonStyles = StyleSheet.create({
  // ==================== Screen Styles ====================
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },

  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  screenTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },

  screenSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.tertiary,
  },

  screenContent: {
    flex: 1,
    padding: spacing.lg,
  },

  // ==================== Card Styles ====================
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  // ==================== Button Styles ====================
  button: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonPrimary: {
    backgroundColor: colors.primary,
  },

  buttonSecondary: {
    backgroundColor: colors.secondary,
  },

  buttonCancel: {
    borderWidth: 1,
    borderColor: colors.text.tertiary,
    backgroundColor: colors.background.primary,
  },

  buttonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },

  buttonTextPrimary: {
    color: colors.text.white,
  },

  buttonTextCancel: {
    color: colors.text.tertiary,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  // ==================== Input Styles ====================
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.sizes.lg,
    color: colors.text.secondary,
    backgroundColor: colors.background.primary,
  },

  inputFocused: {
    borderColor: colors.primary,
  },

  inputError: {
    borderColor: colors.error,
  },

  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },

  // ==================== Field Styles ====================
  field: {
    marginBottom: spacing.xl,
  },

  fieldRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  // ==================== List Styles ====================
  list: {
    paddingVertical: spacing.sm,
  },

  listItem: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
    ...shadows.md,
  },

  // ==================== Empty State Styles ====================
  empty: {
    padding: spacing.xxxxl,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: typography.sizes.lg,
    color: colors.text.tertiary,
  },

  // ==================== Section Styles ====================
  section: {
    backgroundColor: colors.background.primary,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  // ==================== Badge Styles ====================
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },

  // ==================== Status Badge Styles ====================
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },

  statusBadgeText: {
    color: colors.text.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },

  // ==================== Filter Styles ====================
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background.primary,
    marginRight: spacing.sm,
  },

  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filterButtonText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },

  filterButtonTextActive: {
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },

  // ==================== Action Button Styles ====================
  actionButton: {
    width: 80,
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },

  actionButtonEdit: {
    backgroundColor: colors.secondary,
  },

  actionButtonDelete: {
    backgroundColor: colors.error,
  },

  actionButtonText: {
    color: colors.text.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});

