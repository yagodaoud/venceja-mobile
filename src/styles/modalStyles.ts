import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing, typography, borderRadius } from './spacing';

/**
 * Modal-specific styles
 * Extracted from all modal components to ensure consistency
 */

export const modalStyles = StyleSheet.create({
  // ==================== Base Modal Styles ====================
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.overlay,
    justifyContent: 'flex-end',
  },

  overlayCenter: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlayDark: {
    flex: 1,
    backgroundColor: colors.background.overlayDark,
  },

  modal: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    maxHeight: '90%',
  },

  modalCenter: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '80%',
    maxWidth: 300,
  },

  modalFullScreen: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    maxHeight: '80%',
  },

  // ==================== Modal Header Styles ====================
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  headerNoBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },

  titleLarge: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },

  closeButton: {
    padding: spacing.xs,
  },

  // ==================== Modal Content Styles ====================
  content: {
    maxHeight: 500,
  },

  contentScroll: {
    gap: spacing.md,
  },

  description: {
    fontSize: typography.sizes.md,
    color: colors.text.tertiary,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },

  // ==================== Modal Actions Styles ====================
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  actionsNoBorder: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },

  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionButtonCancel: {
    borderWidth: 1,
    borderColor: colors.text.tertiary,
    backgroundColor: colors.background.primary,
  },

  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },

  actionButtonSecondary: {
    backgroundColor: colors.secondary,
  },

  actionButtonDisabled: {
    opacity: 0.5,
  },

  actionButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },

  actionButtonTextCancel: {
    color: colors.text.tertiary,
  },

  actionButtonTextPrimary: {
    color: colors.text.white,
  },

  // ==================== Modal Option Styles ====================
  options: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },

  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },

  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  optionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  optionDescription: {
    fontSize: typography.sizes.md,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  // ==================== Modal List Option Styles ====================
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },

  modalOptionText: {
    fontSize: typography.sizes.lg,
    color: colors.text.secondary,
  },

  modalOptionTextSelected: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },

  // ==================== Image Preview Modal Styles ====================
  imagePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: 50,
    backgroundColor: colors.background.overlayLight,
  },

  imagePreviewTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text.white,
  },

  imagePreviewActions: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },

  imagePreviewButton: {
    padding: spacing.sm,
  },

  imagePreviewScrollView: {
    flex: 1,
  },

  imagePreviewScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },

  imagePreviewImage: {
    width: '100%',
    height: '100%',
    minHeight: 400,
  },

  // ==================== Image Container Styles ====================
  imageContainer: {
    position: 'relative',
    marginTop: spacing.sm,
  },

  image: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
  },

  removeImageButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.background.overlayLight,
    borderRadius: borderRadius.full,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ==================== Button Row Styles ====================
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  imageButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },

  imageButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});

