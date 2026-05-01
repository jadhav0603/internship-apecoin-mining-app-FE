import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.blackAlpha72,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  modalBox: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.lime500Alpha14,
    overflow: 'hidden',
    shadowColor: COLORS.green300,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  glowOrb: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.green300Alpha08,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.whiteAlpha05,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha08,
    zIndex: 2,
  },
  title: {
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FONTS.bold,
    marginTop: 8,
    marginBottom: 14,
  },
  descriptionRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  descriptionIcon: {
    color: COLORS.activeBorder,
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    color: COLORS.lime100Alpha72,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  selectorSection: {
    marginBottom: 20,
    paddingTop: 6,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  optionItem: {
    flex: 1,
  },
  optionVisualRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  connectorSegment: {
    flex: 1,
    height: 2,
    marginTop: 20,
    backgroundColor: COLORS.whiteAlpha12,
  },
  connectorSegmentActive: {
    backgroundColor: COLORS.green300Alpha90,
  },
  connectorSpacer: {
    flex: 1,
  },
  optionWrap: {
    alignItems: 'center',
    width: 54,
  },
  optionCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.whiteAlpha14,
    marginBottom: 10,
  },
  optionCircleActive: {
    shadowColor: COLORS.green300,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
    borderColor: COLORS.green100Alpha42,
  },
  optionCircleLocked: {
    opacity: 0.7,
    borderColor: COLORS.whiteAlpha10,
  },
  lockIcon: {
    fontSize: 15,
    lineHeight: 18,
  },
  optionLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
  optionLabelActive: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.semibold,
  },
  optionLabelLocked: {
    color: COLORS.neutral300Alpha62,
  },
  note: {
    color: COLORS.lime100Alpha48,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 18,
  },
  confirmBtn: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.orange400,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  confirmBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmText: {
    color: COLORS.orange100,
    fontSize: 16,
    fontFamily: FONTS.bold,
    letterSpacing: 0.3,
  },
  confirmTextDisabled: {
    color: COLORS.whiteAlpha58,
  },
});

export default styles;
