import { COLORS } from '../../constants/COLORS';

export const TICKET_THEME = {
  background: COLORS.background,
  card: COLORS.green950Tone7,
  cardStrong: COLORS.green900Tone11,
  cardBorder: COLORS.lime500Alpha12Tone2,
  input: COLORS.green900Tone4,
  inputBorder: COLORS.green850Tone3,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.neutral300Tone2,
  textMuted: COLORS.neutral500Tone3,
  accent: COLORS.primary,
  accentDark: COLORS.primaryDark,
  successSoft: COLORS.lime500Alpha12Tone2,
  priorityLow: COLORS.lime300,
  priorityMedium: COLORS.orange400Tone2,
  priorityHigh: COLORS.red300,
  pending: COLORS.orange400Tone2,
  divider: COLORS.whiteAlpha08,
  danger: COLORS.red300,
  overlay: COLORS.blackAlpha45,
};

export const ISSUE_CATEGORIES = [
 'Reward Claim Issue',
'Withdrawal & Payment Support',
'Account Access Assistance',
'Bug / Technical Issue',
'Other Support Request'
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
