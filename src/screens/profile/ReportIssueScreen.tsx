import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import AttachmentUploadBox, {
  type TicketAttachmentItem,
} from '../../components/tickets/AttachmentUploadBox';
import PrioritySelector from '../../components/tickets/PrioritySelector';
import TicketHeader from '../../components/tickets/TicketHeader';
import {
  ISSUE_CATEGORIES,
  MAX_TICKET_ATTACHMENTS,
  MAX_TICKET_ATTACHMENT_SIZE_BYTES,
  TICKET_THEME,
} from '../../components/tickets/ticketTheme';
import { useUser } from '../../context/UserContext';
import { useAlert } from '../../context/AlertContext';
import { FONTS } from '../../constants/FONTS';
import { RootStackParamList } from '../../navigation/types';
import { ticketService, type TicketItem, type TicketPriority } from '../../services/ticketService';

const ALLOWED_ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const formatCompactDate = (value?: string) => {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const ReportIssueScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { showConfirm, showError, showWarning } = useAlert();

  const [category, setCategory] = useState<string>('');
  const [priority, setPriority] = useState<TicketPriority | ''>('');
  const [description, setDescription] = useState('');
  const [allowContact, setAllowContact] = useState(false);
  const [contactEmail, setContactEmail] = useState(user?.email ?? '');
  const [contactPhone, setContactPhone] = useState('');
  const [attachments, setAttachments] = useState<TicketAttachmentItem[]>([]);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isRefreshingReports, setIsRefreshingReports] = useState(false);
  const [isPreviousReportsExpanded, setIsPreviousReportsExpanded] = useState(false);
  const [recentTickets, setRecentTickets] = useState<TicketItem[]>([]);

  const previousReports = useMemo(
    () =>
      [...recentTickets]
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
        )
        .slice(0, 2),
    [recentTickets],
  );

  const fetchRecentTickets = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshingReports(true);
      } else {
        setIsLoadingReports(true);
      }

      const tickets = await ticketService.getTickets();
      setRecentTickets(tickets);
    } catch (error: any) {
      if (!showRefresh) {
        showError(
          error?.response?.data?.message ?? 'Please try again in a moment.',
          'Unable to Load Reports',
        );
      }
    } finally {
      setIsLoadingReports(false);
      setIsRefreshingReports(false);
    }
  }, [showError]);

  useFocusEffect(
    useCallback(() => {
      fetchRecentTickets();
    }, [fetchRecentTickets])
  );

  const validateForm = () => {
    if (!category) {
      showWarning('Please select a category.', 'Validation');
      return false;
    }

    if (!priority) {
      showWarning('Please select a priority.', 'Validation');
      return false;
    }

    if (!description.trim()) {
      showWarning('Please enter a description.', 'Validation');
      return false;
    }

    if (allowContact && !contactEmail.trim() && !contactPhone.trim()) {
      showWarning('Please enter an email or phone number.', 'Validation');
      return false;
    }

    if (attachments.some(item => !item.url)) {
      showWarning('Please wait for all attachments to finish uploading.', 'Validation');
      return false;
    }

    return true;
  };

  const handleAttachmentPick = useCallback(async () => {
    if (attachments.length >= MAX_TICKET_ATTACHMENTS) {
      showWarning(`You can upload up to ${MAX_TICKET_ATTACHMENTS} files.`, 'Attachment limit');
      return;
    }

      const result = await new Promise<{
      assets?: Asset[];
      didCancel?: boolean;
      errorCode?: string;
      errorMessage?: string;
    }>(resolve => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          selectionLimit: MAX_TICKET_ATTACHMENTS - attachments.length,
          quality: 0.8,
        },
        resolve
      );
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorCode) {
      showError(result.errorMessage ?? 'Unable to select images.', 'Upload Failed');
      return;
    }

    const validAssets = (result.assets ?? []).filter(asset => {
      if (!asset.uri) {
        return false;
      }

      if ((asset.fileSize ?? 0) > MAX_TICKET_ATTACHMENT_SIZE_BYTES) {
        showWarning(
          `${asset.fileName ?? 'One file'} exceeds the 5MB size limit.`,
          'File too large',
        );
        return false;
      }

      if (asset.type && !ALLOWED_ATTACHMENT_TYPES.includes(asset.type)) {
        showWarning(
          'Please upload JPG, PNG, WEBP, or GIF images only.',
          'Unsupported file type',
        );
        return false;
      }

      return true;
    });

    if (!validAssets.length) {
      return;
    }

    const pendingItems = validAssets.map((asset, index) => ({
      id: `${Date.now()}-${index}`,
      uri: asset.uri ?? '',
      fileName: asset.fileName ?? `attachment-${index + 1}.jpg`,
      type: asset.type ?? 'image/jpeg',
      size: asset.fileSize ?? 0,
      uploading: true,
    }));

    setAttachments(current => [...current, ...pendingItems]);
    setIsUploadingAttachments(true);

    for (let index = 0; index < validAssets.length; index += 1) {
      const asset = validAssets[index];
      const pendingItem = pendingItems[index];

      try {
        const url = await ticketService.uploadAttachment(asset);
        setAttachments(current =>
          current.map(item => (item.id === pendingItem.id ? { ...item, url, uploading: false } : item))
        );
      } catch (error: any) {
        setAttachments(current => current.filter(item => item.id !== pendingItem.id));
        showError(
          error?.message ?? 'Please try again with another image.',
          'Attachment Upload Failed',
        );
      }
    }

    setIsUploadingAttachments(false);
  }, [attachments.length, showError, showWarning]);

  const handleRemoveAttachment = (id: string) => {
    setAttachments(current => current.filter(item => item.id !== id));
  };

  const resetForm = () => {
    setCategory('');
    setPriority('');
    setDescription('');
    setAllowContact(false);
    setContactEmail(user?.email ?? '');
    setContactPhone('');
    setAttachments([]);
  };

  const handleSubmit = async () => {
    if (!validateForm() || !priority) {
      return;
    }

    try {
      setIsSubmitting(true);

      const ticket = await ticketService.createTicket({
        category,
        priority,
        description: description.trim(),
        attachments: attachments.map(item => item.url).filter(Boolean) as string[],
        allowContact,
        contactEmail: allowContact && contactEmail.trim() ? contactEmail.trim() : null,
        contactPhone: allowContact && contactPhone.trim() ? contactPhone.trim() : null,
      });

      resetForm();
      await fetchRecentTickets();

      showConfirm({
        title: 'Report Submitted',
        message: `Your report ${ticket.ticketId} has been created.`,
        confirmText: 'View Details',
        cancelText: 'OK',
        onConfirm: () => navigation.navigate('TicketDetail', { ticketId: ticket.ticketId }),
      });
    } catch (error: any) {
      showError(
        error?.response?.data?.message ?? 'Unable to submit your report right now.',
        'Submission Failed',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top + 12, 28),
            paddingBottom: Math.max(insets.bottom + 28, 40),
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingReports}
            onRefresh={() => fetchRecentTickets(true)}
            tintColor={TICKET_THEME.accent}
          />
        }
      >
        <TicketHeader title="Report an Issue" onBack={() => navigation.goBack()} />

        <View style={styles.helpCard}>
          <View style={styles.helpIconWrap}>
            <Ionicons name="shield-checkmark-outline" size={22} color={TICKET_THEME.accent} />
          </View>
          <View style={styles.helpTextWrap}>
            <Text style={styles.helpTitle}>Need help?</Text>
            <Text style={styles.helpDescription}>
              Describe your issue clearly and we will review it as soon as possible.
            </Text>
          </View>
        </View>

        <View style={styles.previousReportsCard}>
          <Pressable
            style={styles.previousReportsHeader}
            onPress={() => setIsPreviousReportsExpanded(current => !current)}
          >
            <Text style={styles.previousReportsTitle}>Previous Reports</Text>

            <View style={styles.previousReportsActions}>
              <Pressable
                hitSlop={8}
                onPress={() => setIsPreviousReportsExpanded(current => !current)}
                style={styles.expandIconWrap}
              >
                <Ionicons
                  name={isPreviousReportsExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={TICKET_THEME.textSecondary}
                />
              </Pressable>

              {isPreviousReportsExpanded ? (
                <Pressable
                  hitSlop={8}
                  onPress={() => navigation.navigate('TicketList')}
                  style={styles.viewAllButton}
                >
                  <Text style={styles.viewAllButtonText}>View All</Text>
                </Pressable>
              ) : null}
            </View>
          </Pressable>

          {isPreviousReportsExpanded ? (
            <View style={styles.previousReportsContent}>
              {isLoadingReports ? (
                <View style={styles.compactState}>
                  <ActivityIndicator color={TICKET_THEME.accent} />
                </View>
              ) : previousReports.length ? (
                <View style={styles.reportPreviewList}>
                  {previousReports.map(ticket => (
                    <Pressable
                      key={ticket.ticketId}
                      onPress={() =>
                        navigation.navigate('TicketDetail', {ticketId: ticket.ticketId})
                      }
                      style={styles.reportPreviewItem}
                    >
                      <View style={styles.reportPreviewTopRow}>
                        <Text style={styles.reportPreviewCategory} numberOfLines={1}>
                          {ticket.category}
                        </Text>
                        <Text style={styles.reportPreviewStatus}>{ticket.status}</Text>
                      </View>

                      <Text style={styles.reportPreviewDescription} numberOfLines={2}>
                        {ticket.description}
                      </Text>

                      <View style={styles.reportPreviewFooter}>
                        <Text style={styles.reportPreviewMeta}>
                          {ticket.ticketId} • {formatCompactDate(ticket.createdAt)}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={TICKET_THEME.textMuted}
                        />
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={styles.compactState}>
                  <Text style={styles.emptyTitle}>No reports yet</Text>
                  <Text style={styles.emptyDescription}>
                    Your submitted tickets will appear here.
                  </Text>
                </View>
              )}
            </View>
          ) : null}
        </View>

        <Text style={styles.label}>Category</Text>
        <Pressable style={styles.selector} onPress={() => setIsCategoryModalVisible(true)}>
          <Text style={[styles.selectorText, !category && styles.placeholderText]}>
            {category || 'Select a category'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={TICKET_THEME.textSecondary} />
        </Pressable>

        <Text style={styles.label}>Priority</Text>
        <PrioritySelector value={priority} onChange={setPriority} />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Explain what happened, what you expected, and any steps to reproduce it."
          placeholderTextColor={TICKET_THEME.textMuted}
          multiline
          textAlignVertical="top"
          style={styles.descriptionInput}
        />

        <Text style={styles.label}>Attachments (Optional)</Text>
        <AttachmentUploadBox
          attachments={attachments}
          isUploading={isUploadingAttachments}
          onPick={handleAttachmentPick}
          onRemove={handleRemoveAttachment}
        />

        <View style={styles.contactCard}>
          <View style={styles.contactRow}>
            <View style={styles.contactCopy}>
              <Text style={styles.contactTitle}>Allow Contact</Text>
              <Text style={styles.contactDescription}>
                Turn this on if you want us to reach you for extra details.
              </Text>
            </View>
            <Switch
              value={allowContact}
              onValueChange={value => {
                setAllowContact(value);
                if (!value) {
                  setContactPhone('');
                }
              }}
              thumbColor={allowContact ? TICKET_THEME.accent : '#f4f3f4'}
              trackColor={{ false: '#3A4035', true: `${TICKET_THEME.accent}66` }}
            />
          </View>

          {allowContact ? (
            <View style={styles.contactFields}>
              <TextInput
                value={contactEmail}
                onChangeText={setContactEmail}
                placeholder="Contact email"
                placeholderTextColor={TICKET_THEME.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.singleLineInput}
              />
              <TextInput
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="Contact phone"
                placeholderTextColor={TICKET_THEME.textMuted}
                keyboardType="phone-pad"
                style={styles.singleLineInput}
              />
            </View>
          ) : null}
        </View>

        <Pressable
          style={[styles.submitButton, (isSubmitting || isUploadingAttachments) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting || isUploadingAttachments}
        >
          {isSubmitting ? (
            <ActivityIndicator color={TICKET_THEME.background} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </Pressable>
      </ScrollView>

      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsCategoryModalVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {ISSUE_CATEGORIES.map(item => (
              <Pressable
                key={item}
                style={styles.modalOption}
                onPress={() => {
                  setCategory(item);
                  setIsCategoryModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{item}</Text>
                {category === item ? (
                  <Ionicons name="checkmark" size={18} color={TICKET_THEME.accent} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TICKET_THEME.background,
  },
  content: {
    paddingHorizontal: 18,
  },
  helpCard: {
    backgroundColor: '#14210F',
    borderColor: TICKET_THEME.cardBorder,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 20,
  },
  helpIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: TICKET_THEME.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  helpTextWrap: {
    flex: 1,
  },
  helpTitle: {
    color: TICKET_THEME.accent,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  helpDescription: {
    color: TICKET_THEME.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  previousReportsCard: {
    marginBottom: 6,
    backgroundColor: TICKET_THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TICKET_THEME.cardBorder,
    overflow: 'hidden',

  },
  previousReportsHeader: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  previousReportsTitle: {
    color: TICKET_THEME.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    flex: 1,
    paddingTop: 6,
    paddingRight: 16,
  },
  previousReportsActions: {
    alignItems: 'center',
    gap: 8,
  },
  expandIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TICKET_THEME.input,
  },
  viewAllButton: {
    minHeight: 24,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllButtonText: {
    color: TICKET_THEME.accent,
    fontSize: 12,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  previousReportsContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  compactState: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: TICKET_THEME.input,
    borderWidth: 1,
    borderColor: TICKET_THEME.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportPreviewList: {
    gap: 10,
  },
  reportPreviewItem: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: TICKET_THEME.input,
    borderWidth: 1,
    borderColor: TICKET_THEME.inputBorder,
  },
  reportPreviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  reportPreviewCategory: {
    flex: 1,
    color: TICKET_THEME.textPrimary,
    fontSize: 15,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  reportPreviewStatus: {
    color: TICKET_THEME.pending,
    fontSize: 11,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  reportPreviewDescription: {
    marginTop: 8,
    color: TICKET_THEME.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  reportPreviewFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  reportPreviewMeta: {
    flex: 1,
    color: TICKET_THEME.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  label: {
    color: TICKET_THEME.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 14,
  },
  selector: {
    backgroundColor: TICKET_THEME.input,
    borderWidth: 1,
    borderColor: TICKET_THEME.inputBorder,
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    color: TICKET_THEME.textPrimary,
    fontSize: 16,
  },
  placeholderText: {
    color: TICKET_THEME.textMuted,
  },
  descriptionInput: {
    minHeight: 150,
    borderRadius: 18,
    backgroundColor: TICKET_THEME.input,
    borderColor: TICKET_THEME.inputBorder,
    borderWidth: 1,
    color: TICKET_THEME.textPrimary,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: TICKET_THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TICKET_THEME.cardBorder,
    padding: 16,
    marginTop: 18,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactCopy: {
    flex: 1,
    paddingRight: 16,
  },
  contactTitle: {
    color: TICKET_THEME.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  contactDescription: {
    color: TICKET_THEME.textSecondary,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 19,
  },
  contactFields: {
    marginTop: 14,
    gap: 12,
  },
  singleLineInput: {
    height: 52,
    borderRadius: 14,
    backgroundColor: TICKET_THEME.input,
    borderWidth: 1,
    borderColor: TICKET_THEME.inputBorder,
    color: TICKET_THEME.textPrimary,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  submitButton: {
    marginTop: 22,
    backgroundColor: TICKET_THEME.accent,
    minHeight: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: TICKET_THEME.background,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  emptyTitle: {
    color: TICKET_THEME.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  emptyDescription: {
    color: TICKET_THEME.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: TICKET_THEME.cardStrong,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: TICKET_THEME.cardBorder,
  },
  modalTitle: {
    color: TICKET_THEME.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalOption: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: TICKET_THEME.input,
    paddingHorizontal: 14,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOptionText: {
    color: TICKET_THEME.textPrimary,
    fontSize: 15,
  },
});

export default ReportIssueScreen;
