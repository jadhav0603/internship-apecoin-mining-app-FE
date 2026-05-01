import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { COLORS } from '../../constants/COLORS';
import {
  MAX_TICKET_ATTACHMENTS,
  TICKET_THEME,
} from './ticketTheme';

const styles = StyleSheet.create({
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: TICKET_THEME.inputBorder,
    backgroundColor: COLORS.green950Tone6,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TICKET_THEME.successSoft,
    marginBottom: 12,
  },
  uploadTitle: {
    color: TICKET_THEME.accent,
    fontSize: 17,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  uploadSubtitle: {
    color: TICKET_THEME.textMuted,
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginTop: 8,
    textAlign: 'center',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 12,
  },
  previewCard: {
    width: 90,
    height: 90,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: TICKET_THEME.input,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: TICKET_THEME.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.blackAlpha70,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default styles;
