import { COLORS } from '../../constants/COLORS';

export const TICKET_THEME = {
  background: COLORS.background,
  card: '#11190F',
  cardStrong: '#162114',
  cardBorder: 'rgba(166, 255, 0, 0.12)',
  input: '#1A2318',
  inputBorder: '#263221',
  textPrimary: COLORS.textPrimary,
  textSecondary: '#AFB5A8',
  textMuted: '#7E8776',
  accent: COLORS.primary,
  accentDark: COLORS.primaryDark,
  successSoft: 'rgba(166, 255, 0, 0.12)',
  priorityLow: '#9AE66E',
  priorityMedium: '#FFBF47',
  priorityHigh: '#FF6B6B',
  pending: '#FFBF47',
  divider: 'rgba(255,255,255,0.08)',
  danger: '#FF6B6B',
  overlay: 'rgba(0,0,0,0.45)',
};

export const ISSUE_CATEGORIES = [
  'Missing Reward',
  'Payment Issue',
  'Bug',
  'Other',
] as const;

export const ISSUE_PRIORITIES = ['low', 'medium', 'high'] as const;

export const MAX_TICKET_ATTACHMENTS = 5;
export const MAX_TICKET_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;

export const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'high':
      return TICKET_THEME.priorityHigh;
    case 'medium':
      return TICKET_THEME.priorityMedium;
    default:
      return TICKET_THEME.priorityLow;
  }
};
